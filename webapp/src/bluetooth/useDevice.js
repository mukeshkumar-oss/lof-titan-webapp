import { useState, useRef } from 'react';
import { ESPLoader, Transport } from 'esptool-js';

const SERVICE_UUID = "4c4f4600-7469-7461-6e00-000000000001";
const CHAR_CONTROL = "4c4f4601-7469-7461-6e00-000000000001";
const CHAR_PROG_DATA = "4c4f4602-7469-7461-6e00-000000000001";
const CHAR_STATUS = "4c4f4603-7469-7461-6e00-000000000001";
const CHAR_CONSOLE = "4c4f4604-7469-7461-6e00-000000000001";
const CHAR_DEV_INFO = "4c4f4605-7469-7461-6e00-000000000001";

/** Safe Base64 encoder for binary chunks without character encoding corruption */
function uint8ArrayToBase64(uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export function useDevice() {
  const [connectionType, setConnectionType] = useState('none'); // 'none' | 'ble' | 'serial'
  const [device, setDevice] = useState(null);
  const [deviceName, setDeviceName] = useState('');
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("DISCONNECTED");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);

  // Refs for GATT & Serial
  const charsRef = useRef({});
  const serverRef = useRef(null);
  const btDeviceRef = useRef(null);
  const serialPortRef = useRef(null);
  const serialWriterRef = useRef(null);
  const serialReaderRef = useRef(null);

  // Promise resolvers & controllers for status handshakes and upload cancellations
  const uploadStatusResolveRef = useRef(null);
  const uploadStatusRejectRef = useRef(null);
  const abortControllerRef = useRef(null);

  // ----------------------------------------------------
  // Helpers
  // ----------------------------------------------------
  const appendConsoleOutput = (text) => {
    setConsoleOutput((prev) => {
      const combined = prev + text;
      // Truncate console buffer to 10,000 characters to prevent memory leaks & UI freezes
      return combined.length > 10000 ? combined.slice(-10000) : combined;
    });
  };

  const handleStatusUpdate = (raw) => {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (data.status) {
        setStatus(data.status);
        if (uploadStatusResolveRef.current) {
          uploadStatusResolveRef.current(data.status);
        }
        if (data.status === "ERROR" && uploadStatusRejectRef.current) {
          uploadStatusRejectRef.current(new Error(data.message || data.error || "Device reported execution error"));
        }
      }
    } catch (err) {}
  };

  const waitForStatus = (targetStatus, timeout = 10000) => {
    return new Promise((resolve, reject) => {
      if (status === targetStatus) {
        resolve();
        return;
      }

      const timeoutId = setTimeout(() => {
        uploadStatusResolveRef.current = null;
        uploadStatusRejectRef.current = null;
        reject(new Error(`Timeout waiting for device status: ${targetStatus}`));
      }, timeout);

      uploadStatusResolveRef.current = (receivedStatus) => {
        if (receivedStatus === targetStatus) {
          clearTimeout(timeoutId);
          uploadStatusResolveRef.current = null;
          uploadStatusRejectRef.current = null;
          resolve();
        }
      };

      uploadStatusRejectRef.current = (err) => {
        clearTimeout(timeoutId);
        uploadStatusResolveRef.current = null;
        uploadStatusRejectRef.current = null;
        reject(err);
      };
    });
  };

  const ensureServerConnected = async (btDev, maxAttempts = 5) => {
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        // If device already reports connected, verify it is genuinely active
        if (btDev.gatt && btDev.gatt.connected) {
          try {
            const services = await btDev.gatt.getPrimaryServices();
            if (services && services.length > 0) {
              return btDev.gatt;
            }
          } catch (e) {
            // Existing session stale, will reconnect fresh
          }
        }

        // Perform fresh connection
        const server = btDev.gatt ? await btDev.gatt.connect() : await btDev.connect();
        // 300ms wait allows Windows WinRT to complete initial GATT table mapping
        await new Promise(r => setTimeout(r, 300));

        if (server && server.connected) {
          try {
            const services = await server.getPrimaryServices();
            if (services && services.length > 0) {
              return server;
            }
          } catch (e) {
            // Services not fully ready, will retry
          }
        }
      } catch (e) {
        console.warn(`[BLE] ensureServerConnected attempt ${i}/${maxAttempts} failed:`, e.message);
      }
      await new Promise(r => setTimeout(r, 350 * i)); // Progressive backoff
    }
    throw new Error('Unable to establish stable GATT connection to LOF TITAN');
  };

  const getServiceWithRetry = async (btDev, serviceUuid, maxAttempts = 5) => {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const server = await ensureServerConnected(btDev, 3);
        serverRef.current = server;
        await new Promise(r => setTimeout(r, 100));

        try {
          return await server.getPrimaryService(serviceUuid);
        } catch (e) {
          const services = await server.getPrimaryServices();
          const found = services.find(s => s.uuid.toLowerCase() === serviceUuid.toLowerCase()) || services[0];
          if (found) return found;
          throw new Error(`Service ${serviceUuid} not found`);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[BLE] getService attempt ${attempt}/${maxAttempts}:`, err.message);
        if (btDev.gatt && btDev.gatt.connected) {
          try { btDev.gatt.disconnect(); } catch (e) {}
        }
        serverRef.current = null;
        await new Promise(r => setTimeout(r, 400 * attempt));
      }
    }
    throw lastError || new Error(`Failed to retrieve service ${serviceUuid}`);
  };

  const getCharacteristicWithRetry = async (service, charUuid, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await service.getCharacteristic(charUuid);
      } catch (err) {
        console.warn(`[BLE] Get char ${charUuid} attempt ${attempt}/${maxAttempts}:`, err.message);
        await new Promise(r => setTimeout(r, 150 * attempt));
      }
    }
    throw new Error(`Failed to get characteristic ${charUuid}`);
  };

  // ----------------------------------------------------
  // BLE Connection Logic
  // ----------------------------------------------------
  const connectBLE = async () => {
    let btDevice = null;
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser. Please use Chrome or Edge.");
      }

      // 1. Clean up previous connection if any
      if (btDeviceRef.current && btDeviceRef.current.gatt) {
        try {
          btDeviceRef.current.removeEventListener('gattserverdisconnected', handleDisconnect);
          btDeviceRef.current.gatt.disconnect();
          await new Promise(r => setTimeout(r, 200));
        } catch (e) {}
      }

      // 2. Request device
      btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "LOF_TITAN" }],
        optionalServices: [SERVICE_UUID]
      });

      btDeviceRef.current = btDevice;

      // 3. Obtain Service with automatic resilience
      const service = await getServiceWithRetry(btDevice, SERVICE_UUID, 5);

      // 4. Retrieve characteristics with retry
      charsRef.current.control = await getCharacteristicWithRetry(service, CHAR_CONTROL);
      charsRef.current.progData = await getCharacteristicWithRetry(service, CHAR_PROG_DATA);

      const statusChar = await getCharacteristicWithRetry(service, CHAR_STATUS);
      charsRef.current.status = statusChar;
      try {
        await statusChar.startNotifications();
        statusChar.addEventListener('characteristicvaluechanged', (e) => {
          const raw = new TextDecoder().decode(e.target.value);
          handleStatusUpdate(raw);
        });
      } catch (err) {
        console.warn("Status notifications warning:", err);
      }

      const consoleChar = await getCharacteristicWithRetry(service, CHAR_CONSOLE);
      charsRef.current.console = consoleChar;
      try {
        await consoleChar.startNotifications();
        consoleChar.addEventListener('characteristicvaluechanged', (e) => {
          const raw = new TextDecoder().decode(e.target.value);
          appendConsoleOutput(raw);
        });
      } catch (err) {
        console.warn("Console notifications warning:", err);
      }

      try {
        const devInfoChar = await getCharacteristicWithRetry(service, CHAR_DEV_INFO);
        const devInfoRaw = await devInfoChar.readValue();
        const devInfoStr = new TextDecoder().decode(devInfoRaw);
        setDeviceInfo(JSON.parse(devInfoStr));
      } catch (e) {}

      // 5. Bind disconnect event listener
      btDevice.removeEventListener('gattserverdisconnected', handleDisconnect);
      btDevice.addEventListener('gattserverdisconnected', handleDisconnect);

      // 6. Update connected state
      setDevice(btDevice);
      setDeviceName(btDevice.name || "LOF_TITAN (BLE)");
      setConnectionType('ble');
      setConnected(true);
      setStatus("CONNECTED_IDLE");

      // 7. Send CONNECT handshake packet to activate ESP32 stdout streaming & tone
      if (charsRef.current.control) {
        try {
          const payload = JSON.stringify({ cmd: "CONNECT" });
          await charsRef.current.control.writeValueWithResponse(new TextEncoder().encode(payload));
        } catch (e) {
          console.warn("[BLE] Connect handshake note:", e.message);
        }
      }

    } catch (error) {
      console.error("BLE connection error:", error);
      if (btDevice && btDevice.gatt) {
        try { btDevice.gatt.disconnect(); } catch (e) {}
      }
      handleDisconnect();
      if (error.name !== "NotFoundError") {
        alert("BLE Connection failed: " + error.message);
      }
    }
  };

  // ----------------------------------------------------
  // Serial (COM Port) Connection Logic
  // ----------------------------------------------------
  const connectSerial = async () => {
    try {
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;

      const writer = port.writable.getWriter();
      serialWriterRef.current = writer;

      setDevice(port);
      setDeviceName("ESP32-S3 (COM Port)");
      setConnectionType('serial');
      setConnected(true);
      setStatus("CONNECTED_IDLE");

      // Start serial stream reading loop
      readSerialLoop(port);

      // Send CONNECT command to S3 hardware over UART to play buzzer tone
      try {
        await writer.write(new TextEncoder().encode(JSON.stringify({ cmd: "CONNECT" }) + "\n"));
      } catch (e) {}

    } catch (error) {
      console.error("Serial connection error:", error);
      alert("Serial Connection failed: " + error.message);
    }
  };

  const readSerialLoop = async (port) => {
    try {
      const textDecoderStream = new TextDecoderStream();
      port.readable.pipeTo(textDecoderStream.writable).catch(() => {});
      const reader = textDecoderStream.readable.getReader();
      serialReaderRef.current = reader;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          appendConsoleOutput(value);
        }
      }
    } catch (err) {
      console.error("Serial read loop error:", err);
    }
  };

  // ----------------------------------------------------
  // Disconnect Handler
  // ----------------------------------------------------
  const disconnect = () => {
    // Abort ongoing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (uploadStatusRejectRef.current) {
      uploadStatusRejectRef.current(new Error("Device disconnected"));
      uploadStatusRejectRef.current = null;
      uploadStatusResolveRef.current = null;
    }

    if (btDeviceRef.current && btDeviceRef.current.gatt) {
      try {
        btDeviceRef.current.removeEventListener('gattserverdisconnected', handleDisconnect);
        if (btDeviceRef.current.gatt.connected) {
          btDeviceRef.current.gatt.disconnect();
        }
      } catch (e) {}
    } else if (serialPortRef.current) {
      try {
        if (serialReaderRef.current) {
          serialReaderRef.current.cancel();
        }
        if (serialWriterRef.current) {
          serialWriterRef.current.releaseLock();
        }
        serialPortRef.current.close();
      } catch (e) {}
    }
    handleDisconnect();
  };

  const handleDisconnect = () => {
    setDevice(null);
    setDeviceName('');
    setConnected(false);
    setConnectionType('none');
    setStatus("DISCONNECTED");
    serverRef.current = null;
    btDeviceRef.current = null;
    charsRef.current = {};
    serialPortRef.current = null;
    serialWriterRef.current = null;
    serialReaderRef.current = null;
  };

  // ----------------------------------------------------
  // Send Commands (RUN, STOP, RESET, etc.)
  // ----------------------------------------------------
  const sendCommand = async (cmd, extra = {}) => {
    const payloadStr = JSON.stringify({ cmd, ...extra });

    if (connectionType === 'ble' && charsRef.current.control) {
      const payloadBytes = new TextEncoder().encode(payloadStr);
      const CHUNK_SIZE = 20; // Force 20-byte chunks to bypass MTU limits on Windows/WebBLE
      for (let i = 0; i < payloadBytes.length; i += CHUNK_SIZE) {
        const chunk = payloadBytes.slice(i, i + CHUNK_SIZE);
        await charsRef.current.control.writeValueWithResponse(chunk);
      }
    } else if (connectionType === 'serial' && serialWriterRef.current) {
      await serialWriterRef.current.write(new TextEncoder().encode(payloadStr + "\n"));
    }
  };

  // ----------------------------------------------------
  // Program Upload Handler
  // ----------------------------------------------------
  const uploadProgram = async (filename, code, setUploadProgress) => {
    setConsoleOutput("");
    const codeBytes = new TextEncoder().encode(code);
    const size = codeBytes.length;
    const checksum = codeBytes.reduce((a, b) => a + b, 0);

    // Create new abort signal for this upload session
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      // 1. Send PROGRAM command
      await sendCommand("PROGRAM", { filename, size, checksum });

      // 2. Wait for ESP32 supervisor to confirm PROGRAMMING state
      try {
        await waitForStatus("PROGRAMMING", 6000);
      } catch (e) {
        console.warn("Proceeding after PROGRAM command note:", e.message);
      }

      if (signal.aborted) throw new Error("Upload cancelled");

      if (connectionType === 'ble' && charsRef.current.progData) {
        const BLE_CHUNK_SIZE = 18; // 18 bytes data + 2 bytes seq = 20 bytes total (MTU limit)
        const totalChunks = Math.ceil(size / BLE_CHUNK_SIZE);

        for (let i = 0; i < size; i += BLE_CHUNK_SIZE) {
          if (signal.aborted) throw new Error("Upload cancelled");

          const chunk = codeBytes.slice(i, i + BLE_CHUNK_SIZE);
          const seqNumber = Math.floor(i / BLE_CHUNK_SIZE);

          const buffer = new Uint8Array(2 + chunk.length);
          buffer[0] = (seqNumber >> 8) & 0xFF;
          buffer[1] = seqNumber & 0xFF;
          buffer.set(chunk, 2);

          // Retry logic: up to 3 attempts per chunk
          let success = false;
          let lastErr = null;
          for (let retry = 0; retry < 3; retry++) {
            try {
              await charsRef.current.progData.writeValueWithResponse(buffer);
              success = true;
              break;
            } catch (err) {
              lastErr = err;
              console.warn(`[BLE] Chunk ${seqNumber} retry ${retry + 1}/3:`, err.message);
              await new Promise(r => setTimeout(r, 40 * (retry + 1)));
            }
          }

          if (!success) {
            throw new Error(`Failed to transmit chunk ${seqNumber}: ` + (lastErr?.message || "Unknown error"));
          }

          if (setUploadProgress) setUploadProgress(Math.round(((seqNumber + 1) / totalChunks) * 100));
          // 20ms pacing to prevent ESP32 NimBLE queue congestion
          await new Promise(r => setTimeout(r, 20));
        }

      } else if (connectionType === 'serial' && serialWriterRef.current) {
        const SERIAL_CHUNK_SIZE = 64;
        const totalChunks = Math.ceil(size / SERIAL_CHUNK_SIZE);

        for (let i = 0; i < size; i += SERIAL_CHUNK_SIZE) {
          if (signal.aborted) throw new Error("Upload cancelled");

          const chunk = codeBytes.slice(i, i + SERIAL_CHUNK_SIZE);
          const seqNumber = Math.floor(i / SERIAL_CHUNK_SIZE);
          const b64Data = uint8ArrayToBase64(chunk);

          const chunkMsg = JSON.stringify({ cmd: "CHUNK", seq: seqNumber, data: b64Data }) + "\n";
          await serialWriterRef.current.write(new TextEncoder().encode(chunkMsg));

          if (setUploadProgress) setUploadProgress(Math.round(((seqNumber + 1) / totalChunks) * 100));
          await new Promise(r => setTimeout(r, 20));
        }
      }

      if (signal.aborted) throw new Error("Upload cancelled");

      // 3. Wait for PROGRAM_SAVED confirmation from ESP32 before executing RUN
      try {
        await waitForStatus("PROGRAM_SAVED", 8000);
      } catch (e) {
        console.warn("PROGRAM_SAVED wait fallback:", e.message);
      }

      // 4. Send RUN command
      await sendCommand("RUN");

    } finally {
      abortControllerRef.current = null;
    }
  };

  const clearConsole = () => setConsoleOutput("");

  const writeToSerial = async (text) => {
    if (connectionType === 'serial' && serialWriterRef.current) {
      await serialWriterRef.current.write(new TextEncoder().encode(text));
    } else if (connectionType === 'ble' && charsRef.current.control) {
      const payloadBytes = new TextEncoder().encode(text);
      const CHUNK_SIZE = 20;
      for (let i = 0; i < payloadBytes.length; i += CHUNK_SIZE) {
        const chunk = payloadBytes.slice(i, i + CHUNK_SIZE);
        await charsRef.current.control.writeValueWithResponse(chunk);
      }
    }
  };

  // ----------------------------------------------------
  // Firmware Flasher (via Web Serial esptool-js)
  // ----------------------------------------------------
  const flashFirmware = async (setProgress) => {
    if (connectionType !== 'none') {
      await disconnect();
    }

    let transport = null;
    try {
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API is not supported. Please use Chrome or Edge.");
      }

      setProgress({ state: 'Selecting port...', percent: 0 });
      const port = await navigator.serial.requestPort();
      
      setProgress({ state: 'Connecting to ESP32-S3 Bootloader...', percent: 5 });
      transport = new Transport(port);
      const esploader = new ESPLoader({
        transport,
        baudrate: 460800,
        terminal: {
          clean: () => {},
          writeLine: (data) => console.log("[ESPTOOL]", data),
          write: (data) => console.log("[ESPTOOL]", data)
        }
      });

      const loader = await esploader.main();
      
      setProgress({ state: 'Downloading firmware files...', percent: 8 });
      const [bootloaderData, partitionsData, appData] = await Promise.all([
        fetch('/firmware/bootloader.bin').then(r => r.arrayBuffer()),
        fetch('/firmware/partitions.bin').then(r => r.arrayBuffer()),
        fetch('/firmware/micropython.bin').then(r => r.arrayBuffer())
      ]);
      
      setProgress({ state: 'Flashing...', percent: 10 });
      
      const fileArray = [
        { data: new Uint8Array(bootloaderData), address: 0x0 },
        { data: new Uint8Array(partitionsData), address: 0x8000 },
        { data: new Uint8Array(appData), address: 0x10000 }
      ];
      
      const flashOptions = {
        fileArray: fileArray,
        flashSize: 'keep',
        flashMode: 'dio',
        flashFreq: '80m',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const p = Math.round((written / total) * 100);
          setProgress({ state: `Flashing file ${fileIndex + 1} of 3...`, percent: p });
        }
      };
      
      await loader.writeFlash(flashOptions);
      
      setProgress({ state: 'Resetting device...', percent: 100 });
      await transport.setDTR(false);
      await transport.setRTS(true);
      await new Promise(r => setTimeout(r, 100));
      await transport.setDTR(false);
      await transport.setRTS(false);
      
      await transport.disconnect();
      transport = null;
      
      alert("Firmware Flashed Successfully! Please reconnect to the COM port.");
      setProgress(null);
      
    } catch (e) {
      console.error("[FLASHER ERROR]", e);
      if (transport) {
        try { await transport.disconnect(); } catch (_) {}
      }
      alert("Flashing failed: " + e.message);
      setProgress(null);
    }
  };

  return {
    connectBLE,
    connectSerial,
    disconnect,
    disconnectBLE: disconnect,
    disconnectSerial: disconnect,
    connected,
    isConnected: connected,
    connectionType,
    device,
    deviceName,
    status,
    consoleOutput,
    deviceInfo,
    sendCommand,
    runCode: () => sendCommand("RUN"),
    stopExecution: () => sendCommand("STOP"),
    softReset: () => sendCommand("RESET"),
    uploadProgram,
    clearConsole,
    flashFirmware,
    writeToSerial
  };
}
