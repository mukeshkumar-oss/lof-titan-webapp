import { titanAudio } from './TitanAudioSynthesizer.js';

/**
 * LOF TITAN Hardware Simulation Engine
 * Full MicroPython Execution Runtime & AST Transpiler.
 * Accurately simulates Rover robotics, 3-UV sensors, Wi-Fi AP, Motor Drivers, OLED, and peripherals.
 */
export class TitanSimulatorEngine {
  constructor() {
    this.listeners = new Set();
    this.logListeners = new Set();
    this.isRunning = false;
    this.isPaused = false;
    this.executionSpeed = 1.0;
    this.abortController = null;

    this.state = this._getInitialState();
  }

  _getInitialState() {
    return {
      motors: {
        M1: { dir: 'STOP', speed: 0, pinA: 15, pinB: 16, dutyA: 0, dutyB: 0 },
        M2: { dir: 'STOP', speed: 0, pinA: 13, pinB: 14, dutyA: 0, dutyB: 0 },
        M3: { dir: 'STOP', speed: 0, pinA: 11, pinB: 12, dutyA: 0, dutyB: 0 },
        M4: { dir: 'STOP', speed: 0, pinA: 9, pinB: 10, dutyA: 0, dutyB: 0 },
        M5: { dir: 'STOP', speed: 0, pinA: 9, pinB: 10, dutyA: 0, dutyB: 0 },
        M6: { dir: 'STOP', speed: 0, pinA: 11, pinB: 12, dutyA: 0, dutyB: 0 },
      },
      servos: { 2: 90, 1: 90, 3: 90, 4: 90, 5: 90 },
      leds: { led1: false, led2: false },
      buzzer: { active: false, freq: 0, tone: null },
      oled: {
        initialized: true,
        type: 'SSD1306',
        textLines: [],
        pixels: [],
        version: Date.now(),
      },
      buttons: { 39: false, 40: false, 41: false, 42: false },
      sensors: {
        2: { value: 1200, type: 'light', digital: 0 },
        1: { value: 2048, type: 'potentiometer', digital: 1 },
        3: { value: 500,  type: 'flame', digital: 0 },
        4: { value: 3200, type: 'line', digital: 1 },
        5: { value: 800,  type: 'motion', digital: 0 },
      },
      digitalOutputs: { 2: 0, 1: 0, 3: 0, 4: 0, 5: 0 },
      ultrasonic: { distanceCm: 25.0 },
      pulseSensor: {
        initialized: false,
        fingerDetected: true,
        bpm: 74,
        ir: 45000,
        red: 38000,
      },
      activeSensors: {
        2: false, // S1 (GPIO 2)
        1: false, // S2 (GPIO 1)
        3: false, // S3 (GPIO 3)
        4: false, // S4 (GPIO 4)
        5: false, // S5 (GPIO 5)
        ultrasonic: false,
        pulse: false,
      },
      telemetry: {
        cycleCount: 0,
        uptimeMs: 0,
        activeBlockId: null,
      }
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this._getSnapshot());
    return () => this.listeners.delete(callback);
  }

  subscribeLogs(callback) {
    this.logListeners.add(callback);
    return () => this.logListeners.delete(callback);
  }

  _getSnapshot() {
    return {
      ...this.state,
      motors: { ...this.state.motors },
      servos: { ...this.state.servos },
      leds: { ...this.state.leds },
      buzzer: { ...this.state.buzzer },
      oled: {
        ...this.state.oled,
        textLines: [...this.state.oled.textLines],
        pixels: [...this.state.oled.pixels],
      },
      buttons: { ...this.state.buttons },
      sensors: { ...this.state.sensors },
      ultrasonic: { ...this.state.ultrasonic },
      pulseSensor: { ...this.state.pulseSensor },
      activeSensors: { ...this.state.activeSensors },
      telemetry: { ...this.state.telemetry },
    };
  }

  _notify() {
    const snapshot = this._getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  log(msg) {
    const text = String(msg);
    console.log("[TITAN LOG]", text);
    for (const listener of this.logListeners) {
      listener(text);
    }
  }

  // ================= Hardware Mutators =================

  setButtonState(pin, isPressed) {
    if (this.state.buttons[pin] !== undefined) {
      this.state.buttons[pin] = isPressed;
      this._notify();
    }
  }

  setSensorValue(pin, val, type = null) {
    if (this.state.sensors[pin]) {
      this.state.sensors[pin].value = Math.max(0, Math.min(4095, Math.round(val)));
      this.state.sensors[pin].digital = val > 2000 ? 1 : 0;
      if (type) this.state.sensors[pin].type = type;
      this._notify();
    }
  }

  setUltrasonicDistance(cm) {
    this.state.ultrasonic.distanceCm = Math.max(2, Math.min(400, parseFloat(cm)));
    this._notify();
  }

  setPulseSensorState(params) {
    this.state.pulseSensor = {
      ...this.state.pulseSensor,
      ...params
    };
    this.state.activeSensors.pulse = true;
    this._notify();
  }

  detectActiveSensors(codeString, workspace = null) {
    const active = {
      2: false,
      1: false,
      3: false,
      4: false,
      5: false,
      ultrasonic: false,
      pulse: false,
    };

    if (codeString) {
      const code = String(codeString);
      // S1 (GPIO 2)
      if (/\b(S1|PIN_UV_LEFT|adc_left)\b/i.test(code) || /ADC\(Pin\(2\)/.test(code) || /read_analog_sensor\(2\)/i.test(code) || /Pin\(2\b/i.test(code)) {
        active[2] = true;
      }
      // S2 (GPIO 1)
      if (/\b(S2|PIN_UV_FRONT|adc_front)\b/i.test(code) || /ADC\(Pin\(1\)/.test(code) || /read_analog_sensor\(1\)/i.test(code) || /Pin\(1\b/i.test(code)) {
        active[1] = true;
      }
      // S3 (GPIO 3)
      if (/\b(S3|PIN_UV_RIGHT|adc_right)\b/i.test(code) || /ADC\(Pin\(3\)/.test(code) || /read_analog_sensor\(3\)/i.test(code) || /Pin\(3\b/i.test(code)) {
        active[3] = true;
      }
      // S4 (GPIO 4)
      if (/\b(S4)\b/i.test(code) || /ADC\(Pin\(4\)/.test(code) || /read_analog_sensor\(4\)/i.test(code) || /Pin\(4\b/i.test(code)) {
        active[4] = true;
      }
      // S5 (GPIO 5)
      if (/\b(S5)\b/i.test(code) || /ADC\(Pin\(5\)/.test(code) || /read_analog_sensor\(5\)/i.test(code) || /Pin\(5\b/i.test(code)) {
        active[5] = true;
      }
      // Ultrasonic (Trig 6, Echo 19)
      if (/ultrasonic/i.test(code) || /read_ultrasonic/i.test(code) || /read_distance/i.test(code) || /Pin\(6\)/.test(code) || /Pin\(19\)/.test(code)) {
        active.ultrasonic = true;
      }
      // Pulse & Heart Rate
      if (/pulse/i.test(code) || /max3010/i.test(code) || /bpm/i.test(code) || /heart/i.test(code) || /spo2/i.test(code)) {
        active.pulse = true;
      }
    }

    if (workspace && typeof workspace.getAllBlocks === 'function') {
      const blocks = workspace.getAllBlocks(false);
      for (const b of blocks) {
        if (b.type === 'titan_ultrasonic_read') active.ultrasonic = true;
        if (b.type === 'titan_pulse_read' || b.type === 'titan_pulse_is_finger') active.pulse = true;
        if (b.type === 'titan_analog_sensor' || b.type === 'titan_digital_sensor' || b.type === 'titan_sensor_pin') {
          const pinVal = parseInt(b.getFieldValue('PIN') || b.getFieldValue('PORT') || 0, 10);
          if (pinVal && active[pinVal] !== undefined) active[pinVal] = true;
        }
      }
    }

    this.state.activeSensors = active;
    this._notify();
    return active;
  }

  toggleSensorActive(sensorKey) {
    if (this.state.activeSensors[sensorKey] !== undefined) {
      this.state.activeSensors[sensorKey] = !this.state.activeSensors[sensorKey];
      this._notify();
    }
  }

  // ================= Execution & Control =================

  async delay(ms) {
    const actualMs = Math.max(1, Math.round(ms / (this.executionSpeed || 1)));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), actualMs);
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error("SIMULATION_ABORTED"));
        });
      }
    });
  }

  async checkYield() {
    if (this.abortController?.signal.aborted) {
      throw new Error("SIMULATION_ABORTED");
    }
    while (this.isPaused && !this.abortController?.signal.aborted) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  setMotor(channel, dir, speed) {
    const s = Math.max(0, Math.min(100, Math.round(speed)));
    const chs = channel === 'ALL' ? ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] : [channel];
    chs.forEach(ch => {
      if (this.state.motors[ch]) {
        this.state.motors[ch].dir = dir;
        this.state.motors[ch].speed = dir === 'STOP' ? 0 : s;
        if (dir === 'FORWARD') {
          this.state.motors[ch].dutyA = s;
          this.state.motors[ch].dutyB = 0;
        } else if (dir === 'BACKWARD') {
          this.state.motors[ch].dutyA = 0;
          this.state.motors[ch].dutyB = s;
        } else {
          this.state.motors[ch].dutyA = 0;
          this.state.motors[ch].dutyB = 0;
        }
      }
    });
    this._notify();
  }

  driveRover(direction, speed) {
    const s = Math.max(0, Math.min(100, Math.round(speed)));
    switch (direction) {
      case 'FORWARD':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'BACKWARD':
        this.setMotor('M1', 'BACKWARD', s);
        this.setMotor('M2', 'BACKWARD', s);
        break;
      case 'LEFT':
        this.setMotor('M1', 'STOP', 0);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'RIGHT':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'STOP', 0);
        break;
      case 'SPIN_LEFT':
        this.setMotor('M1', 'BACKWARD', s);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'SPIN_RIGHT':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'BACKWARD', s);
        break;
      default:
        this.setMotor('M1', 'STOP', 0);
        this.setMotor('M2', 'STOP', 0);
    }
  }

  stopMotors(channel = 'ALL') {
    this.setMotor(channel, 'STOP', 0);
  }

  setServo(pin, angle) {
    const a = Math.max(0, Math.min(180, Math.round(angle)));
    this.state.servos[pin] = a;
    this._notify();
  }

  setLed(ledKey, state) {
    const applyState = (curr, target) => {
      if (target === 'ON' || target === 1 || target === true) return true;
      if (target === 'OFF' || target === 0 || target === false) return false;
      if (target === 'TOGGLE') return !curr;
      return Boolean(target);
    };

    if (ledKey === '47' || ledKey === 47 || ledKey === 'BOTH') {
      this.state.leds.led1 = applyState(this.state.leds.led1, state);
    }
    if (ledKey === '48' || ledKey === 48 || ledKey === 'BOTH') {
      this.state.leds.led2 = applyState(this.state.leds.led2, state);
    }
    this._notify();
  }

  playBuzzerTone(toneName) {
    this.state.buzzer = { active: true, freq: 0, tone: toneName };
    this._notify();
    titanAudio.playMelody(toneName);
    setTimeout(() => {
      this.state.buzzer.active = false;
      this._notify();
    }, 400);
  }

  playBuzzerFreq(freq, durationMs = 200) {
    this.state.buzzer = { active: true, freq, tone: null };
    this._notify();
    titanAudio.playTone(freq, durationMs);
    setTimeout(() => {
      this.state.buzzer.active = false;
      this._notify();
    }, durationMs);
  }

  stopBuzzer() {
    this.state.buzzer = { active: false, freq: 0, tone: null };
    this._notify();
    titanAudio.stop();
  }

  initOLED(type = 'SSD1306') {
    this.state.oled = {
      initialized: true,
      type,
      textLines: [],
      pixels: [],
      version: Date.now()
    };
    this._notify();
  }

  oledText(text, x = 0, y = 0, size = 1, color = '#38bdf8') {
    if (!this.state.oled.initialized) {
      this.initOLED();
    }
    const posX = parseInt(x, 10) || 0;
    const posY = parseInt(y, 10) || 0;
    const textSize = parseInt(size, 10) || 1;
    const lineHeight = textSize * 8;

    const filtered = this.state.oled.textLines.filter(
      item => !(Math.abs(item.y - posY) < lineHeight && Math.abs(item.x - posX) < 50)
    );

    filtered.push({
      text: String(text),
      x: posX,
      y: posY,
      size: textSize,
      color
    });

    if (filtered.length > 25) {
      filtered.shift();
    }

    this.state.oled = {
      ...this.state.oled,
      textLines: filtered,
      version: Date.now()
    };
    this._notify();
  }

  oledClear() {
    this.state.oled = {
      ...this.state.oled,
      textLines: [],
      pixels: [],
      version: Date.now()
    };
    this._notify();
  }

  readAnalogSensor(pin) {
    if (this.state.activeSensors[pin] !== undefined && !this.state.activeSensors[pin]) {
      this.state.activeSensors[pin] = true;
      this._notify();
    }
    return this.state.sensors[pin]?.value ?? 0;
  }

  readDigitalSensor(pin) {
    if (this.state.activeSensors[pin] !== undefined && !this.state.activeSensors[pin]) {
      this.state.activeSensors[pin] = true;
      this._notify();
    }
    return this.state.sensors[pin]?.digital ?? 0;
  }

  writeDigitalOutput(pin, val) {
    this.state.digitalOutputs[pin] = val ? 1 : 0;
    if (pin === 47) this.setLed('47', val);
    if (pin === 48) this.setLed('48', val);
    if ([15, 16, 13, 14, 11, 12, 9, 10].includes(pin)) {
      this._handlePwmDuty(pin, val ? 100 : 0);
    }
    this._notify();
  }

  readUltrasonicDistance(unit = 'CM') {
    if (!this.state.activeSensors.ultrasonic) {
      this.state.activeSensors.ultrasonic = true;
      this._notify();
    }
    const cm = this.state.ultrasonic.distanceCm;
    if (unit === 'INCHES' || unit === 'inch') return cm / 2.54;
    if (unit === 'MM') return cm * 10;
    return cm;
  }

  isButtonPressed(pin) {
    return Boolean(this.state.buttons[pin]);
  }

  // ================= 1. Blockly Workspace Interpreter =================

  async runBlocklyWorkspace(workspace) {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    this.log("=== LOF TITAN SIMULATION REPL ACTIVE ===");
    this.initOLED();

    try {
      const topBlocks = workspace.getTopBlocks(true);
      if (!topBlocks || topBlocks.length === 0) {
        this.log("⚠️ No blocks found in workspace.");
        this.stop();
        return;
      }

      const startBlock = topBlocks.find(b => b.type === 'titan_start');
      if (startBlock && startBlock.getInputTargetBlock('DO')) {
        await this._executeBlockSequence(startBlock.getInputTargetBlock('DO'));
      } else {
        for (const blk of topBlocks) {
          if (blk.type !== 'project_info' && blk.type !== 'titan_start') {
            await this._executeBlockSequence(blk);
          }
        }
      }

      this.log(">>> Simulation completed.");
    } catch (err) {
      if (err.message === "SIMULATION_ABORTED") {
        this.log(">>> Simulation stopped by user.");
      } else {
        this.log(`Traceback (most recent call last): ${err.message}`);
        console.error("Simulation error:", err);
      }
    } finally {
      this.isRunning = false;
      this._notify();
    }
  }

  async _executeBlockSequence(firstBlock) {
    let currentBlock = firstBlock;
    while (currentBlock && !this.abortController?.signal.aborted) {
      await this.checkYield();
      this.state.telemetry.activeBlockId = currentBlock.id;
      this._notify();

      await this._executeSingleBlock(currentBlock);
      await this.delay(5);
      currentBlock = currentBlock.getNextBlock();
    }
  }

  async _executeSingleBlock(block) {
    const type = block.type;
    const getFieldVal = (name) => block.getFieldValue(name);

    switch (type) {
      case 'titan_wait': {
        const time = parseFloat(getFieldVal('TIME')) || 0;
        const unit = getFieldVal('UNIT');
        const ms = unit === 'SECONDS' ? time * 1000 : unit === 'MICROS' ? time / 1000 : time;
        await this.delay(ms);
        break;
      }

      case 'titan_print': {
        const val = this._evalValueInput(block, 'TEXT');
        this.log(val);
        break;
      }

      case 'titan_print_labeled': {
        const label = getFieldVal('LABEL');
        const val = this._evalValueInput(block, 'VALUE');
        this.log(`${label} ${val}`);
        break;
      }

      case 'titan_motor_control': {
        const motor = getFieldVal('MOTOR');
        const dir = getFieldVal('DIR');
        const speed = parseFloat(getFieldVal('SPEED')) || 0;
        this.setMotor(motor, dir, speed);
        break;
      }

      case 'titan_motor_speed_var': {
        const motor = getFieldVal('MOTOR');
        const dir = getFieldVal('DIR');
        const speed = this._evalValueInput(block, 'SPEED_INPUT') ?? 80;
        this.setMotor(motor, dir, speed);
        break;
      }

      case 'titan_motor_dual_drive': {
        const dir = getFieldVal('DIRECTION');
        const speed = parseFloat(getFieldVal('SPEED')) || 0;
        this.driveRover(dir, speed);
        break;
      }

      case 'titan_motor_stop': {
        const motor = getFieldVal('MOTOR');
        this.stopMotors(motor);
        break;
      }

      case 'titan_servo_angle': {
        const pin = parseInt(getFieldVal('PIN'), 10);
        const angle = parseFloat(getFieldVal('ANGLE')) || 90;
        this.setServo(pin, angle);
        break;
      }

      case 'titan_onboard_led': {
        const led = getFieldVal('LED');
        const state = getFieldVal('STATE');
        this.setLed(led, state);
        break;
      }

      case 'titan_onboard_buzzer_tone': {
        const tone = getFieldVal('TONE');
        this.playBuzzerTone(tone);
        break;
      }

      case 'titan_onboard_buzzer_freq': {
        const freq = parseFloat(getFieldVal('FREQ')) || 1000;
        const dur = parseFloat(getFieldVal('DURATION')) || 200;
        this.playBuzzerFreq(freq, dur);
        break;
      }

      case 'titan_onboard_buzzer_stop': {
        this.stopBuzzer();
        break;
      }

      case 'titan_oled_init': {
        const type = getFieldVal('TYPE');
        this.initOLED(type);
        break;
      }

      case 'titan_oled_text': {
        const text = this._evalValueInput(block, 'TEXT') ?? '';
        const x = parseFloat(getFieldVal('X')) || 0;
        const y = parseFloat(getFieldVal('Y')) || 0;
        const size = parseInt(getFieldVal('SIZE'), 10) || 1;
        this.oledText(text, x, y, size);
        break;
      }

      case 'titan_oled_clear': {
        this.oledClear();
        break;
      }

      case 'titan_oled_show': {
        this._notify();
        break;
      }

      default:
        break;
    }
  }

  _evalValueInput(parentBlock, inputName) {
    const targetBlock = parentBlock.getInputTargetBlock(inputName);
    if (!targetBlock) {
      const fieldVal = parentBlock.getFieldValue(inputName);
      if (fieldVal !== null && fieldVal !== undefined) return fieldVal;
      return '';
    }
    return this._evalExpression(targetBlock);
  }

  _evalExpression(block) {
    if (!block) return '';
    const type = block.type;
    const getFieldVal = (name) => block.getFieldValue(name);

    switch (type) {
      case 'titan_text':
      case 'text':
        return block.getFieldValue('TEXT') || '';
      case 'titan_number':
      case 'math_number':
        return parseFloat(getFieldVal('NUM')) || 0;
      default:
        return '';
    }
  }

  // ================= 2. MicroPython Script Execution Engine =================

  async runPythonCode(codeString) {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    this.log("=== LOF TITAN MICROPYTHON REPL ===");
    this.initOLED();

    try {
      const sandbox = this._createPythonSandbox();
      const runner = this._transpilePythonToAsyncJs(codeString);
      await runner(sandbox);
      this.log(">>> Execution finished.");
    } catch (err) {
      if (err.message === "SIMULATION_ABORTED") {
        this.log(">>> Execution stopped by user.");
      } else {
        this.log(`Traceback (most recent call last): ${err.message}`);
        console.error("Python Simulation Error:", err);
      }
    } finally {
      this.isRunning = false;
      this._notify();
    }
  }

  _createPythonSandbox() {
    const self = this;

    const oledObj = {
      print_text: (s, x = 0, y = 0, size = 1) => {
        self.oledText(s, x, y, size);
      },
      text: (s, x = 0, y = 0, col = 1) => {
        self.oledText(s, x, y, 1);
      },
      fill: (val) => {
        if (!val) self.oledClear();
      },
      show: () => {
        self._notify();
      },
      clear: () => {
        self.oledClear();
      }
    };

    const pulseObj = {
      update: () => self.state.pulseSensor.fingerDetected,
      get current_bpm() { return self.state.pulseSensor.bpm; },
      get average_bpm() { return self.state.pulseSensor.bpm; },
      get finger_detected() { return self.state.pulseSensor.fingerDetected; },
      get latest_ir() { return self.state.pulseSensor.ir; },
      get latest_red() { return self.state.pulseSensor.red; },
      init_sensor: () => {}
    };

    return {
      print: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        self.log(text);
      },
      time: {
        sleep: async (s) => await self.delay(s * 1000),
        sleep_ms: async (ms) => await self.delay(ms),
        sleep_us: async (us) => await self.delay(us / 1000),
        ticks_ms: () => Date.now(),
        ticks_diff: (a, b) => a - b,
      },
      network: {
        STA_IF: 0,
        AP_IF: 1,
        AUTH_WPA_WPA2_PSK: 3,
        WLAN: (mode) => ({
          active: (val) => true,
          config: (opts) => {
            if (opts?.essid) self.log(`[WIFI AP] Started SSID: "${opts.essid}" IP: 192.168.4.1`);
          },
          ifconfig: () => ['192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'],
          connect: (ssid, pass) => self.log(`[WIFI STA] Connecting to ${ssid}...`),
          isconnected: () => true,
          status: () => 1010
        })
      },
      socket: {
        AF_INET: 2,
        SOCK_STREAM: 1,
        SOL_SOCKET: 1,
        SO_REUSEADDR: 4,
        socket: function() {
          return {
            setsockopt: () => {},
            bind: (addr) => self.log(`[SOCKET] Bound to ${addr[0]}:${addr[1]}`),
            listen: (backlog) => {},
            setblocking: (flag) => {},
            settimeout: (t) => {},
            accept: () => [
              {
                settimeout: () => {},
                recv: () => '',
                sendall: (data) => {},
                close: () => {}
              },
              ['192.168.4.2', 80]
            ],
            close: () => {}
          };
        }
      },
      select: {
        POLLIN: 1,
        POLLOUT: 4,
        poll: () => ({
          register: () => {},
          unregister: () => {},
          poll: (t) => []
        })
      },
      hw: {
        play_startup_tone: () => self.playBuzzerTone('STARTUP'),
        play_run_tone: () => self.playBuzzerTone('RUN'),
        play_confirmation_tone: () => self.playBuzzerTone('CONNECTED'),
        play_stop_tone: () => self.playBuzzerTone('DISCONNECTED'),
        play_error_tone: () => self.playBuzzerTone('ERROR'),
        play_buzzer_freq: (freq, dur) => self.playBuzzerFreq(freq, dur),
        stop_buzzer: () => self.stopBuzzer(),
        read_ultrasonic_distance: (trig, echo, unit = "cm") => self.readUltrasonicDistance(unit),
        ble_send: (data) => self.log(`[BLE TX] ${data}`),
      },
      _get_pwm: (pin, freq = 1000) => ({
        duty: (d) => {
          const pct = Math.round((d / 1023) * 100);
          self._handlePwmDuty(pin, pct, freq);
        },
        duty_u16: (d) => {
          const pct = Math.round((d / 65535) * 100);
          self._handlePwmDuty(pin, pct, freq);
        },
        freq: (f) => {},
        deinit: () => {}
      }),
      PWM: (pinObj, freq = 1000) => {
        const pin = pinObj?.pin || (typeof pinObj === 'number' ? pinObj : 15);
        return {
          duty: (d) => {
            const pct = Math.round((d / 1023) * 100);
            self._handlePwmDuty(pin, pct, freq);
          },
          duty_u16: (d) => {
            const pct = Math.round((d / 65535) * 100);
            self._handlePwmDuty(pin, pct, freq);
          },
          freq: (f) => {},
          deinit: () => {}
        };
      },
      Pin: Object.assign((pin, mode, pull) => ({
        pin,
        value: (val) => {
          if (val === undefined) {
            if (pin >= 39 && pin <= 42) {
              return self.isButtonPressed(pin) ? 0 : 1;
            }
            return self.readDigitalSensor(pin);
          } else {
            self.writeDigitalOutput(pin, val);
            if (pin === 47) self.setLed('47', val);
            if (pin === 48) self.setLed('48', val);
            return val;
          }
        },
        on: () => {
          self.writeDigitalOutput(pin, 1);
          if (pin === 47) self.setLed('47', 'ON');
          if (pin === 48) self.setLed('48', 'ON');
        },
        off: () => {
          self.writeDigitalOutput(pin, 0);
          if (pin === 47) self.setLed('47', 'OFF');
          if (pin === 48) self.setLed('48', 'OFF');
        }
      }), { OUT: 1, IN: 0, PULL_UP: 2, PULL_DOWN: 3 }),
      bytearray: (n) => new Uint8Array(typeof n === 'number' ? n : 0),
      framebuf: { FrameBuffer: function(){}, MONO_VLSB: 1, MONO_HLSB: 2, RGB565: 5 },
      ADC: (pinObj, atten) => {
        const pin = pinObj?.pin || (typeof pinObj === 'number' ? pinObj : 2);
        return {
          read: () => self.readAnalogSensor(pin),
          read_u16: () => Math.round((self.readAnalogSensor(pin) / 4095) * 65535),
          atten: () => {}
        };
      },
      _TitanOLED: function(is_sh1106) {
        self.initOLED();
        return oledObj;
      },
      _get_oled: () => oledObj,
      _oled_global: oledObj,
      oled: oledObj,
      _TitanPulse: function() {
        return pulseObj;
      },
      _get_pulse: () => pulseObj,
      _pulse_inst: pulseObj,
      pulse: pulseObj,
      _init_pulse: () => {},
      _read_pulse: (t) => t === 'FINGER' ? pulseObj.finger_detected : pulseObj.average_bpm,
      SoftI2C: function() {},
      I2C: function() {},
      UART: function() {
        return {
          write: (d) => self.log(`[UART TX] ${d}`),
          read: () => ''
        };
      },
      getattr: (obj, name, defaultVal) => {
        if (obj && obj[name] !== undefined) return obj[name];
        return typeof defaultVal === 'function' ? defaultVal : () => defaultVal;
      },
      range: (a, b, step = 1) => {
        const start = b === undefined ? 0 : a;
        const stop = b === undefined ? a : b;
        const res = [];
        for (let i = start; i < stop; i += step) res.push(i);
        return res;
      },
      True: true,
      False: false,
      None: null,
      max: (...args) => Math.max(...args),
      min: (...args) => Math.min(...args),
      str: (v) => String(v),
      int: (v) => parseInt(v, 10) || 0,
      float: (v) => parseFloat(v) || 0,
      len: (v) => (v ? v.length : 0),
      _in: (item, container) => {
        if (!container) return false;
        if (typeof container === 'string' || Array.isArray(container)) return container.indexOf(item) !== -1;
        return item in container;
      },
      _not_in: (item, container) => {
        if (!container) return true;
        if (typeof container === 'string' || Array.isArray(container)) return container.indexOf(item) === -1;
        return !(item in container);
      },
      checkYield: async () => await self.checkYield(),
      delay: async (ms) => await self.delay(ms),
    };
  }

  _handlePwmDuty(pin, pct, freq) {
    if (pin === 20) {
      if (pct > 0) {
        this.playBuzzerFreq(freq || 1000, 200);
      } else {
        this.stopBuzzer();
      }
      return;
    }

    const updateDualPinMotor = (motorKey, pinA, pinB) => {
      const m = this.state.motors[motorKey];
      if (!m) return;
      if (pin === pinA) m.dutyA = pct;
      if (pin === pinB) m.dutyB = pct;

      if (m.dutyA > 0 && m.dutyB === 0) {
        m.dir = 'FORWARD';
        m.speed = m.dutyA;
      } else if (m.dutyB > 0 && m.dutyA === 0) {
        m.dir = 'BACKWARD';
        m.speed = m.dutyB;
      } else if (m.dutyA > 0 && m.dutyB > 0) {
        if (m.dutyA >= m.dutyB) {
          m.dir = 'FORWARD';
          m.speed = m.dutyA - m.dutyB;
        } else {
          m.dir = 'BACKWARD';
          m.speed = m.dutyB - m.dutyA;
        }
      } else {
        m.dir = 'STOP';
        m.speed = 0;
      }
    };

    if (pin === 15 || pin === 16) {
      updateDualPinMotor('M1', 15, 16);
    } else if (pin === 13 || pin === 14) {
      updateDualPinMotor('M2', 13, 14);
    } else if (pin === 11 || pin === 12) {
      updateDualPinMotor('M3', 11, 12);
      updateDualPinMotor('M6', 11, 12);
    } else if (pin === 9 || pin === 10) {
      updateDualPinMotor('M4', 9, 10);
      updateDualPinMotor('M5', 9, 10);
    }

    this._notify();
  }

  _transpilePythonToAsyncJs(pyCode) {
    // 1. Replace triple-quoted strings with JS template strings (before line split)
    let cleanCode = pyCode
      .replace(/"""([\s\S]*?)"""/g, (m, content) => {
        return '`' + content.replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`';
      })
      .replace(/'''([\s\S]*?)'''/g, (m, content) => {
        return '`' + content.replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`';
      });

    // 2. Replace f-strings with template literals (handle {{ }} escapes)
    cleanCode = cleanCode
      .replace(/f"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m, p1) => {
        let t = p1.replace(/\{\{/g, '___LBRACE___').replace(/\}\}/g, '___RBRACE___');
        t = t.replace(/\{([^}]+)\}/g, '${$1}');
        t = t.replace(/___LBRACE___/g, '{').replace(/___RBRACE___/g, '}');
        return '`' + t + '`';
      })
      .replace(/f'([^'\\]*(?:\\.[^'\\]*)*)'/g, (m, p1) => {
        let t = p1.replace(/\{\{/g, '___LBRACE___').replace(/\}\}/g, '___RBRACE___');
        t = t.replace(/\{([^}]+)\}/g, '${$1}');
        t = t.replace(/___LBRACE___/g, '{').replace(/___RBRACE___/g, '}');
        return '`' + t + '`';
      });

    const rawLines = cleanCode.split('\n');
    let jsBody = `
      var { 
        print, time, network, socket, select, hw, _get_pwm, PWM, Pin, ADC, 
        _TitanOLED, _get_oled, _oled_global, oled, 
        _TitanPulse, _get_pulse, _pulse_inst, pulse, 
        _init_pulse, _read_pulse, getattr, 
        SoftI2C, I2C, UART,
        str, int, float, len, range, min, max, _in, _not_in, checkYield, delay,
        bytearray, framebuf, True, False, None 
      } = sandbox;
    `;

    // Indentation-aware block stack
    const blockStack = [];
    // skipUntilIndent: skip all lines with indent > this value (used for class/helper defs)
    let skipUntilIndent = -1;

    // Sandbox-provided helpers — skip user redefinitions to keep them synchronous
    const SANDBOX_HELPERS = ['_get_oled', '_get_pulse', '_get_pwm'];

    for (let raw of rawLines) {
      let trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Strip inline comments outside strings
      if (trimmed.includes('#') && !trimmed.startsWith('`') && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
        const hashIndex = trimmed.indexOf('#');
        const prefix = trimmed.substring(0, hashIndex);
        const quotes = (prefix.match(/["'`]/g) || []).length;
        if (quotes % 2 === 0) {
          trimmed = prefix.trim();
        }
      }

      if (!trimmed) continue;

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue;
      if (trimmed.startsWith('global ')) continue;
      if (trimmed.startsWith('if __name__') || trimmed === 'main()') continue;

      const matchIndentEarly = raw.match(/^(\s*)/);
      const earlyIndent = matchIndentEarly ? matchIndentEarly[1].replace(/\t/g, '    ').length : 0;

      // Handle skip zone (class bodies, sandbox helper function bodies)
      if (skipUntilIndent >= 0) {
        if (earlyIndent > skipUntilIndent) continue; // still inside skipped block
        else skipUntilIndent = -1; // exited the block
      }

      // Skip class definitions entirely — sandbox simulates hardware drivers
      if (trimmed.startsWith('class ')) {
        skipUntilIndent = earlyIndent;
        continue;
      }

      // Skip sandbox helper function re-definitions (keeps them sync for method chaining)
      if (trimmed.startsWith('def ') && SANDBOX_HELPERS.some(h => trimmed.startsWith(`def ${h}(`))) {
        skipUntilIndent = earlyIndent;
        continue;
      }

      // Skip TOP-LEVEL sandbox state variable re-initializations (indent 0 only)
      if (earlyIndent === 0 && /^(_pwm_pool|_oled_global|_pulse_inst)\s*=/.test(trimmed)) continue;

      const currentIndent = earlyIndent;

      const isElif = trimmed.startsWith('elif ');
      const isElse = trimmed === 'else:';
      const isExcept = trimmed.startsWith('except');
      const isFinally = trimmed === 'finally:';

      // Close blocks based on indentation
      if (isElif || isElse || isExcept || isFinally) {
        while (blockStack.length > 0 && blockStack[blockStack.length - 1] > currentIndent) {
          blockStack.pop();
          jsBody += `\n}\n`;
        }
      } else {
        while (blockStack.length > 0 && currentIndent <= blockStack[blockStack.length - 1]) {
          blockStack.pop();
          jsBody += `\n}\n`;
        }
      }

      let line = trimmed;

      // Normalize common Python keywords
      line = line.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

      const condTransform = (c) => c
        .replace(/([^\s\(\)]+)\s+not\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_not_in(${p1}, ${p2})`)
        .replace(/([^\s\(\)]+)\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_in(${p1}, ${p2})`)
        .replace(/\bnot\b\s+/g, '!')
        .replace(/ == /g, ' === ')
        .replace(/ != /g, ' !== ')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||');

      // 1. Handle Function Definitions
      if (line.startsWith('def ') && line.endsWith(':')) {
        const match = line.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$/);
        if (match) {
          const fname = match[1];
          const rawParams = match[2] ? match[2].split(',') : [];
          const cleanParams = rawParams.map(p => {
            const pTrim = p.trim();
            if (pTrim.includes('=')) {
              const eqIdx = pTrim.indexOf('=');
              return `${pTrim.substring(0, eqIdx).trim()} = ${pTrim.substring(eqIdx + 1).trim()}`;
            }
            return pTrim;
          }).filter(Boolean).join(', ');
          jsBody += `\n${fname} = async function(${cleanParams}) {\n await checkYield();\n`;
          blockStack.push(currentIndent);
          continue;
        }
      }

      // 2. Handle Loops
      if (line.startsWith('while ') && line.endsWith(':')) {
        const cond = condTransform(line.slice(6, -1));
        jsBody += `\nwhile (${cond}) {\n await checkYield();\n`;
        blockStack.push(currentIndent);
        continue;
      }

      if (line.startsWith('for ') && line.includes(' in ') && line.endsWith(':')) {
        const match = line.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+(.+):$/);
        if (match) {
          jsBody += `\nfor (let ${match[1]} of ${match[2]}) {\n await checkYield();\n`;
          blockStack.push(currentIndent);
          continue;
        }
      }

      // 3. Handle Conditionals
      if (line.startsWith('if ') && line.endsWith(':')) {
        jsBody += `\nif (${condTransform(line.slice(3, -1))}) {\n`;
        blockStack.push(currentIndent);
        continue;
      }
      if (isElif) {
        jsBody += `\n} else if (${condTransform(line.slice(5, -1))}) {\n`;
        continue;
      }
      if (isElse) {
        jsBody += `\n} else {\n`;
        continue;
      }

      // 4. Handle Try / Catch / Finally
      if (line.startsWith('try:')) {
        const rest = line.slice(4).trim();
        jsBody += `\ntry {\n${rest && rest !== 'pass' ? ' ' + rest + ';' : ''}\n`;
        blockStack.push(currentIndent);
        continue;
      }
      if (isExcept) {
        const colonIdx = line.indexOf(':');
        const rest = line.substring(colonIdx + 1).trim();
        jsBody += `\n} catch(e) {\n${rest && rest !== 'pass' ? ' ' + rest + ';' : ''}\n`;
        continue;
      }
      if (isFinally) {
        jsBody += `\n} finally {\n`;
        continue;
      }

      // 5. Statement-level transformations
      // Python ternary: val_true if cond else val_false
      line = line.replace(/(".*?"|'.*?'|[a-zA-Z0-9_]+)\s+if\s+([a-zA-Z0-9_\.\(\)\s===!><]+)\s+else\s+(".*?"|'.*?'|[a-zA-Z0-9_]+)/g, '($2 ? $1 : $3)');

      // not in / in operators in statements
      line = line.replace(/([^\s\(\)]+)\s+not\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_not_in(${p1}, ${p2})`);
      line = line.replace(/([^\s\(\)]+)\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_in(${p1}, ${p2})`);

      // Tuple unpacking: a, b = x, y
      if (/^[a-zA-Z0-9_]+,\s*[a-zA-Z0-9_]+\s*=\s*/.test(line)) {
        const eqIdx = line.indexOf('=');
        const left = line.substring(0, eqIdx).trim();
        const right = line.substring(eqIdx + 1).trim();
        line = `var [${left}] = ${right.includes(',') && !right.startsWith('[') ? `[${right}]` : right}`;
      }

      line = line.replace(/([a-zA-Z0-9_\.\(\)]+)\s*\/\/\s*([a-zA-Z0-9_\.\(\)]+)/g, 'Math.floor($1 / $2)');
      line = line.replace(/,\s*end\s*=\s*["'][^"']*["']/g, '');
      line = line.replace(/time\.sleep_ms\((.*?)\)/g, 'await time.sleep_ms($1)');
      line = line.replace(/time\.sleep\((.*?)\)/g, 'await time.sleep($1)');
      line = line.replace(/size\s*=\s*/g, '');
      line = line.replace(/is_sh1106\s*=\s*/g, '');
      line = line.replace(/atten\s*=\s*[^,\)]+/g, '');
      line = line.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
      line = line.replace(/lambda\s*([^:]*)\s*:\s*([^,\)]+)/g, '($1) => $2');

      // Auto-await known async user functions
      line = line.replace(/\b(read_average_uv|auto_uv_control|stop_motors|forward|backward|left_turn|right_turn|left_motor_forward|left_motor_backward|right_motor_forward|right_motor_backward|handle_http_request|main)\s*\(/g, 'await $1(');

      const statements = line.split(';').map(s => s.trim()).filter(Boolean);
      for (const st of statements) {
        if (st === 'pass') continue;
        // Add var prefix for plain assignments
        if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(st) && !st.startsWith('var ')) {
          jsBody += `\nvar ${st};`;
        } else {
          jsBody += `\n${st};`;
        }
      }
    }

    // Close any remaining open blocks
    while (blockStack.length > 0) {
      blockStack.pop();
      jsBody += `\n}\n`;
    }

    // Auto-invoke main() if defined
    jsBody += `\nif (typeof main === 'function') { await main(); }\n`;

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      return new AsyncFunction('sandbox', jsBody);
    } catch (e) {
      this.log(`⚠️ Script transpiler notice: ${e.message}`);
      console.error('Transpiler JS Code:\n', jsBody);
      throw e;
    }
  }

  pause() {
    this.isPaused = !this.isPaused;
    this._notify();
  }

  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
    this.isPaused = false;
    this.stopMotors('ALL');
    this.setLed('BOTH', 'OFF');
    this.stopBuzzer();
    this.state.telemetry.activeBlockId = null;
    this._notify();
  }

  reset() {
    this.stop();
    this.state = this._getInitialState();
    this._notify();
    this.log(">>> LOF TITAN board reset to default state.");
  }
}

export const titanSimulator = new TitanSimulatorEngine();
