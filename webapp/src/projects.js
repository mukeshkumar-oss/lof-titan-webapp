export const projects = [
  {
    id: 'cosmic-pulse',
    name: 'Cosmic Pulse Tracker',
    description: 'Track celestial patterns using IMU and light data.',
    code: `# Cosmic Pulse Tracker (Dummy Code)
import time
from supervisor.led_buzzer import hw
print("Initializing Cosmic Pulse Tracker...")
for i in range(5):
    hw.set_leds_connected()
    time.sleep(0.5)
    hw.set_leds_disconnected()
    time.sleep(0.5)
print("Tracking complete.")
`
  },
  {
    id: 'heat-seeker',
    name: 'Heat-Seeker Rover',
    description: 'Autonomous rover seeking thermal signatures.',
    code: `# Heat-Seeker Rover (Dummy Code)
import time
print("Starting Heat-Seeker engines...")
for i in range(1, 4):
    print(f"Scanning sector {i}...")
    time.sleep(1)
print("Target acquired.")
`
  },
  {
    id: 'heartbeat-dj',
    name: 'Heartbeat DJ Bot',
    description: 'Synchronizes music beats with biometric heart rate.',
    code: `# Heartbeat DJ Bot (Dummy Code)
import time
from supervisor.led_buzzer import hw
print("DJ Bot Online! Dropping the beat...")
hw.play_startup_tone()
time.sleep(0.5)
hw.play_run_tone()
print("Beat dropped!")
`
  },
  {
    id: 'invisible-line',
    name: 'Invisible Line Patrol Rover',
    description: 'Detect a UV light signal and follow it autonomously.',
    lesson: {
      title: 'Mission: Invisible Line Patrol',
      slides: [
        {
          title: "Light Detection",
          content: "UV light carries energy that cannot be seen by the human eye but can be detected by special sensors.\nEach UV sensor converts light intensity into an electrical signal (analog value).",
          image: "/assets/invisible-line/image (12).png"
        },
        {
          title: "Signal Comparison",
          content: "The ESP32 reads values from the UV sensors.\nBy comparing these numbers, the robot determines which direction has stronger light.",
          image: "/assets/invisible-line/image (13).png"
        },
        {
          title: "Decision Logic",
          content: "Using simple **if–else conditions**, the robot decides:\n• Center stronger → Move forward\n• Left stronger → Turn left\n• Right stronger → Turn right\n\nThis is called **rule-based autonomous control**.",
          image: "/assets/invisible-line/image (14).png"
        },
        {
          title: "Differential Steering",
          content: "Turning happens when one motor rotates faster than the other.\nDifferent motor speeds create torque, causing smooth directional changes.",
          image: "/assets/invisible-line/image (12).png"
        },
        {
          title: "Continuous Feedback Loop",
          content: "The rover constantly repeats:\n**Sense → Compare → Act → Repeat**\n\nThis closed-loop system allows the robot to correct its path in real time and maintain stable navigation.",
          image: "/assets/invisible-line/image (14).png"
        }
      ]
    },
    code: `"""
ESP32-S3 3 UV Rover - Invisible Line Patrol
Exact MicroPython Carbon-Copy of invisible_linepatrol.ino for LOF TITAN Firmware

Features:
- WiFi SoftAP: SSID="ESP32S3_3UV_ROVER", Password="12345678", IP=192.168.4.1
- Embedded Non-Blocking Web Server (Port 80) with full interactive web dashboard
- 3 UV Sensor Autonomous Line Tracking (120ms cycle)
- Manual Touch D-Pad Web Control
- Live Speed & UV Threshold adjustment
"""

import time
import socket
import select
import network
import gc
from machine import Pin, PWM, ADC
from supervisor.led_buzzer import hw

# ================= MOTOR PINS =================
# Left Motor M1
L_IN1 = 15
L_IN2 = 16

# Right Motor M2
R_IN1 = 13
R_IN2 = 14

# ================= UV SENSOR PINS =================
UV_FRONT_PIN = 1   # GPIO 1 (S2)
UV_LEFT_PIN  = 2   # GPIO 2 (S1)
UV_RIGHT_PIN = 3   # GPIO 3 (S3)

# ================= PWM SETTINGS =================
PWM_FREQ = 5000

# ================= HTML WEB PAGE (Exact Carbon Copy) =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <title>ESP32-S3 3 UV Rover</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background: #101820;
      color: white;
      text-align: center;
    }
    h1 {
      margin-top: 20px;
      font-size: 26px;
      color: #00e5ff;
    }
    .box {
      background: #1b263b;
      width: 88%;
      max-width: 430px;
      margin: 15px auto;
      padding: 15px;
      border-radius: 18px;
      font-size: 18px;
    }
    .value {
      font-size: 22px;
      color: #ffd166;
      font-weight: bold;
    }
    .action {
      font-size: 24px;
      color: #90ee90;
      font-weight: bold;
      margin-top: 10px;
    }
    .modeBtn {
      width: 160px;
      height: 55px;
      border: none;
      border-radius: 15px;
      margin: 8px;
      font-size: 17px;
      font-weight: bold;
      color: white;
      cursor: pointer;
    }
    .auto {
      background: #2a9d8f;
    }
    .manual {
      background: #6c63ff;
    }
    .controller {
      display: grid;
      grid-template-columns: 95px 95px 95px;
      grid-template-rows: 95px 95px 95px;
      gap: 14px;
      justify-content: center;
      align-items: center;
      margin-top: 20px;
    }
    .btn {
      width: 95px;
      height: 95px;
      border: none;
      border-radius: 25px;
      background: linear-gradient(145deg, #00b4d8, #0077b6);
      color: white;
      font-size: 34px;
      font-weight: bold;
      box-shadow: 0 7px 0 #023e8a;
      user-select: none;
      touch-action: none;
      cursor: pointer;
    }
    .btn:active {
      transform: translateY(5px);
      box-shadow: 0 2px 0 #023e8a;
    }
    .stop {
      background: linear-gradient(145deg, #ff4d4d, #c9184a);
      box-shadow: 0 7px 0 #800f2f;
      font-size: 20px;
    }
    .sliderBox {
      background: #1b263b;
      width: 85%;
      max-width: 400px;
      margin: 18px auto;
      padding: 15px;
      border-radius: 18px;
    }
    input[type=range] {
      width: 90%;
    }
    .footer {
      margin-top: 22px;
      font-size: 14px;
      color: #aaa;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <h1>ESP32-S3 3 UV Rover</h1>

  <div class="box">
    <div>Front UV: <span class="value" id="frontUV">0</span></div>
    <div>Left UV: <span class="value" id="leftUV">0</span></div>
    <div>Right UV: <span class="value" id="rightUV">0</span></div>
    <div class="action" id="actionText">STOP</div>
    <div>Mode: <span id="modeText">AUTO UV</span></div>
  </div>

  <button class="modeBtn auto" onclick="setMode('auto')">AUTO UV</button>
  <button class="modeBtn manual" onclick="setMode('manual')">MANUAL</button>

  <div class="controller">
    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('forward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9650;</button>
    <div></div>

    <button class="btn"
      onpointerdown="sendCmd('left')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9664;</button>
    <button class="btn stop" onclick="sendCmd('stop')">STOP</button>
    <button class="btn"
      onpointerdown="sendCmd('right')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9654;</button>

    <div></div>
    <button class="btn"
      onpointerdown="sendCmd('backward')"
      onpointerup="sendCmd('stop')"
      onpointerleave="sendCmd('stop')">&#9660;</button>
    <div></div>
  </div>

  <div class="sliderBox">
    <h2>Motor Speed</h2>
    <input type="range" min="0" max="255" value="170" id="speedSlider" oninput="updateSpeed(this.value)">
    <div>Speed: <span id="speedValue">170</span></div>
  </div>

  <div class="sliderBox">
    <h2>UV Threshold</h2>
    <input type="range" min="0" max="4095" value="300" id="uvSlider" oninput="updateThreshold(this.value)">
    <div>Threshold: <span id="thresholdValue">300</span></div>
  </div>

  <div class="footer">
    WiFi: ESP32S3_3UV_ROVER<br>
    Password: 12345678<br>
    Open: 192.168.4.1
  </div>

<script>
  function sendCmd(cmd) {
    fetch('/cmd?move=' + cmd);
  }
  function setMode(mode) {
    fetch('/mode?value=' + mode);
  }
  function updateSpeed(value) {
    document.getElementById('speedValue').innerHTML = value;
    fetch('/speed?value=' + value);
  }
  function updateThreshold(value) {
    document.getElementById('thresholdValue').innerHTML = value;
    fetch('/threshold?value=' + value);
  }
  function updateStatus() {
    fetch('/status')
      .then(response => response.json())
      .then(data => {
        document.getElementById('frontUV').innerHTML = data.front;
        document.getElementById('leftUV').innerHTML = data.left;
        document.getElementById('rightUV').innerHTML = data.right;
        document.getElementById('actionText').innerHTML = data.action;
        document.getElementById('modeText').innerHTML = data.mode;
      })
      .catch(err => console.log(err));
  }
  setInterval(updateStatus, 500);
  updateStatus();
</script>
</body>
</html>
"""

class InvisibleLinePatrolRover:
    def __init__(self):
        self.motor_speed = 170
        self.uv_threshold = 300
        self.uv_margin = 80
        self.auto_uv_mode = True
        self.current_action = "STOP"

        self.front_uv = 0
        self.left_uv = 0
        self.right_uv = 0

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        # UV Sensors (12-bit: 0..4095)
        self.adc_front = ADC(Pin(UV_FRONT_PIN))
        self.adc_left  = ADC(Pin(UV_LEFT_PIN))
        self.adc_right = ADC(Pin(UV_RIGHT_PIN))
        self.adc_front.atten(ADC.ATTN_11DB)
        self.adc_left.atten(ADC.ATTN_11DB)
        self.adc_right.atten(ADC.ATTN_11DB)

        self.stop_motors()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="ESP32S3_3UV_ROVER", password="12345678")
        time.sleep_ms(200)

        # Web Server Socket (Non-blocking)
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write_pin(self, pwm_pin, value):
        val = max(0, min(255, int(value)))
        duty = int((val / 255.0) * 65535)
        pwm_pin.duty_u16(duty)

    def left_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_l1, spd)
        self._pwm_write_pin(self.pwm_l2, 0)

    def left_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, spd)

    def right_motor_forward(self, spd):
        self._pwm_write_pin(self.pwm_r1, spd)
        self._pwm_write_pin(self.pwm_r2, 0)

    def right_motor_backward(self, spd):
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, spd)

    def stop_motors(self):
        self._pwm_write_pin(self.pwm_l1, 0)
        self._pwm_write_pin(self.pwm_l2, 0)
        self._pwm_write_pin(self.pwm_r1, 0)
        self._pwm_write_pin(self.pwm_r2, 0)
        self.current_action = "STOP"

    def forward(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "FORWARD"

    def backward(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "BACKWARD"

    def left_turn(self):
        self.left_motor_backward(self.motor_speed)
        self.right_motor_forward(self.motor_speed)
        self.current_action = "LEFT"

    def right_turn(self):
        self.left_motor_forward(self.motor_speed)
        self.right_motor_backward(self.motor_speed)
        self.current_action = "RIGHT"

    def read_average_uv(self, adc):
        total = 0
        for _ in range(10):
            total += (adc.read_u16() >> 4)
            time.sleep_ms(2)
        return total // 10

    def auto_uv_control(self):
        self.front_uv = self.read_average_uv(self.adc_front)
        self.left_uv  = self.read_average_uv(self.adc_left)
        self.right_uv = self.read_average_uv(self.adc_right)

        front_detected = self.front_uv > self.uv_threshold
        left_detected  = self.left_uv > self.uv_threshold
        right_detected = self.right_uv > self.uv_threshold

        act_log = ""
        if not front_detected and not left_detected and not right_detected:
            self.stop_motors()
            act_log = "NO UV -> STOP"
        elif self.front_uv >= (self.left_uv + self.uv_margin) and self.front_uv >= (self.right_uv + self.uv_margin):
            self.forward()
            act_log = "FRONT UV -> FORWARD"
        elif self.left_uv > (self.right_uv + self.uv_margin):
            self.left_turn()
            act_log = "LEFT UV -> LEFT"
        elif self.right_uv > (self.left_uv + self.uv_margin):
            self.right_turn()
            act_log = "RIGHT UV -> RIGHT"
        else:
            self.forward()
            act_log = "BALANCED UV -> FORWARD"

        print(f"F={self.front_uv} | L={self.left_uv} | R={self.right_uv} | TH={self.uv_threshold} | ACT={act_log}")

    def handle_client(self):
        events = self.poller.poll(0)
        if not events:
            return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\\r\\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/cmd'):
                        self.auto_uv_mode = False
                        move_cmd = "stop"
                        if 'move=' in path:
                            move_cmd = path.split('move=')[1].split('&')[0].split(' ')[0]

                        if move_cmd == 'forward':
                            self.forward()
                        elif move_cmd == 'backward':
                            self.backward()
                        elif move_cmd == 'left':
                            self.left_turn()
                        elif move_cmd == 'right':
                            self.right_turn()
                        elif move_cmd == 'stop':
                            self.stop_motors()

                        print(f"Manual Command: {move_cmd}")
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nOK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/mode'):
                        if 'value=' in path:
                            mode_val = path.split('value=')[1].split('&')[0].split(' ')[0]
                            if mode_val == 'auto':
                                self.auto_uv_mode = True
                                print("Mode: AUTO UV")
                            elif mode_val == 'manual':
                                self.auto_uv_mode = False
                                self.stop_motors()
                                print("Mode: MANUAL")

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nMode OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/speed'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.motor_speed = max(0, min(255, int(val_str)))
                                print(f"Motor Speed: {self.motor_speed}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nSpeed OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/threshold'):
                        if 'value=' in path:
                            val_str = path.split('value=')[1].split('&')[0].split(' ')[0]
                            try:
                                self.uv_threshold = max(0, min(4095, int(val_str)))
                                print(f"UV Threshold: {self.uv_threshold}")
                            except Exception:
                                pass

                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nThreshold OK"
                        client.sendall(resp.encode('utf-8'))

                    elif path.startswith('/status'):
                        self.front_uv = self.read_average_uv(self.adc_front)
                        self.left_uv  = self.read_average_uv(self.adc_left)
                        self.right_uv = self.read_average_uv(self.adc_right)
                        mode_name = "AUTO UV" if self.auto_uv_mode else "MANUAL"

                        json_data = f'{{"front":{self.front_uv},"left":{self.left_uv},"right":{self.right_uv},"action":"{self.current_action}","mode":"{mode_name}"}}'
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nConnection: close\\r\\n\\r\\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\\r\\nConnection: close\\r\\n\\r\\nNot Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass


def main():
    print()
    print("ESP32-S3 3 UV Rover Started")
    print("WiFi Name: ESP32S3_3UV_ROVER")
    print("Password: 12345678")
    print("Open IP: 192.168.4.1")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = InvisibleLinePatrolRover()
    print("Web Server Started")
    print("AUTO UV MODE STARTED")

    last_uv_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            if rover.auto_uv_mode:
                now = time.ticks_ms()
                if time.ticks_diff(now, last_uv_check) >= 120:
                    last_uv_check = now
                    rover.auto_uv_control()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\\nStopping Invisible Line Patrol Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")


if __name__ == "__main__":
    main()
`
  },
  {
    id: 'aquanova',
    name: 'AquaNova Alert Rover',
    description: 'Environmental monitoring with water leak detection and PIR motion sensing.',
    code: `"""
AquaNova - Environmental Water & Motion Alert Rover
Exact MicroPython Carbon-Copy of Aqua_nova.ino for LOF TITAN Firmware
"""
import time
import socket
import select
import network
import gc
from machine import Pin, PWM, I2C
from supervisor.led_buzzer import hw

# Motor Pins
L_IN1 = 11
L_IN2 = 12
R_IN1 = 9
R_IN2 = 10

# Sensor Pins
PIR_PIN = 2     # GPIO 2
WATER_PIN = 4   # GPIO 4

# OLED Pins
OLED_SDA = 7
OLED_SCL = 8

PWM_FREQ = 5000
MOTOR_SPEED = 100

HTML_PAGE = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>
LoF Titan Alert Rover
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  font-family:
  Arial,
  Helvetica,
  sans-serif;

  background:
  linear-gradient(
    135deg,
    #061526,
    #0d3152
  );

  color: white;

  text-align: center;
}


/* =========================================
   HEADER
   ========================================= */

.header {

  background: #06101d;

  padding: 22px;

  font-size: 27px;

  font-weight: bold;

  letter-spacing: 1px;

  box-shadow:
  0px 4px 15px rgba(0,0,0,0.5);
}


/* =========================================
   MAIN CONTAINER
   ========================================= */

.container {

  max-width: 700px;

  margin: auto;

  padding: 20px;
}


/* =========================================
   SECTION TITLE
   ========================================= */

.section-title {

  font-size: 21px;

  font-weight: bold;

  margin-top: 15px;

  margin-bottom: 20px;
}


/* =========================================
   SENSOR CARDS
   ========================================= */

.sensor-container {

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;

  flex-wrap: wrap;
}


.sensor-card {

  width: 270px;

  padding: 22px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


.sensor-name {

  font-size: 20px;

  font-weight: bold;

  margin-bottom: 15px;
}


.status {

  padding: 18px;

  border-radius: 12px;

  font-size: 18px;

  font-weight: bold;

  transition: 0.3s;
}


/* =========================================
   SAFE STATUS
   ========================================= */

.safe {

  background: #16834a;

  box-shadow:
  0px 0px 12px rgba(22,131,74,0.7);
}


/* =========================================
   ALERT STATUS
   ========================================= */

.alert {

  background: #d52d35;

  box-shadow:
  0px 0px 18px rgba(255,0,0,0.8);

  animation:
  alertPulse 0.7s infinite alternate;
}


@keyframes alertPulse {

  from {

    transform: scale(1);
  }

  to {

    transform: scale(1.05);
  }
}


/* =========================================
   MOTOR CONTROL PANEL
   ========================================= */

.control-panel {

  margin-top: 30px;

  padding: 25px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


/* =========================================
   CONTROL GRID
   ========================================= */

.control-grid {

  display: grid;

  grid-template-columns:
  100px
  100px
  100px;

  gap: 15px;

  justify-content: center;

  margin-top: 20px;
}


/* =========================================
   CONTROL BUTTONS
   ========================================= */

button {

  width: 100px;

  height: 65px;

  border: none;

  border-radius: 14px;

  background: #178ce5;

  color: white;

  font-size: 15px;

  font-weight: bold;

  cursor: pointer;

  box-shadow:
  0px 5px 12px rgba(0,0,0,0.5);

  touch-action: none;

  user-select: none;
}


button:hover {

  background: #0d75c4;
}


button:active {

  transform: scale(0.92);
}


/* =========================================
   STOP BUTTON
   ========================================= */

.stop-button {

  background: #e02e38;
}


.stop-button:hover {

  background: #bb2029;
}


/* =========================================
   EMPTY GRID
   ========================================= */

.blank {

  visibility: hidden;
}


/* =========================================
   CONNECTION
   ========================================= */

.connection {

  margin-top: 25px;

  padding: 10px;

  font-size: 14px;

  color: #a6cce8;
}


.online-dot {

  display: inline-block;

  width: 10px;

  height: 10px;

  background: #24d264;

  border-radius: 50%;

  margin-right: 6px;
}


/* =========================================
   MOBILE
   ========================================= */

@media(max-width: 420px) {

  .header {

    font-size: 21px;
  }


  .control-grid {

    grid-template-columns:
    85px
    85px
    85px;
  }


  button {

    width: 85px;

    font-size: 13px;
  }
}

</style>

</head>


<body>


<!-- =====================================
     HEADER
     ===================================== -->

<div class="header">

LOF TITAN ALERT ROVER

</div>


<div class="container">


<!-- =====================================
     SENSOR STATUS
     ===================================== -->

<div class="section-title">

LIVE SENSOR STATUS

</div>


<div class="sensor-container">


<!-- =====================================
     MOTION SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

MOTION SENSOR

</div>


<div
id="motion"
class="status safe"
>

NO MOTION

</div>

</div>


<!-- =====================================
     WATER SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

WATER SENSOR

</div>


<div
id="water"
class="status safe"
>

NO WATER

</div>

</div>


</div>


<!-- =====================================
     ROVER CONTROL
     ===================================== -->

<div class="control-panel">


<div class="section-title">

ROVER CONTROL

</div>


<div class="control-grid">


<!-- ROW 1 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/forward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

FORWARD

</button>


<div class="blank"></div>


<!-- ROW 2 -->

<button

onpointerdown="
startMove('/left')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

LEFT

</button>


<button

class="stop-button"

onclick="
sendCommand('/stop')
"

>

STOP

</button>


<button

onpointerdown="
startMove('/right')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

RIGHT

</button>


<!-- ROW 3 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/backward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

BACKWARD

</button>


<div class="blank"></div>


</div>

</div>


<!-- =====================================
     CONNECTION
     ===================================== -->

<div class="connection">

<span class="online-dot"></span>

ESP32-S3 Direct Wi-Fi Dashboard

<br><br>

Connect to: LOF_TITAN_ROVER<br><br>Open: 192.168.4.1

</div>


</div>


<script>

// ==========================================
// MOTOR CONTROL
// ==========================================

let moving = false;


function sendCommand(command) {

  fetch(
    command,
    {
      cache: "no-store"
    }
  )

  .catch(error => {

    console.log(
      "Command Error",
      error
    );

  });
}


// ==========================================
// START MOVEMENT
// ==========================================

function startMove(command) {

  moving = true;

  sendCommand(command);
}


// ==========================================
// STOP MOVEMENT
// ==========================================

function stopMove() {

  if(moving) {

    moving = false;

    sendCommand('/stop');
  }
}


// ==========================================
// SENSOR UPDATE
// ==========================================

function updateSensors() {

  fetch(
    '/status',
    {
      cache: 'no-store'
    }
  )

  .then(response => response.json())

  .then(data => {


    // ======================================
    // MOTION
    // ======================================

    let motion =
    document.getElementById(
      "motion"
    );


    if(data.motion === true) {

      motion.innerHTML =
      "MOTION DETECTED";

      motion.className =
      "status alert";
    }

    else {

      motion.innerHTML =
      "NO MOTION";

      motion.className =
      "status safe";
    }


    // ======================================
    // WATER
    // ======================================

    let water =
    document.getElementById(
      "water"
    );


    if(data.water === true) {

      water.innerHTML =
      "WATER DETECTED";

      water.className =
      "status alert";
    }

    else {

      water.innerHTML =
      "NO WATER";

      water.className =
      "status safe";
    }

  })

  .catch(error => {

    console.log(
      "Dashboard connection error"
    );

  });
}


// Update every 500 ms

setInterval(
  updateSensors,
  500
);


// First update immediately

updateSensors();


// Stop rover if browser loses focus

window.addEventListener(
  "blur",
  function() {

    sendCommand('/stop');

    moving = false;
  }
);


// Stop rover before page closes

window.addEventListener(
  "beforeunload",
  function() {

    sendCommand('/stop');
  }
);

</script>


</body>

</html>"""

class AquaNovaRover:
    def __init__(self):
        self.motion_detected = False
        self.water_detected = False
        self.prev_motion = False
        self.prev_water = False

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        self.pir = Pin(PIR_PIN, Pin.IN)
        self.water = Pin(WATER_PIN, Pin.IN)

        self.oled = None
        try:
            from ssd1306 import SSD1306_I2C
            i2c = I2C(0, scl=Pin(OLED_SCL), sda=Pin(OLED_SDA), freq=400000)
            self.oled = SSD1306_I2C(128, 64, i2c)
        except Exception:
            self.oled = None

        self.stop_motors()
        self.update_oled()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="LOF_TITAN_ROVER", password="12345678")
        self.ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'))
        time.sleep_ms(200)

        # Web Server Socket
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write(self, pwm_pin, val):
        val = max(0, min(255, val))
        pwm_pin.duty_u16(int((val / 255.0) * 65535))

    def leftMotorForward(self):
        self._pwm_write(self.pwm_l1, MOTOR_SPEED)
        self._pwm_write(self.pwm_l2, 0)

    def leftMotorBackward(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, MOTOR_SPEED)

    def rightMotorForward(self):
        self._pwm_write(self.pwm_r1, MOTOR_SPEED)
        self._pwm_write(self.pwm_r2, 0)

    def rightMotorBackward(self):
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, MOTOR_SPEED)

    def stop_motors(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, 0)
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, 0)

    def forward(self):
        self.leftMotorForward()
        self.rightMotorForward()
        print("ROVER -> FORWARD")

    def backward(self):
        self.leftMotorBackward()
        self.rightMotorBackward()
        print("ROVER -> BACKWARD")

    def left(self):
        self.leftMotorBackward()
        self.rightMotorForward()
        print("ROVER -> LEFT")

    def right(self):
        self.leftMotorForward()
        self.rightMotorBackward()
        print("ROVER -> RIGHT")

    def update_oled(self):
        if not self.oled: return
        try:
            self.oled.fill(0)
            if self.motion_detected and self.water_detected:
                self.oled.text("Motion Detected!", 0, 20)
                self.oled.text("Water Detected!", 0, 45)
            elif self.motion_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Motion Detected!", 0, 43)
            elif self.water_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Water Detected!", 0, 43)
            else:
                self.oled.text("SYSTEM SAFE", 20, 25)
                self.oled.text("No Alert", 25, 48)
            self.oled.show()
        except Exception:
            pass

    def check_sensors(self):
        self.motion_detected = (self.pir.value() == 1)
        self.water_detected = (self.water.value() == 1)

        if self.motion_detected != self.prev_motion:
            if self.motion_detected:
                print("ALERT: MOTION DETECTED")
            else:
                print("MOTION: CLEAR")
            self.prev_motion = self.motion_detected

        if self.water_detected != self.prev_water:
            if self.water_detected:
                print("ALERT: WATER DETECTED")
            else:
                print("WATER: CLEAR")
            self.prev_water = self.water_detected

        self.update_oled()

    def handle_client(self):
        events = self.poller.poll(0)
        if not events: return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\r\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/status':
                        motion_str = "true" if self.motion_detected else "false"
                        water_str = "true" if self.water_detected else "false"
                        json_data = f'{"motion":{motion_str},"water":{water_str}}'
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nConnection: close\r\n\r\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/forward':
                        self.forward()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nFORWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/backward':
                        self.backward()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nBACKWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/left':
                        self.left()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nLEFT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/right':
                        self.right()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nRIGHT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/stop':
                        self.stop_motors()
                        resp = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nSTOP"
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\nNot Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass

def main():
    print("==================================")
    print("      LOF TITAN ALERT ROVER")
    print("      DIRECT ESP32 WI-FI MODE")
    print("==================================")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = AquaNovaRover()

    print("==================================")
    print("SYSTEM READY")
    print("CONNECT TO WIFI : LOF_TITAN_ROVER")
    print("PASSWORD        : 12345678")
    print("OPEN BROWSER    : http://192.168.4.1")
    print("==================================")

    last_sensor_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            now = time.ticks_ms()
            if time.ticks_diff(now, last_sensor_check) >= 300:
                last_sensor_check = now
                rover.check_sensors()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\nStopping AquaNova Alert Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")

if __name__ == "__main__":
    main()
`
  },
  {
    id: 'axes-3',
    name: 'Axes 3',
    description: '3-Axis robotic arm controller.',
    code: `# Axes 3 (Dummy Code)
import time
print("Homing X, Y, Z axes...")
time.sleep(2)
print("Axes homed successfully.")
`
  },
  {
    id: 'aqua-nova',
    name: 'AquaNova: Sense Recovery Rover',
    description: 'A fully functional sensing rover that detects motion and water to navigate unpredictable environments.',
    lesson: {
      title: 'Mission: AquaNova Sense Recovery',
      chapters: [
        {
          title: 'Chapter 1: The Challenge',
          slides: [
            {
              title: "The Lost Bot's Recovery",
              content: "Design and build a fully functional sensing rover that can detect motion, sense water, display alerts on an OLED screen, and send notifications.\nJust like a real robot recovering its lost senses after a storm, it must safely navigate unpredictable environments.",
              image: "/assets/aqua_nova/image1.png"
            },
            {
              title: "Challenge Objective",
              content: "Your AquaNova rover must survive in a dark, storm-damaged space station.\nIt must move safely through dark corridors, avoid hazards (like water puddles), and warn astronauts when motion is detected.",
              image: "/assets/aqua_nova/image2.png"
            }
          ]
        },
        {
          title: 'Chapter 2: The 6-Step Process',
          slides: [
            {
              title: "Step 1: Plan Your Rover",
              content: "- Review how the PIR motion sensor and water sensor work.\n- Sketch your rover layout: ESP32 PCB, sensors, OLED, battery.\n- Decide which pins the sensors and motor driver will use.\n- Assign roles for wiring, coding, testing, and debugging.",
              image: "/assets/aqua_nova/image3.png"
            },
            {
              title: "Step 2: Assemble the Hardware",
              content: "- Mount the ESP32, TB6612 motor driver, PIR sensor, water sensor, OLED, and switch on the custom PCB.\n- Connect sensors to their header pins using jumper wires.\n- Double-check wiring before powering on.",
              image: "/assets/aqua_nova/image4.png"
            },
            {
              title: "Step 3: Write and Upload the Program",
              content: "- Ensure the correct Wi-Fi credentials are added.\n- Verify pin setup for PIR, water sensor, motors, and OLED.\n- Upload the code using the LOF TITAN Flasher below.",
              image: "/assets/aqua_nova/image5.png"
            },
            {
              title: "Step 4: Test the Rover",
              content: "- Trigger the PIR sensor with hand movement.\n- Drop a little water onto the water sensor pads to test detection.\n- Check if alerts appear on the OLED and Web Dashboard.",
              image: "/assets/aqua_nova/image6.png"
            },
            {
              title: "Step 5: Innovate and Improve",
              content: "Add at least one enhancement to make AquaNova smarter or safer.\nExamples:\n- Add a buzzer or LED for local alerts.\n- Add a cooldown timer to prevent repeated notifications.\n- Add a safe-stop mode when water is detected.",
              image: "/assets/aqua_nova/image7.png"
            },
            {
              title: "Step 6: Prepare Your Demo",
              content: "Create a short presentation explaining:\n- What problem AquaNova solves.\n- How the motion + water sensors help the rover navigate safely.\n- The improvement you added and why it helps.",
              image: "/assets/aqua_nova/image8.png"
            }
          ]
        },
        {
          title: 'Chapter 3: Reflection & Assessment',
          slides: [
            {
              title: "Reflection Questions",
              type: "interactive",
              questions: [
                "What did your rover do when it sensed motion or water, and how did you know it worked correctly?",
                "Which part of building the rover (wiring, coding, or testing) was the most challenging, and why?",
                "What improvement or extra feature did you add to make your rover smarter or safer?"
              ]
            },
            {
              title: "Bonus Challenge",
              type: "interactive",
              questions: [
                "Scenario: Your AquaNova rover is now exploring a storm-damaged space station. It must move safely through dark corridors, avoid hazards, and warn astronauts when danger is detected.",
                "Question: How would you upgrade your current sensing system to help the rover survive in this risky environment? Describe two new features or sensors you would add."
              ]
            },
            {
              title: "Grading Rubric",
              content: "Teachers will grade your project based on the following criteria:\n\n- **Understanding of Concept (5 points)**: Fully understands motion sensing, water sensing, and rover logic.\n- **Circuit Assembly (5 points)**: All components connected neatly and work correctly.\n- **Code Quality (5 points)**: Code runs smoothly with clear logic.\n- **Problem Solving (5 points)**: Independently solves issues quickly.\n- **Innovation (5 points)**: Adds meaningful upgrades to the rover.",
              image: "/assets/aqua_nova/image9.png"
            }
          ]
        }
      ]
    },
    code: `"""
AquaNova - Environmental Water & Motion Alert Rover
Exact MicroPython Carbon-Copy of Aqua_nova.ino for LOF TITAN Firmware
"""
import time
import socket
import select
import network
import gc
from machine import Pin, PWM, I2C
from supervisor.led_buzzer import hw

# Motor Pins
L_IN1 = 11
L_IN2 = 12
R_IN1 = 9
R_IN2 = 10

# Sensor Pins
PIR_PIN = 2     # GPIO 2
WATER_PIN = 4   # GPIO 4

# OLED Pins
OLED_SDA = 7
OLED_SCL = 8

PWM_FREQ = 5000
MOTOR_SPEED = 100

HTML_PAGE = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
>

<title>
LoF Titan Alert Rover
</title>


<style>

* {
  box-sizing: border-box;
}

body {

  margin: 0;

  font-family:
  Arial,
  Helvetica,
  sans-serif;

  background:
  linear-gradient(
    135deg,
    #061526,
    #0d3152
  );

  color: white;

  text-align: center;
}


/* =========================================
   HEADER
   ========================================= */

.header {

  background: #06101d;

  padding: 22px;

  font-size: 27px;

  font-weight: bold;

  letter-spacing: 1px;

  box-shadow:
  0px 4px 15px rgba(0,0,0,0.5);
}


/* =========================================
   MAIN CONTAINER
   ========================================= */

.container {

  max-width: 700px;

  margin: auto;

  padding: 20px;
}


/* =========================================
   SECTION TITLE
   ========================================= */

.section-title {

  font-size: 21px;

  font-weight: bold;

  margin-top: 15px;

  margin-bottom: 20px;
}


/* =========================================
   SENSOR CARDS
   ========================================= */

.sensor-container {

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 20px;

  flex-wrap: wrap;
}


.sensor-card {

  width: 270px;

  padding: 22px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


.sensor-name {

  font-size: 20px;

  font-weight: bold;

  margin-bottom: 15px;
}


.status {

  padding: 18px;

  border-radius: 12px;

  font-size: 18px;

  font-weight: bold;

  transition: 0.3s;
}


/* =========================================
   SAFE STATUS
   ========================================= */

.safe {

  background: #16834a;

  box-shadow:
  0px 0px 12px rgba(22,131,74,0.7);
}


/* =========================================
   ALERT STATUS
   ========================================= */

.alert {

  background: #d52d35;

  box-shadow:
  0px 0px 18px rgba(255,0,0,0.8);

  animation:
  alertPulse 0.7s infinite alternate;
}


@keyframes alertPulse {

  from {

    transform: scale(1);
  }

  to {

    transform: scale(1.05);
  }
}


/* =========================================
   MOTOR CONTROL PANEL
   ========================================= */

.control-panel {

  margin-top: 30px;

  padding: 25px;

  background: #112d48;

  border-radius: 18px;

  box-shadow:
  0px 6px 20px rgba(0,0,0,0.4);
}


/* =========================================
   CONTROL GRID
   ========================================= */

.control-grid {

  display: grid;

  grid-template-columns:
  100px
  100px
  100px;

  gap: 15px;

  justify-content: center;

  margin-top: 20px;
}


/* =========================================
   CONTROL BUTTONS
   ========================================= */

button {

  width: 100px;

  height: 65px;

  border: none;

  border-radius: 14px;

  background: #178ce5;

  color: white;

  font-size: 15px;

  font-weight: bold;

  cursor: pointer;

  box-shadow:
  0px 5px 12px rgba(0,0,0,0.5);

  touch-action: none;

  user-select: none;
}


button:hover {

  background: #0d75c4;
}


button:active {

  transform: scale(0.92);
}


/* =========================================
   STOP BUTTON
   ========================================= */

.stop-button {

  background: #e02e38;
}


.stop-button:hover {

  background: #bb2029;
}


/* =========================================
   EMPTY GRID
   ========================================= */

.blank {

  visibility: hidden;
}


/* =========================================
   CONNECTION
   ========================================= */

.connection {

  margin-top: 25px;

  padding: 10px;

  font-size: 14px;

  color: #a6cce8;
}


.online-dot {

  display: inline-block;

  width: 10px;

  height: 10px;

  background: #24d264;

  border-radius: 50%;

  margin-right: 6px;
}


/* =========================================
   MOBILE
   ========================================= */

@media(max-width: 420px) {

  .header {

    font-size: 21px;
  }


  .control-grid {

    grid-template-columns:
    85px
    85px
    85px;
  }


  button {

    width: 85px;

    font-size: 13px;
  }
}

</style>

</head>


<body>


<!-- =====================================
     HEADER
     ===================================== -->

<div class="header">

LOF TITAN ALERT ROVER

</div>


<div class="container">


<!-- =====================================
     SENSOR STATUS
     ===================================== -->

<div class="section-title">

LIVE SENSOR STATUS

</div>


<div class="sensor-container">


<!-- =====================================
     MOTION SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

MOTION SENSOR

</div>


<div
id="motion"
class="status safe"
>

NO MOTION

</div>

</div>


<!-- =====================================
     WATER SENSOR
     ===================================== -->

<div class="sensor-card">

<div class="sensor-name">

WATER SENSOR

</div>


<div
id="water"
class="status safe"
>

NO WATER

</div>

</div>


</div>


<!-- =====================================
     ROVER CONTROL
     ===================================== -->

<div class="control-panel">


<div class="section-title">

ROVER CONTROL

</div>


<div class="control-grid">


<!-- ROW 1 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/forward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

FORWARD

</button>


<div class="blank"></div>


<!-- ROW 2 -->

<button

onpointerdown="
startMove('/left')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

LEFT

</button>


<button

class="stop-button"

onclick="
sendCommand('/stop')
"

>

STOP

</button>


<button

onpointerdown="
startMove('/right')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

RIGHT

</button>


<!-- ROW 3 -->

<div class="blank"></div>


<button

onpointerdown="
startMove('/backward')
"

onpointerup="
stopMove()
"

onpointerleave="
stopMove()
"

onpointercancel="
stopMove()
"

>

BACKWARD

</button>


<div class="blank"></div>


</div>

</div>


<!-- =====================================
     CONNECTION
     ===================================== -->

<div class="connection">

<span class="online-dot"></span>

ESP32-S3 Direct Wi-Fi Dashboard

<br><br>

Connect to: LOF_TITAN_ROVER<br><br>Open: 192.168.4.1

</div>


</div>


<script>

// ==========================================
// MOTOR CONTROL
// ==========================================

let moving = false;


function sendCommand(command) {

  fetch(
    command,
    {
      cache: "no-store"
    }
  )

  .catch(error => {

    console.log(
      "Command Error",
      error
    );

  });
}


// ==========================================
// START MOVEMENT
// ==========================================

function startMove(command) {

  moving = true;

  sendCommand(command);
}


// ==========================================
// STOP MOVEMENT
// ==========================================

function stopMove() {

  if(moving) {

    moving = false;

    sendCommand('/stop');
  }
}


// ==========================================
// SENSOR UPDATE
// ==========================================

function updateSensors() {

  fetch(
    '/status',
    {
      cache: 'no-store'
    }
  )

  .then(response => response.json())

  .then(data => {


    // ======================================
    // MOTION
    // ======================================

    let motion =
    document.getElementById(
      "motion"
    );


    if(data.motion === true) {

      motion.innerHTML =
      "MOTION DETECTED";

      motion.className =
      "status alert";
    }

    else {

      motion.innerHTML =
      "NO MOTION";

      motion.className =
      "status safe";
    }


    // ======================================
    // WATER
    // ======================================

    let water =
    document.getElementById(
      "water"
    );


    if(data.water === true) {

      water.innerHTML =
      "WATER DETECTED";

      water.className =
      "status alert";
    }

    else {

      water.innerHTML =
      "NO WATER";

      water.className =
      "status safe";
    }

  })

  .catch(error => {

    console.log(
      "Dashboard connection error"
    );

  });
}


// Update every 500 ms

setInterval(
  updateSensors,
  500
);


// First update immediately

updateSensors();


// Stop rover if browser loses focus

window.addEventListener(
  "blur",
  function() {

    sendCommand('/stop');

    moving = false;
  }
);


// Stop rover before page closes

window.addEventListener(
  "beforeunload",
  function() {

    sendCommand('/stop');
  }
);

</script>


</body>

</html>"""

class AquaNovaRover:
    def __init__(self):
        self.motion_detected = False
        self.water_detected = False
        self.prev_motion = False
        self.prev_water = False

        # Deinit existing PWM
        for p in (L_IN1, L_IN2, R_IN1, R_IN2):
            try:
                PWM(Pin(p)).deinit()
            except Exception:
                pass

        # Motor PWMs
        self.pwm_l1 = PWM(Pin(L_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_l2 = PWM(Pin(L_IN2), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r1 = PWM(Pin(R_IN1), freq=PWM_FREQ, duty_u16=0)
        self.pwm_r2 = PWM(Pin(R_IN2), freq=PWM_FREQ, duty_u16=0)

        self.pir = Pin(PIR_PIN, Pin.IN)
        self.water = Pin(WATER_PIN, Pin.IN)

        self.oled = None
        try:
            from ssd1306 import SSD1306_I2C
            i2c = I2C(0, scl=Pin(OLED_SCL), sda=Pin(OLED_SDA), freq=400000)
            self.oled = SSD1306_I2C(128, 64, i2c)
        except Exception:
            self.oled = None

        self.stop_motors()
        self.update_oled()

        # WiFi SoftAP Setup
        self.ap = network.WLAN(network.AP_IF)
        self.ap.active(True)
        self.ap.config(essid="LOF_TITAN_ROVER", password="12345678")
        self.ap.ifconfig(('192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'))
        time.sleep_ms(200)

        # Web Server Socket
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind(('0.0.0.0', 80))
        self.server_sock.listen(5)
        self.server_sock.setblocking(False)

        self.poller = select.poll()
        self.poller.register(self.server_sock, select.POLLIN)

    def _pwm_write(self, pwm_pin, val):
        val = max(0, min(255, val))
        pwm_pin.duty_u16(int((val / 255.0) * 65535))

    def leftMotorForward(self):
        self._pwm_write(self.pwm_l1, MOTOR_SPEED)
        self._pwm_write(self.pwm_l2, 0)

    def leftMotorBackward(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, MOTOR_SPEED)

    def rightMotorForward(self):
        self._pwm_write(self.pwm_r1, MOTOR_SPEED)
        self._pwm_write(self.pwm_r2, 0)

    def rightMotorBackward(self):
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, MOTOR_SPEED)

    def stop_motors(self):
        self._pwm_write(self.pwm_l1, 0)
        self._pwm_write(self.pwm_l2, 0)
        self._pwm_write(self.pwm_r1, 0)
        self._pwm_write(self.pwm_r2, 0)

    def forward(self):
        self.leftMotorForward()
        self.rightMotorForward()
        print("ROVER -> FORWARD")

    def backward(self):
        self.leftMotorBackward()
        self.rightMotorBackward()
        print("ROVER -> BACKWARD")

    def left(self):
        self.leftMotorBackward()
        self.rightMotorForward()
        print("ROVER -> LEFT")

    def right(self):
        self.leftMotorForward()
        self.rightMotorBackward()
        print("ROVER -> RIGHT")

    def update_oled(self):
        if not self.oled: return
        try:
            self.oled.fill(0)
            if self.motion_detected and self.water_detected:
                self.oled.text("Motion Detected!", 0, 20)
                self.oled.text("Water Detected!", 0, 45)
            elif self.motion_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Motion Detected!", 0, 43)
            elif self.water_detected:
                self.oled.text("ALERT!", 35, 18)
                self.oled.text("Water Detected!", 0, 43)
            else:
                self.oled.text("SYSTEM SAFE", 20, 25)
                self.oled.text("No Alert", 25, 48)
            self.oled.show()
        except Exception:
            pass

    def check_sensors(self):
        self.motion_detected = (self.pir.value() == 1)
        self.water_detected = (self.water.value() == 1)

        if self.motion_detected != self.prev_motion:
            if self.motion_detected:
                print("ALERT: MOTION DETECTED")
            else:
                print("MOTION: CLEAR")
            self.prev_motion = self.motion_detected

        if self.water_detected != self.prev_water:
            if self.water_detected:
                print("ALERT: WATER DETECTED")
            else:
                print("WATER: CLEAR")
            self.prev_water = self.water_detected

        self.update_oled()

    def handle_client(self):
        events = self.poller.poll(0)
        if not events: return

        for sock, evt in events:
            if evt & select.POLLIN:
                try:
                    client, _ = self.server_sock.accept()
                    client.settimeout(1.0)
                    request = client.recv(1024).decode('utf-8')
                    if not request:
                        client.close()
                        continue

                    req_line = request.split('\\r\\n')[0]
                    parts = req_line.split(' ')
                    if len(parts) < 2:
                        client.close()
                        continue

                    path = parts[1]

                    if path == '/' or path == '/index.html':
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/html; charset=utf-8\\r\\nConnection: close\\r\\n\\r\\n" + HTML_PAGE
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/status':
                        motion_str = "true" if self.motion_detected else "false"
                        water_str = "true" if self.water_detected else "false"
                        json_data = f'{"motion":{motion_str},"water":{water_str}}'
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\nConnection: close\\r\\n\\r\\n" + json_data
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/forward':
                        self.forward()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nFORWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/backward':
                        self.backward()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nBACKWARD"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/left':
                        self.left()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nLEFT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/right':
                        self.right()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nRIGHT"
                        client.sendall(resp.encode('utf-8'))

                    elif path == '/stop':
                        self.stop_motors()
                        resp = "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nConnection: close\\r\\n\\r\\nSTOP"
                        client.sendall(resp.encode('utf-8'))

                    else:
                        resp = "HTTP/1.1 404 Not Found\\r\\nConnection: close\\r\\n\\r\\nNot Found"
                        client.sendall(resp.encode('utf-8'))

                    client.close()
                except Exception:
                    try:
                        client.close()
                    except Exception:
                        pass

    def cleanup(self):
        self.stop_motors()
        try:
            self.server_sock.close()
        except Exception:
            pass

def main():
    print("==================================")
    print("      LOF TITAN ALERT ROVER")
    print("      DIRECT ESP32 WI-FI MODE")
    print("==================================")

    hw.play_startup_tone()
    hw.set_leds_connected()

    rover = AquaNovaRover()

    print("==================================")
    print("SYSTEM READY")
    print("CONNECT TO WIFI : LOF_TITAN_ROVER")
    print("PASSWORD        : 12345678")
    print("OPEN BROWSER    : http://192.168.4.1")
    print("==================================")

    last_sensor_check = time.ticks_ms()

    try:
        while True:
            rover.handle_client()

            now = time.ticks_ms()
            if time.ticks_diff(now, last_sensor_check) >= 300:
                last_sensor_check = now
                rover.check_sensors()

            time.sleep_ms(10)
            gc.collect()

    except KeyboardInterrupt:
        print("\\nStopping AquaNova Alert Rover...")
    finally:
        rover.cleanup()
        hw.set_leds_disconnected()
        print("Rover stopped safely.")

if __name__ == "__main__":
    main()
`
  }

];
