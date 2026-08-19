import { useState, useRef } from 'react';
import { ESPLoader, Transport } from 'esptool-js';

const SERVICE_UUID = "4c4f4600-7469-7461-6e00-000000000001";
const CHAR_CONTROL = "4c4f4601-7469-7461-6e00-000000000001";
const CHAR_PROG_DATA = "4c4f4602-7469-7461-6e00-000000000001";
const CHAR_STATUS = "4c4f4603-7469-7461-6e00-000000000001";
const CHAR_CONSOLE = "4c4f4604-7469-7461-6e00-000000000001";
const CHAR_DEV_INFO = "4c4f4605-7469-7461-6e00-000000000001";

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
  const serialPortRef = useRef(null);
  const serialWriterRef = useRef(null);
  const serialReaderRef = useRef(null);

  // ----------------------------------------------------
  // BLE Connection Logic
  // ----------------------------------------------------
  const connectBLE = async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser.");
      }

      const btDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "LOF_TITAN" }],
        optionalServices: [SERVICE_UUID]
      });

      btDevice.addEventListener('gattserverdisconnected', handleDisconnect);

      const server = await btDevice.gatt.connect();
      serverRef.current = server;

      const service = await server.getPrimaryService(SERVICE_UUID);

      charsRef.current.control = await service.getCharacteristic(CHAR_CONTROL);
      charsRef.current.progData = await service.getCharacteristic(CHAR_PROG_DATA);

      const statusChar = await service.getCharacteristic(CHAR_STATUS);
      charsRef.current.status = statusChar;
      await statusChar.startNotifications();
      statusChar.addEventListener('characteristicvaluechanged', (e) => {
        const raw = new TextDecoder().decode(e.target.value);
        try {
          const data = JSON.parse(raw);
          if (data.status) setStatus(data.status);
        } catch (err) {}
      });

      const consoleChar = await service.getCharacteristic(CHAR_CONSOLE);
      charsRef.current.console = consoleChar;
      await consoleChar.startNotifications();
      consoleChar.addEventListener('characteristicvaluechanged', (e) => {
        const raw = new TextDecoder().decode(e.target.value);
        setConsoleOutput(prev => prev + raw);
      });

      try {
        const devInfoChar = await service.getCharacteristic(CHAR_DEV_INFO);
        const devInfoRaw = await devInfoChar.readValue();
        const devInfoStr = new TextDecoder().decode(devInfoRaw);
        setDeviceInfo(JSON.parse(devInfoStr));
      } catch (e) {}

      setDevice(btDevice);
      setDeviceName(btDevice.name || "LOF_TITAN (BLE)");
      setConnectionType('ble');
      setConnected(true);
      setStatus("CONNECTED_IDLE");

      // Notify firmware over GATT to trigger S3 connect tone
      try {
        const payload = JSON.stringify({ cmd: "CONNECT" });
        await charsRef.current.control.writeValue(new TextEncoder().encode(payload));
      } catch (e) {}

    } catch (error) {
      console.error("BLE connection error:", error);
      alert("BLE Connection failed: " + error.message);
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
          setConsoleOutput(prev => prev + value);
        }
      }
    } catch (err) {
      console.error("Serial read loop error:", err);
    }
  };

  // ----------------------------------------------------
  // Disconnect Handler
  // ----------------------------------------------------
  const disconnect = async () => {
    try {
      // Send DISCONNECT command to trigger S3 hardware disconnect tone
      await sendCommand("DISCONNECT");
    } catch (e) {}

    if (connectionType === 'ble' && device && device.gatt && device.gatt.connected) {
      device.gatt.disconnect();
    } else if (connectionType === 'serial' && serialPortRef.current) {
      try {
        if (serialReaderRef.current) {
          await serialReaderRef.current.cancel();
        }
        if (serialWriterRef.current) {
          serialWriterRef.current.releaseLock();
        }
        await serialPortRef.current.close();
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

    // Send PROGRAM command and wait for ESP32 to prepare file and stop running program
    await sendCommand("PROGRAM", { filename, size, checksum });
    await new Promise(r => setTimeout(r, 400));

    if (connectionType === 'ble' && charsRef.current.progData) {
      // Direct raw binary transmission over BLE Characteristic
      const BLE_CHUNK_SIZE = 18; // 18 bytes data + 2 bytes seq = 20 bytes total (MTU limit)
      const totalChunks = Math.ceil(size / BLE_CHUNK_SIZE);

      for (let i = 0; i < size; i += BLE_CHUNK_SIZE) {
        const chunk = codeBytes.slice(i, i + BLE_CHUNK_SIZE);
        const seqNumber = Math.floor(i / BLE_CHUNK_SIZE);

        const buffer = new Uint8Array(2 + chunk.length);
        buffer[0] = (seqNumber >> 8) & 0xFF;
        buffer[1] = seqNumber & 0xFF;
        buffer.set(chunk, 2);

        await charsRef.current.progData.writeValueWithResponse(buffer);
        if (setUploadProgress) setUploadProgress(Math.round(((seqNumber + 1) / totalChunks) * 100));
        // Add a slight delay to avoid overwhelming the BLE stack
        await new Promise(r => setTimeout(r, 10));
      }

      await new Promise(r => setTimeout(r, 500));
      await sendCommand("RUN");

    } else if (connectionType === 'serial' && serialWriterRef.current) {
      // Base64 JSON CHUNK transmission over Serial COM Port
      // Reduce chunk size to 64 to prevent UART buffer overflow (256b limit)
      const SERIAL_CHUNK_SIZE = 64;
      const totalChunks = Math.ceil(size / SERIAL_CHUNK_SIZE);

      for (let i = 0; i < size; i += SERIAL_CHUNK_SIZE) {
        const chunk = codeBytes.slice(i, i + SERIAL_CHUNK_SIZE);
        const seqNumber = Math.floor(i / SERIAL_CHUNK_SIZE);
        
        let binary = '';
        for (let j = 0; j < chunk.length; j++) {
          binary += String.fromCharCode(chunk[j]);
        }
        const b64data = btoa(binary);

        await sendCommand("CHUNK", { seq: seqNumber, data: b64data });
        if (setUploadProgress) setUploadProgress(Math.round(((seqNumber + 1) / totalChunks) * 100));
        // Wait 150ms to give the ESP32 Python loop enough time to read the UART buffer char-by-char
        await new Promise(r => setTimeout(r, 150));
      }

      await new Promise(r => setTimeout(r, 500));
      await sendCommand("RUN");
    }
  };

  const writeToSerial = async (text) => {
    if (connectionType === 'serial' && serialWriterRef.current) {
      await serialWriterRef.current.write(new TextEncoder().encode(text));
    } else if (connectionType === 'ble') {
      console.warn("Raw Serial REPL input is not fully supported over BLE in the current firmware version.");
    }
  };

  const clearConsole = () => setConsoleOutput("");

  // ----------------------------------------------------
  // Firmware Flashing using esptool-js
  // ----------------------------------------------------
  const flashFirmware = async (setProgress) => {
    try {
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API is not supported in this browser.");
      }
      
      // We must disconnect any active connection so port isn't locked
      if (connected) {
        await disconnect();
      }

      setProgress({ state: 'Fetching firmware files...', percent: 0 });
      const [bootloaderData, partitionsData, appData] = await Promise.all([
        fetch('/firmware/bootloader.bin').then(r => r.arrayBuffer()),
        fetch('/firmware/partitions.bin').then(r => r.arrayBuffer()),
        fetch('/firmware/micropython.bin').then(r => r.arrayBuffer())
      ]);

      setProgress({ state: 'Select COM port to flash...', percent: 0 });
      const port = await navigator.serial.requestPort();
      
      // Transport from esptool-js handles opening the port
      const transport = new Transport(port, true);
      const loader = new ESPLoader({
        transport,
        baudrate: 460800,
        terminal: {
          clean: () => {},
          writeLine: (data) => console.log(data),
          write: (data) => console.log(data)
        }
      });
      
      setProgress({ state: 'Connecting to ESP32...', percent: 5 });
      await loader.main();
      
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
      
      alert("Firmware Flashed Successfully! Please reconnect to the COM port.");
      setProgress(null);
      
    } catch (e) {
      console.error(e);
      alert("Flashing failed: " + e.message);
      setProgress(null);
    }
  };

  return {
    connectBLE,
    connectSerial,
    disconnect,
    connected,
    connectionType,
    device,
    deviceName,
    status,
    consoleOutput,
    deviceInfo,
    sendCommand,
    uploadProgram,
    clearConsole,
    flashFirmware,
    writeToSerial
  };
}
