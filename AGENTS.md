# LOF TITAN — AI Agent & Developer Guidelines (AGENTS.md)

This file provides system context, hardware specifications, and development instructions for **Antigravity**, **Gemini**, and AI coding assistants working on this repository.

---

## 🚀 Quick Start for Development

### 1. Web Application (React + Vite + Blockly + Tailwind CSS)
```bash
cd webapp
npm install
npm run dev
```
* **Local Web Server:** `http://localhost:5173/`
* **Core Components:**
  * `webapp/src/App.jsx` — Main Dashboard, navigation, and Web Bluetooth device state.
  * `webapp/src/components/BlocklyIDE.jsx` — Visual Block Code Studio with custom blocks.
  * `webapp/src/components/AIAssistantIDE.jsx` — LOF TITAN AI Studio with Gemini API code generation.
  * `webapp/src/components/SerialMonitorModal.jsx` — Standalone REPL Serial Monitor with Lunar White UI.
  * `webapp/src/components/FirmwareFlasherModal.jsx` — Web Serial ESP32-S3 firmware flashing tool.
  * `webapp/src/blockly/` — Custom blocks, generators, and lunar themes.

### 2. Firmware (MicroPython on ESP32-S3 N16R8)
* **MCU:** ESP32-S3 (16 MB Flash, 8 MB Octal PSRAM)
* **Supervisor Files:** `firmware/supervisor/` & `firmware/board/LOF_TITAN/modules/supervisor/`

---

## ⚡ Official Hardware Pinout Reference

| Function / Peripheral | GPIO Pins | Behavior & MicroPython Usage |
| :--- | :--- | :--- |
| **Motor Channel 1 (M1)** | `GPIO 15, 16` | Forward (`Pin 15` PWM, `Pin 16 = 0`), Backward (`Pin 15 = 0`, `Pin 16` PWM) |
| **Motor Channel 2 (M2)** | `GPIO 13, 14` | Forward (`Pin 13` PWM, `Pin 14 = 0`), Backward (`Pin 13 = 0`, `Pin 14` PWM) |
| **Motor Channel 3 (M3 & M6 Parallel)** | `GPIO 11, 12` | Controls Terminals M3 and M6 in parallel |
| **Motor Channel 4 (M4 & M5 Parallel)** | `GPIO 9, 10` | Controls Terminals M4 and M5 in parallel |
| **Push Buttons 1 – 4** | `GPIO 39, 40, 41, 42` | `Pin(pin, Pin.IN, Pin.PULL_UP).value() == 0` when pressed (Active LOW) |
| **Analog / Digital Sensors (S1 – S5)** | `GPIO 2, 1, 3, 4, 5` | S1=`GPIO 2`, S2=`GPIO 1`, S3=`GPIO 3`, S4=`GPIO 4`, S5=`GPIO 5` (12-bit ADC `0..4095`) |
| **MQ-135 Gas & Air Quality Sensor** | `GPIO 2, 1, 3, 4, or 5` | Connects to Analog Ports S1-S5 for Air Quality (PPM), CO2 equivalent, Smoke/Toxic gases |
| **DHT22 / DHT11 Temp & Humidity Sensor** | `GPIO 2, 1, 3, 4, 5, or 19` | Digital 1-wire pin for Temperature (°C/°F) and Relative Humidity (% RH) via `dht.DHT22` |
| **DS18B20 Waterproof Temp Sensor** | `GPIO 2, 1, 3, 4, 5, or 19` | Digital 1-Wire temperature probe (-55°C to +125°C) via `onewire` and `ds18x20` |
| **Ultrasonic Sensor** | `GPIO 6 (Trig), 19 (Echo)` | Distance via `hw.read_ultrasonic_distance(6, 19, "cm")` |
| **Status LEDs** | `GPIO 47 (Red), 48 (Green)` | `Pin(47, Pin.OUT).value(1)` |
| **Buzzer** | `GPIO 20` | `from supervisor.led_buzzer import hw` (Startup, Run, Confirm, Stop, Error tones) |
| **I2C Display (1.3" / 0.96" OLED)** | `GPIO 7 (SDA), 8 (SCL)` | `from supervisor.oled import TitanOLED` or native `framebuf` driver (Addr: `0x3C`) |
| **2x16 Liquid Crystal I2C Display (LCD 1602)** | `GPIO 7 (SDA), 8 (SCL)` | Character LCD via PCF8574 I2C adapter (Addr: `0x27` / `0x3F`), 16 cols x 2 rows |
| **Pulse & Heart Rate Sensor (MAX30100 / MAX30102)** | `GPIO 7 (SDA), 8 (SCL)` | Optical SpO2 & BPM sensor (Addr: `0x57`), SparkFun AC beat detector with DC removal filter |
| **MPU6050 6-Axis IMU (Gyro & Accel)** | `GPIO 7 (SDA), 8 (SCL)` | 6-DOF IMU (Addr: `0x68`), 3-axis Accel (±4g), 3-axis Gyro (±500°/s), Pitch/Roll tilt & gestures |
| **Digital Compass & Magnetometer (QMC5883L)** | `GPIO 7 (SDA), 8 (SCL)` | 3-axis electronic compass & heading angle (Addr: `0x0D`), range ±8G, 200Hz ODR |
| **8x8 IR Thermal Camera (AMG8833)** | `GPIO 7 (SDA), 8 (SCL)` | Grid-EYE 64-pixel thermal infrared matrix (Addr: `0x69`), range 0–80°C (0.25°C res) |
| **Magnetic Rotary Encoder (AS5600)** | `GPIO 7 (SDA), 8 (SCL)` | 12-bit contactless magnetic rotary encoder (Addr: `0x36`), 0–360° angle, turns & RPM tracking |
| **Laser ToF Distance Sensor (GY-53 / VL53L0X)** | `GPIO 7 (SDA), 8 (SCL)` | Time-of-Flight laser distance sensor (Addr: `0x29`), range 30–2000mm (0.03–2.0m) with mm accuracy |
| **DFPlayer Mini MP3 Player** | `GPIO 17 (TX), 18 (RX)` | UART MP3 module (`UART(1, baudrate=9600, tx=17, rx=18)`), supports track selection, folder, volume, EQ, loop |
| **UART Port** | `GPIO 17 (TX), 18 (RX)` | `UART(1, baudrate=115200, tx=17, rx=18)` |
| **SPI Header & 2.42" OLED (SSD1309)** | `VCC, CS:38, MOSI:36, CLK:35, MISO/DC:37, GND` | 6-pin SPI Connector: `CS=38`, `MOSI=36`, `CLK/SCK=35`, `DC/MISO=37` |

---

## 🛡️ Critical Code Generation Rules for MicroPython

1. **Singleton PWM Pool Manager:**
   ESP32-S3 has 4 hardware PWM timers. Always reuse PWM instances via `_get_pwm(pin, freq)` to avoid `RuntimeError: out of PWM timers`:
   ```python
   _pwm_pool = {}
   def _get_pwm(pin, freq=1000):
       if pin not in _pwm_pool:
           _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
       else:
           try: _pwm_pool[pin].freq(freq)
           except Exception: pass
       return _pwm_pool[pin]
   ```

2. **Auto CPU Safety Yields:**
   Every `while True:` or loop MUST include `time.sleep_ms(5)` to prevent CPU starvation and FreeRTOS task watchdog resets.

3. **Standard Program Entry:**
   ```python
   # ================= LOF TITAN MAIN =================
   import time
   from machine import Pin, PWM, ADC, I2C, SoftI2C, UART
   from supervisor.led_buzzer import hw

   def main():
       # Setup & execution logic
       while True:
           time.sleep_ms(5)

   if __name__ == '__main__':
       main()
   ```
