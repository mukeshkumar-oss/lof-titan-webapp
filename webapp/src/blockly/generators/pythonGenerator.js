import { pythonGenerator, Order } from 'blockly/python';

export function registerPythonGenerators() {
  // ================= 1. TITAN BASE / START BLOCK (SCRATCH FLAG EQUIVALENT) =================
  pythonGenerator.forBlock['titan_start'] = function(block) {
    const branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    return `# ================= LOF TITAN MAIN =================\nimport time\nfrom machine import Pin, PWM, ADC, I2C, SoftI2C, UART\nfrom supervisor.led_buzzer import hw\n\n_pwm_pool = {}\ndef _get_pwm(pin, freq=1000):\n    if pin not in _pwm_pool:\n        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)\n    else:\n        try: _pwm_pool[pin].freq(freq)\n        except Exception: pass\n    return _pwm_pool[pin]\n\ndef main():\n${branch}\nif __name__ == '__main__':\n    main()\n`;
  };

  pythonGenerator.forBlock['project_info'] = function(block) {
    const author = block.getFieldValue('AUTHOR') || 'User';
    const desc = block.getFieldValue('DESCRIPTION') || 'My project';
    return `# ==========================================\n# LOF TITAN Project\n# Author: ${author}\n# Description: ${desc}\n# ==========================================\n\n`;
  };

  pythonGenerator.INDENT = '  ';

  pythonGenerator.forBlock['titan_repeat_while'] = function(block) {
    const mode = block.getFieldValue('MODE');
    let condition = pythonGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'True';
    if (mode === 'UNTIL') {
      condition = `not (${condition})`;
    }
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(5)\n';
    }
    return `while ${condition}:\n${branch}`;
  };

  pythonGenerator.forBlock['titan_repeat_times'] = function(block) {
    const times = block.getFieldValue('TIMES') || 10;
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(2)\n';
    }
    return `for _ in range(${times}):\n${branch}`;
  };

  pythonGenerator.forBlock['controls_whileUntil'] = function(block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let argument0 = pythonGenerator.valueToCode(block, 'BOOL', until ? Order.LOGICAL_NOT : Order.NONE) || 'False';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (until) {
      argument0 = 'not ' + argument0;
    }
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(5)\n';
    }
    return `while ${argument0}:\n${branch}`;
  };

  pythonGenerator.forBlock['controls_repeat_ext'] = function(block) {
    let repeats = pythonGenerator.valueToCode(block, 'TIMES', Order.NONE) || '0';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(2)\n';
    }
    return `for _ in range(int(${repeats})):\n${branch}`;
  };

  pythonGenerator.forBlock['controls_for'] = function(block) {
    const variable0 = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const argument0 = pythonGenerator.valueToCode(block, 'FROM', Order.NONE) || '0';
    const argument1 = pythonGenerator.valueToCode(block, 'TO', Order.NONE) || '0';
    const increment = pythonGenerator.valueToCode(block, 'BY', Order.NONE) || '1';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(1)\n';
    }
    return `for ${variable0} in range(int(${argument0}), int(${argument1}) + 1, int(${increment})):\n${branch}`;
  };

  pythonGenerator.forBlock['titan_print'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `print(${text})\n`;
  };

  pythonGenerator.forBlock['titan_wait'] = function(block) {
    const timeVal = block.getFieldValue('TIME') || 1;
    const unit = block.getFieldValue('UNIT');
    if (unit === 'SECONDS') {
      return `time.sleep(${timeVal})\n`;
    } else if (unit === 'MILLIS') {
      return `time.sleep_ms(int(${timeVal}))\n`;
    } else {
      return `time.sleep_us(int(${timeVal}))\n`;
    }
  };

  pythonGenerator.forBlock['titan_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
    return [code, Order.ATOMIC];
  };

  pythonGenerator.forBlock['titan_text'] = function(block) {
    const text = block.getFieldValue('TEXT') || '';
    return [`"${text}"`, Order.ATOMIC];
  };

  pythonGenerator.forBlock['titan_number'] = function(block) {
    const num = block.getFieldValue('NUM') || 0;
    return [String(num), Order.ATOMIC];
  };

  // Motor Pin Mapping for 4 Hardware Channels / 6 Motor Ports
  const MOTOR_PIN_MAP = {
    'M1': [15, 16],
    'M2': [13, 14],
    'M3': [11, 12],
    'M4': [9, 10],
    'M5': [9, 10], // Parallel shared output with M4
    'M6': [11, 12]  // Parallel shared output with M3
  };

  // ================= 2. MOTOR GENERATORS =================
  pythonGenerator.forBlock['titan_motor_control'] = function(block) {
    const motor = block.getFieldValue('MOTOR') || 'M1';
    const dir = block.getFieldValue('DIR');
    const speed = block.getFieldValue('SPEED') || 80;
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    const pinA = pins[0];
    const pinB = pins[1];
    const dutyVal = `int(${speed} * 10.23)`;
    if (dir === 'FORWARD') {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Forward at ${speed}%\n_get_pwm(${pinA}).duty(${dutyVal})\n_get_pwm(${pinB}).duty(0)\n`;
    } else {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Backward at ${speed}%\n_get_pwm(${pinA}).duty(0)\n_get_pwm(${pinB}).duty(${dutyVal})\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_speed_var'] = function(block) {
    const motor = block.getFieldValue('MOTOR') || 'M1';
    const dir = block.getFieldValue('DIR');
    const speedCode = pythonGenerator.valueToCode(block, 'SPEED_INPUT', Order.NONE) || '80';
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    const pinA = pins[0];
    const pinB = pins[1];
    if (dir === 'FORWARD') {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Forward\n_get_pwm(${pinA}).duty(int(min(100, max(0, ${speedCode})) * 10.23))\n_get_pwm(${pinB}).duty(0)\n`;
    } else {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Backward\n_get_pwm(${pinA}).duty(0)\n_get_pwm(${pinB}).duty(int(min(100, max(0, ${speedCode})) * 10.23))\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_custom_pins'] = function(block) {
    const pinA = block.getFieldValue('PIN_A');
    const pinB = block.getFieldValue('PIN_B');
    const dir = block.getFieldValue('DIR');
    const speed = block.getFieldValue('SPEED') || 80;
    return `# Custom Motor Pins (A: GPIO ${pinA}, B: GPIO ${pinB})\nif ${dir === 'FORWARD' ? 'True' : 'False'}:\n    _get_pwm(${pinA}).duty(int(${speed} * 10.23))\n    _get_pwm(${pinB}).duty(0)\nelse:\n    _get_pwm(${pinA}).duty(0)\n    _get_pwm(${pinB}).duty(int(${speed} * 10.23))\n`;
  };

  pythonGenerator.forBlock['titan_motor_dual_drive'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const speed = block.getFieldValue('SPEED') || 80;
    const dutyVal = `int(${speed} * 10.23)`;
    if (dir === 'FORWARD') {
      return `# Drive Rover Forward\n_get_pwm(15).duty(${dutyVal}); _get_pwm(16).duty(0)\n_get_pwm(13).duty(${dutyVal}); _get_pwm(14).duty(0)\n`;
    } else if (dir === 'BACKWARD') {
      return `# Drive Rover Backward\n_get_pwm(15).duty(0); _get_pwm(16).duty(${dutyVal})\n_get_pwm(13).duty(0); _get_pwm(14).duty(${dutyVal})\n`;
    } else if (dir === 'LEFT' || dir === 'SPIN_LEFT') {
      return `# Turn Left\n_get_pwm(15).duty(0); _get_pwm(16).duty(${dutyVal})\n_get_pwm(13).duty(${dutyVal}); _get_pwm(14).duty(0)\n`;
    } else {
      return `# Turn Right\n_get_pwm(15).duty(${dutyVal}); _get_pwm(16).duty(0)\n_get_pwm(13).duty(0); _get_pwm(14).duty(${dutyVal})\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_stop'] = function(block) {
    const motor = block.getFieldValue('MOTOR');
    if (motor === 'ALL') {
      return `# Stop All Motors (M1-M6)\nfor _p in (15, 16, 13, 14, 11, 12, 9, 10):\n    if _p in _pwm_pool: _pwm_pool[_p].duty(0)\n`;
    }
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    return `# Stop Motor ${motor} (GPIO ${pins[0]}, ${pins[1]})\n_get_pwm(${pins[0]}).duty(0)\n_get_pwm(${pins[1]}).duty(0)\n`;
  };

  pythonGenerator.forBlock['titan_servo_angle'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const angle = block.getFieldValue('ANGLE') || 90;
    return `# Servo Port S${pin} (GPIO ${pin}) to ${angle} deg\n_get_pwm(${pin}, 50).duty(int(25 + (${angle} / 180.0) * 100))\n`;
  };

  // ================= 3. HARDWARE & SENSORS =================
  pythonGenerator.forBlock['titan_sensor_read_analog'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_sensor_read_digital'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`Pin(${pin}, Pin.IN).value()`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_sensor_write_digital'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `Pin(${pin}, Pin.OUT).value(${state})\n`;
  };

  pythonGenerator.forBlock['titan_ultrasonic_distance'] = function(block) {
    const unit = block.getFieldValue('UNIT');
    return [`hw.read_ultrasonic_distance(trig=6, echo=19, unit="${unit}")`, Order.FUNCTION_CALL];
  };

  // I2C Generators (SDA: 7, SCL: 8)
  pythonGenerator.forBlock['titan_i2c_scan'] = function(block) {
    return [`[hex(a) for a in SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).scan()]`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_i2c_read_byte'] = function(block) {
    const addr = block.getFieldValue('ADDR') || '0x3C';
    const reg = block.getFieldValue('REG') || 0;
    return [`int.from_bytes(SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).readfrom_mem(int("${addr}", 0 if "${addr}".startswith("0x") else 10), ${reg}, 1), 'big')`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_i2c_write_byte'] = function(block) {
    const addr = block.getFieldValue('ADDR') || '0x3C';
    const reg = block.getFieldValue('REG') || 0;
    const val = block.getFieldValue('VAL') || 0;
    return `SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).writeto_mem(int("${addr}", 0 if "${addr}".startswith("0x") else 10), ${reg}, bytearray([${val}]))\n`;
  };

  // Sensor Monitor Print Generator
  pythonGenerator.forBlock['titan_print_sensor_monitor'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'ALL';
    if (type === 'ALL') {
      return `_s1 = ADC(Pin(2), atten=ADC.ATTN_11DB).read()\n` +
             `_s2 = ADC(Pin(1), atten=ADC.ATTN_11DB).read()\n` +
             `_s3 = ADC(Pin(3), atten=ADC.ATTN_11DB).read()\n` +
             `_s4 = ADC(Pin(4), atten=ADC.ATTN_11DB).read()\n` +
             `_s5 = ADC(Pin(5), atten=ADC.ATTN_11DB).read()\n` +
             `_d = hw.read_ultrasonic_distance(6, 19, "cm")\n` +
             `_b1 = 1 - Pin(39, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b2 = 1 - Pin(40, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b3 = 1 - Pin(41, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b4 = 1 - Pin(42, Pin.IN, Pin.PULL_UP).value()\n` +
             `print(f"[SENSORS] S1:{_s1} S2:{_s2} S3:{_s3} S4:{_s4} S5:{_s5} | Dist:{_d:.1f}cm | Btns:[{_b1},{_b2},{_b3},{_b4}]")\n`;
    } else if (type === 'DIST') {
      return `print(f"[ULTRASONIC] Distance: {hw.read_ultrasonic_distance(6, 19, 'cm'):.1f} cm")\n`;
    } else if (type === 'BTNS') {
      return `print(f"[BUTTONS] B1:{1-Pin(39,Pin.IN,Pin.PULL_UP).value()} B2:{1-Pin(40,Pin.IN,Pin.PULL_UP).value()} B3:{1-Pin(41,Pin.IN,Pin.PULL_UP).value()} B4:{1-Pin(42,Pin.IN,Pin.PULL_UP).value()}")\n`;
    } else if (type === 'I2C_SCAN') {
      return `_i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000)\n` +
             `_names = {0x3C:"OLED (SSD1306/SH1106)", 0x68:"IMU (MPU6050)", 0x29:"ToF Laser (VL53L0X)", 0x36:"Mag Encoder (AS5600)", 0x76:"BMP280 Baro", 0x40:"PCA9685/INA219", 0x48:"ADS1115", 0x27:"LCD 1602", 0x1E:"HMC5883L Compass", 0x23:"BH1750 Light"}\n` +
             `_devs = _i2c.scan()\n` +
             `if not _devs:\n` +
             `  print("[I2C SCAN] No I2C devices detected (SDA:7, SCL:8)")\n` +
             `else:\n` +
             `  print(f"[I2C SCAN] Found {len(_devs)} device(s): " + ", ".join([f"{hex(a)} ({_names.get(a, 'I2C Device')})" for a in _devs]))\n`;
    } else {
      const pinMap = { 'S1': 2, 'S2': 1, 'S3': 3, 'S4': 4, 'S5': 5 };
      const pin = pinMap[type] || 2;
      return `print(f"[SENSOR ${type}] ADC Value: {ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()}")\n`;
    }
  };

  // Labeled Print Generator
  pythonGenerator.forBlock['titan_print_labeled'] = function(block) {
    const label = block.getFieldValue('LABEL') || '';
    const valCode = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
    return `print(f"${label} {${valCode}}")\n`;
  };

  // Sensor Comparison / Conditions for If / While
  pythonGenerator.forBlock['titan_sensor_compare'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const op = block.getFieldValue('OP') || '>';
    const val = block.getFieldValue('VALUE') || 500;
    return [`(ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read() ${op} ${val})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_digital_sensor_check'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const state = block.getFieldValue('STATE') || '1';
    return [`(Pin(${pin}, Pin.IN).value() == ${state})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_ultrasonic_compare'] = function(block) {
    const op = block.getFieldValue('OP') || '<';
    const dist = block.getFieldValue('DIST') || 15;
    const unit = block.getFieldValue('UNIT') || 'cm';
    return [`(hw.read_ultrasonic_distance(trig=6, echo=19, unit="${unit}") ${op} ${dist})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_onboard_led'] = function(block) {
    const led = block.getFieldValue('LED');
    const state = block.getFieldValue('STATE');
    if (led === 'BOTH') {
      if (state === 'ON') return `Pin(47, Pin.OUT).value(1); Pin(48, Pin.OUT).value(1)\n`;
      if (state === 'OFF') return `Pin(47, Pin.OUT).value(0); Pin(48, Pin.OUT).value(0)\n`;
      return `Pin(47, Pin.OUT).value(not Pin(47).value()); Pin(48, Pin.OUT).value(not Pin(48).value())\n`;
    }
    if (state === 'ON') return `Pin(${led}, Pin.OUT).value(1)\n`;
    if (state === 'OFF') return `Pin(${led}, Pin.OUT).value(0)\n`;
    return `_p = Pin(${led}, Pin.OUT); _p.value(not _p.value())\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_tone'] = function(block) {
    const tone = block.getFieldValue('TONE');
    if (tone === 'STARTUP') return `hw.play_startup_tone()\n`;
    if (tone === 'RUN') return `hw.play_run_tone()\n`;
    if (tone === 'CONNECTED') return `hw.play_connect_tone()\n`;
    if (tone === 'DISCONNECTED') return `hw.play_disconnect_tone()\n`;
    if (tone === 'ERROR') return `hw.play_error_tone()\n`;
    if (tone === 'STOP') return `hw.play_stop_tone()\n`;
    return `hw.play_confirmation_tone()\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_freq'] = function(block) {
    const freq = block.getFieldValue('FREQ') || 1000;
    const dur = block.getFieldValue('DURATION') || 200;
    return `getattr(hw, 'play_buzzer_freq', lambda f, d: hw.play_confirmation_tone())(${freq}, ${dur})\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_stop'] = function(block) {
    return `getattr(hw, 'stop_buzzer', lambda: None)()\n`;
  };

  // ================= 4. DISPLAY =================
  pythonGenerator.forBlock['titan_oled_init'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'SH1106';
    const isSh1106 = (type === 'SH1106') ? 'True' : 'False';
    return `import framebuf\nfrom machine import Pin, SoftI2C, I2C\nclass _TitanOLED(framebuf.FrameBuffer):\n  def __init__(self, is_sh1106=${isSh1106}):\n    self.is_sh1106 = is_sh1106\n    self.addr = 0x3C\n    self.buf = bytearray(1024)\n    super().__init__(self.buf, 128, 64, framebuf.MONO_VLSB)\n    try:\n      self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)\n      devs = self.i2c.scan()\n      if devs: self.addr = devs[0]\n      else:\n        self.i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)\n        devs = self.i2c.scan()\n        if devs: self.addr = devs[0]\n    except Exception:\n      try: self.i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000)\n      except Exception: self.i2c = None\n    for c in (0xAE,0x20,0x00,0x40,0xA1,0xC8,0x81,0xCF,0xA6,0xA8,0x3F,0xD3,0x00,0xD5,0x80,0xD9,0xF1,0xDA,0x12,0xDB,0x40,0x8D,0x14,0xAF):\n      try: self.i2c.writeto(self.addr, bytearray([0x80, c]))\n      except Exception: pass\n    self.fill(0)\n    self.show()\n  def print_text(self, s, x, y, size=1, col=1):\n    s = str(s)\n    if size <= 1:\n      super().text(s, x, y, col)\n    else:\n      _w = len(s) * 8\n      _tmp = bytearray((_w * 8 + 7) // 8)\n      _tb = framebuf.FrameBuffer(_tmp, _w, 8, framebuf.MONO_VLSB)\n      _tb.fill(0)\n      _tb.text(s, 0, 0, 1)\n      for px in range(_w):\n        for py in range(8):\n          if _tb.pixel(px, py):\n            for dx in range(size):\n              for dy in range(size):\n                if 0 <= x + px * size + dx < 128 and 0 <= y + py * size + dy < 64:\n                  self.pixel(x + px * size + dx, y + py * size + dy, col)\n  def show(self):\n    if not self.i2c: return\n    try:\n      if self.is_sh1106:\n        for p in range(8):\n          self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + p, 0x80, 0x02, 0x80, 0x10]))\n          self.i2c.writeto(self.addr, b'\\x40' + self.buf[128*p:128*(p+1)])\n      else:\n        self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))\n        self.i2c.writeto(self.addr, b'\\x40' + self.buf)\n    except Exception: pass\noled = _TitanOLED(is_sh1106=${isSh1106})\n`;
  };

  pythonGenerator.forBlock['titan_oled_text'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `oled.print_text(str(${text}), ${x}, ${y}, size=${size})\noled.show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_clear'] = function(block) {
    return `oled.fill(0)\noled.show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_show_sensor'] = function(block) {
    const pin = block.getFieldValue('SENSOR') || '2';
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `oled.print_text("S" + str(${pin}) + ": " + str(ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()), ${x}, ${y}, size=${size})\noled.show()\n`;
  };

  // Push Button Generators (GPIO 39 - 42)
  pythonGenerator.forBlock['titan_button_is_pressed'] = function(block) {
    const btn = block.getFieldValue('BUTTON') || '39';
    return [`(Pin(${btn}, Pin.IN, Pin.PULL_UP).value() == 0)`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_wait_for_button'] = function(block) {
    const btn = block.getFieldValue('BUTTON') || '39';
    return `while Pin(${btn}, Pin.IN, Pin.PULL_UP).value() != 0:\n    time.sleep_ms(20)\n`;
  };

  pythonGenerator.forBlock['titan_oled_show'] = function(block) {
    return `oled.show()\n`;
  };

  // ================= 5. WIRELESS & SERIAL =================
  pythonGenerator.forBlock['titan_wifi_connect'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect("${ssid}", "${pass}")\n`;
  };

  pythonGenerator.forBlock['titan_wifi_ap'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nap = network.WLAN(network.AP_IF)\nap.config(essid="${ssid}", password="${pass}", authmode=network.AUTH_WPA_WPA2_PSK)\nap.active(True)\n`;
  };

  pythonGenerator.forBlock['titan_ble_send'] = function(block) {
    const data = pythonGenerator.valueToCode(block, 'DATA', Order.NONE) || "''";
    return `hw.ble_send(str(${data}))\n`;
  };

  pythonGenerator.forBlock['titan_uart_send'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const baud = block.getFieldValue('BAUD') || 115200;
    return `_uart = UART(1, baudrate=${baud}, tx=17, rx=18)\n_uart.write(str(${text}) + '\\r\\n')\n`;
  };
}

export function generateTitanWorkspaceCode(workspace) {
  if (!workspace) return '';
  
  const topBlocks = workspace.getTopBlocks(true);
  const titanStartBlock = topBlocks.find(b => b.type === 'titan_start');
  const projectInfoBlock = topBlocks.find(b => b.type === 'project_info');

  let code = '';
  if (projectInfoBlock) {
    code += pythonGenerator.blockToCode(projectInfoBlock) + '\n';
  }

  if (titanStartBlock) {
    code += pythonGenerator.blockToCode(titanStartBlock);
  } else {
    code += pythonGenerator.workspaceToCode(workspace);
  }

  return code;
}
