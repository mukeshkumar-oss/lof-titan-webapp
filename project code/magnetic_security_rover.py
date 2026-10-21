# ==============================================================================
# LOF TITAN — Intelligent Continuous-PID Magnetic Security Rover
# Speed Range: 0% to 40% Full Dynamic Envelope
# Real-Time Trajectory Control: Continuous Heading Lock (+/-2.5° Tolerance) Throughout Patrol Legs
# Intelligent Adaptive Pivot: Dynamic PWM & Frequency Auto-Tuning via Compass Feedback
# Heat Intrusion Alarm: 27°C Threshold (AMG8833 8x8 IR Thermal Matrix)
# Hardware: ESP32-S3 | Motors: M1 (15,16) & M2 (13,14) | I2C: SDA 7, SCL 8
# Sensors: AMG8833 (0x69) 8x8 IR Thermal & QMC5883L (0x0D) Digital Compass
# Web Server: WiFi Hotspot (192.168.4.1) Live Heatmap & Dual-Heading Telemetry
# ==============================================================================

import time
import math
import struct
import network
import socket
import select
import ujson
from machine import Pin, PWM, SoftI2C

# ================= GLOBAL CONFIGURATION =================
MAX_SPEED_PCT = 40.0          # Maximum motor speed envelope (40%)
ALARM_TEMP_THRESHOLD = 27.0   # Heat intrusion alarm threshold (°C)
PATROL_DURATION_SEC = 8.0     # Active patrol leg duration per direction (seconds)

# ================= 1. SINGLETON PWM MOTOR INTERFACE (0% - 40% RANGE) =================
_pwm_pool = {}
_current_motor_freq = 1000

def _get_pwm(pin, freq=None):
    global _current_motor_freq
    f = freq if freq is not None else _current_motor_freq
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=f)
    else:
        if freq is not None:
            try: _pwm_pool[pin].freq(freq)
            except Exception: pass
    return _pwm_pool[pin]

def set_motor_freq(freq):
    global _current_motor_freq
    f = int(max(60, min(3000, freq)))
    if f != _current_motor_freq:
        _current_motor_freq = f
        for pin in (13, 14, 15, 16):
            if pin in _pwm_pool:
                try: _pwm_pool[pin].freq(f)
                except Exception: pass

def _raw_m1(duty_pct, fwd=True, freq=None):
    if freq is not None:
        set_motor_freq(freq)
    capped_pct = max(0.0, min(MAX_SPEED_PCT, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p15 = _get_pwm(15); p16 = _get_pwm(16)
    if duty == 0: p15.duty(0); p16.duty(0)
    elif fwd: p15.duty(duty); p16.duty(0)
    else: p15.duty(0); p16.duty(duty)

def _raw_m2(duty_pct, fwd=True, freq=None):
    if freq is not None:
        set_motor_freq(freq)
    capped_pct = max(0.0, min(MAX_SPEED_PCT, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p13 = _get_pwm(13); p14 = _get_pwm(14)
    if duty == 0: p13.duty(0); p14.duty(0)
    elif fwd: p13.duty(duty); p14.duty(0)
    else: p13.duty(0); p14.duty(duty)

def brake_motors():
    global _current_m1, _current_m2
    _raw_m1(0)
    _raw_m2(0)
    _current_m1 = 0.0; _current_m2 = 0.0

def active_brake_pulse(reverse_m1_fwd, reverse_m2_fwd, ms=20, duty=25.0):
    """
    Applies brief reverse counter-torque to immediately arrest rotational momentum.
    """
    _raw_m1(duty, fwd=reverse_m1_fwd)
    _raw_m2(duty, fwd=reverse_m2_fwd)
    time.sleep_ms(ms)
    brake_motors()

def _raw_m3(duty_pct, fwd=True):
    # M3 Motor/LED Channel (GPIO 11, 12)
    capped_pct = max(0.0, min(100.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p11 = _get_pwm(11); p12 = _get_pwm(12)
    if duty == 0: p11.duty(0); p12.duty(0)
    elif fwd: p11.duty(duty); p12.duty(0)
    else: p11.duty(0); p12.duty(duty)

def set_m3_led(active, speed=20):
    if active:
        _raw_m3(speed, fwd=True)
    else:
        _raw_m3(0)

def set_buzzer(active):
    buz = _get_pwm(20, freq=2400)
    buz.duty(512 if active else 0)


# ================= 2. ULTRA-SMOOTH SLEW ACCELERATION CONTROLLER =================
_current_m1 = 0.0
_current_m2 = 0.0

def smooth_motors(target_m1, target_m2, max_step=2.0, freq=None):
    """
    Slew-rate limiter from 0% to 40%:
    Smoothly ramps motor speed without sudden jolts or loss of wheel traction.
    """
    global _current_m1, _current_m2
    if freq is not None:
        set_motor_freq(freq)
    
    target_m1 = max(-MAX_SPEED_PCT, min(MAX_SPEED_PCT, target_m1))
    target_m2 = max(-MAX_SPEED_PCT, min(MAX_SPEED_PCT, target_m2))
    
    # Smooth ramp M1
    if _current_m1 < target_m1:
        _current_m1 = min(target_m1, _current_m1 + max_step)
    elif _current_m1 > target_m1:
        _current_m1 = max(target_m1, _current_m1 - max_step)
        
    # Smooth ramp M2
    if _current_m2 < target_m2:
        _current_m2 = min(target_m2, _current_m2 + max_step)
    elif _current_m2 > target_m2:
        _current_m2 = max(target_m2, _current_m2 - max_step)
        
    _raw_m1(abs(_current_m1), fwd=(_current_m1 >= 0))
    _raw_m2(abs(_current_m2), fwd=(_current_m2 >= 0))

def stop_smooth():
    global _current_m1, _current_m2
    for _ in range(8):
        smooth_motors(0, 0, max_step=5.0)
        time.sleep_ms(15)
    brake_motors()


# ================= 3. I2C SENSORS (COMPASS & THERMAL CAMERA) =================
class _TitanQMC5883L:
    def __init__(self, addr=0x0D):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
        self.x = 0; self.y = 0; self.z = 0
        self.heading = 0.0
        self.direction = "N"
        self.temp = 25.0
        self._h_buf = [0.0, 0.0, 0.0]
        self.init_sensor()

    def _w(self, reg, val):
        try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception: pass

    def _r(self, reg, n=1):
        try: return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception: pass
        return bytearray(n)

    def init_sensor(self):
        self._w(0x0A, 0x80)
        time.sleep_ms(20)
        self._w(0x0B, 0x01)
        self._w(0x09, 0x1D)
        time.sleep_ms(25)
        # Pre-seed buffer with initial measurement to eliminate startup step
        data = self._r(0x00, 6)
        if len(data) == 6:
            rx, ry, _ = struct.unpack('<hhh', data)
            deg = math.degrees(math.atan2(ry, rx))
            if deg < 0: deg += 360.0
            self._h_buf = [deg, deg, deg]
            self.heading = round(deg, 1)

    def update(self):
        data = self._r(0x00, 6)
        if len(data) == 6:
            raw_x, raw_y, raw_z = struct.unpack('<hhh', data)
            self.x = raw_x; self.y = raw_y; self.z = raw_z
            rad = math.atan2(self.y, self.x)
            deg = math.degrees(rad)
            if deg < 0: deg += 360.0
            
            # 3-sample circular median filter with 0/360 boundary unwrap
            self._h_buf.pop(0)
            self._h_buf.append(deg)
            h0, h1, h2 = self._h_buf
            if max(h0, h1, h2) - min(h0, h1, h2) > 180.0:
                u0 = h0 + 360.0 if h0 < 180.0 else h0
                u1 = h1 + 360.0 if h1 < 180.0 else h1
                u2 = h2 + 360.0 if h2 < 180.0 else h2
                med = sorted([u0, u1, u2])[1] % 360.0
            else:
                med = sorted([h0, h1, h2])[1]
                
            self.heading = round(med, 1)
            
            dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
            idx = int((self.heading + 22.5) / 45.0) % 8
            self.direction = dirs[idx]
        return self.heading


class _TitanAMG8833:
    def __init__(self, addr=0x69):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
        self.pixels = [25.0] * 64
        self.thermistor = 25.0
        self.max_temp = 25.0
        self.min_temp = 25.0
        self.avg_temp = 25.0
        self.init_sensor()

    def _w(self, reg, val):
        try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception: pass

    def _r(self, reg, n=1):
        try: return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception: pass
        return bytearray(n)

    def init_sensor(self):
        self._w(0x00, 0x00)
        self._w(0x01, 0x3F)
        self._w(0x02, 0x00)
        time.sleep_ms(50)

    def update(self):
        data = self._r(0x80, 128)
        if len(data) == 128:
            new_pixels = []
            for i in range(64):
                raw = (data[2*i + 1] << 8) | data[2*i]
                if raw & 0x800: raw -= 0x1000
                new_pixels.append(round(raw * 0.25, 1))
            self.pixels = new_pixels
            self.max_temp = max(self.pixels)
            self.min_temp = min(self.pixels)
            self.avg_temp = round(sum(self.pixels) / 64.0, 1)
        return self.max_temp

compass = _TitanQMC5883L()
thermal = _TitanAMG8833()


# ================= 4. INTELLIGENT ADAPTIVE PID CONTROLLER =================
class ContinuousHeadingPID:
    def __init__(self, kp=0.65, ki=0.012, kd=0.28):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.integral = 0.0
        self.prev_error = 0.0
        self.last_time = time.ticks_ms()

    def reset(self):
        self.integral = 0.0
        self.prev_error = 0.0
        self.last_time = time.ticks_ms()

    def compute(self, target, current):
        now = time.ticks_ms()
        dt = time.ticks_diff(now, self.last_time) / 1000.0
        if dt <= 0.001: dt = 0.02
        self.last_time = now

        # Shortest circular error (-180 to +180)
        error = (target - current + 180) % 360 - 180

        # Anti-windup integral
        if abs(error) < 18.0:
            self.integral += error * dt
            self.integral = max(-6.0, min(6.0, self.integral))
        else:
            self.integral = 0.0

        # Derivative on error rate
        d_error = (error - self.prev_error) / dt
        self.prev_error = error

        pid_out = (self.kp * error) + (self.ki * self.integral) + (self.kd * d_error)
        return error, pid_out

align_pid = ContinuousHeadingPID(kp=0.50, ki=0.010, kd=0.22)
cruise_pid = ContinuousHeadingPID(kp=0.60, ki=0.012, kd=0.26)


# ================= 5. EMBEDDED REAL-TIME WEB SERVER =================
HTML_PAGE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LOF TITAN Security Rover</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #070a12; color: #f8fafc; margin: 0; padding: 14px; text-align: center; }
    .card { background: #111827; border-radius: 20px; padding: 18px; margin: 10px auto; max-width: 450px; border: 1px solid #1f2937; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.8); }
    h1 { font-size: 1.25rem; color: #38bdf8; margin: 0 0 10px; font-weight: 800; }
    .status-badge { display: inline-block; padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 11px; margin-bottom: 14px; letter-spacing: 0.5px; }
    .badge-ok { background: #064e3b; color: #34d399; border: 1px solid #059669; }
    .badge-alarm { background: #881337; color: #fda4af; border: 1px solid #e11d48; animation: pulse 0.7s infinite alternate; }
    @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.05); } }
    
    .grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; background: #0b1120; padding: 10px; border-radius: 14px; border: 1px solid #1f2937; }
    .pixel { aspect-ratio: 1; border-radius: 4px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #ffffff; text-shadow: 0 1px 2px #000000; }
    
    .nav-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .nav-box { background: #1f2937; border: 1px solid #374151; border-radius: 14px; padding: 10px; }
    .nav-label { font-size: 10px; color: #9ca3af; font-family: monospace; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .nav-val { font-size: 14px; font-family: monospace; font-weight: 900; }
    .cur-val { color: #38bdf8; }
    .tgt-val { color: #fbbf24; }
    
    .stats-bar { display: flex; justify-content: space-around; margin-top: 12px; font-family: monospace; font-size: 11px; color: #94a3b8; background: #0b1120; padding: 8px; border-radius: 12px; border: 1px solid #1f2937; }
    .stat-num { font-size: 13px; font-weight: 800; color: #f59e0b; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🛡️ LOF TITAN Security Rover</h1>
    <div id="status" class="status-badge badge-ok">CONTINUOUS PID LOCK ACTIVE (+/-2°)</div>
    
    <div class="grid" id="heatmap"></div>

    <div class="nav-grid">
      <div class="nav-box">
        <div class="nav-label">🧭 Current Heading</div>
        <div class="nav-val cur-val" id="curHeading">--° (--)</div>
      </div>
      <div class="nav-box">
        <div class="nav-label">🎯 Targeted Heading</div>
        <div class="nav-val tgt-val" id="tgtHeading">--° (--)</div>
      </div>
    </div>

    <div class="stats-bar">
      <div>Max Temp<div class="stat-num" id="maxTemp">-- °C</div></div>
      <div>Time Left<div class="stat-num" id="timer">8.0s</div></div>
      <div>Speed Range<div class="stat-num">0% - 40%</div></div>
    </div>
  </div>

  <script>
    function tempToColor(t) {
      const norm = Math.max(0, Math.min(1, (t - 20) / (32 - 20)));
      const hue = (1 - norm) * 240;
      return `hsl(${hue}, 95%, 48%)`;
    }

    async function fetchTelemetry() {
      try {
        const res = await fetch('/data?t=' + Date.now(), { cache: 'no-store' });
        const d = await res.json();
        
        const grid = document.getElementById('heatmap');
        grid.innerHTML = '';
        d.pixels.forEach(p => {
          const div = document.createElement('div');
          div.className = 'pixel';
          div.style.backgroundColor = tempToColor(p);
          div.innerText = p.toFixed(0);
          grid.appendChild(div);
        });

        document.getElementById('curHeading').innerText = d.cur_angle.toFixed(1) + '° (' + d.cur_dir + ')';
        document.getElementById('tgtHeading').innerText = d.tgt_angle.toFixed(1) + '° (' + d.tgt_dir + ')';
        document.getElementById('maxTemp').innerText = d.max.toFixed(1) + ' °C';
        document.getElementById('timer').innerText = d.time_left.toFixed(1) + 's';

        const st = document.getElementById('status');
        if (d.alarm) {
          st.className = 'status-badge badge-alarm';
          st.innerText = '🚨 HEAT INTRUSION DETECTED (>27°C)';
        } else {
          st.className = 'status-badge badge-ok';
          st.innerText = '✅ ADVANCING TOWARDS ' + d.tgt_dir + ' (' + d.tgt_angle.toFixed(0) + '°)';
        }
      } catch(e) {}
    }
    setInterval(fetchTelemetry, 300);
    fetchTelemetry();
  </script>
</body>
</html>"""

def start_wifi_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid="TITAN_SECURITY_ROVER", password="12345678", authmode=network.AUTH_WPA_WPA2_PSK)
    print("[WIFI AP READY] SSID: TITAN_SECURITY_ROVER | IP:", ap.ifconfig()[0])
    return ap

_last_thermal_update = 0

def update_sensors(force_thermal=False):
    global _last_thermal_update
    now = time.ticks_ms()
    compass.update()
    # Thermal sensor reads 128 bytes over I2C; throttle to 4Hz (every 250ms) to keep compass loop ultra-responsive
    if force_thermal or time.ticks_diff(now, _last_thermal_update) >= 250:
        thermal.update()
        _last_thermal_update = now

def process_web_requests(s_sock, mission_state, refresh_sensors=True):
    if refresh_sensors:
        update_sensors()
    if not s_sock: return
    try:
        r, _, _ = select.select([s_sock], [], [], 0)
        if r:
            client, addr = s_sock.accept()
            client.settimeout(0.5)
            req = client.recv(512).decode('utf-8', 'ignore')
            
            if "GET /data" in req:
                thermal.update()  # ensure freshest thermal frame for web dashboard
                payload = ujson.dumps({
                    "max": thermal.max_temp,
                    "min": thermal.min_temp,
                    "avg": thermal.avg_temp,
                    "cur_angle": compass.heading,
                    "cur_dir": compass.direction,
                    "tgt_angle": mission_state.get("target_angle", 0.0),
                    "tgt_dir": mission_state.get("target_dir", "NORTH"),
                    "time_left": mission_state.get("time_left", PATROL_DURATION_SEC),
                    "alarm": mission_state.get("alarm", False),
                    "pixels": thermal.pixels
                })
                resp = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nCache-Control: no-cache, no-store, must-revalidate\r\nConnection: close\r\n\r\n" + payload
                client.sendall(resp.encode('utf-8'))
            else:
                resp = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nCache-Control: no-cache, no-store, must-revalidate\r\nConnection: close\r\n\r\n" + HTML_PAGE
                client.sendall(resp.encode('utf-8'))
            client.close()
    except Exception:
        pass


# ================= 6. CONTINUOUS-ALIGNMENT PATROL MISSION =================

def intelligent_align_to_heading(target_heading, tolerance=2.5, server_socket=None, mission_state=None, timeout_sec=8.0):
    """
    Intelligently pivots rover to target heading using compass sensor feedback.
    Self-adapts PWM duty and PWM frequency to overcome motor deadband/stiction
    without high-speed overshoot or endless left/right oscillation.
    Max speed dynamic envelope up to 40.0%.
    """
    target_dir_name = "NORTH" if (target_heading < 90 or target_heading > 270) else "SOUTH"
    if mission_state is not None:
        mission_state["target_angle"] = target_heading
        mission_state["target_dir"] = target_dir_name

    print(f"\n[INTELLIGENT PIVOT] Aligning to {target_dir_name} ({target_heading:.1f}°) | Max Speed: {MAX_SPEED_PCT}% | Tol: +/-{tolerance}°...")
    
    start_time = time.ticks_ms()
    max_duration_ms = int(timeout_sec * 1000)
    
    align_pid.reset()
    brake_motors()
    time.sleep_ms(30)
    
    # Adaptive state parameters
    adaptive_duty = 20.0       # Starting fine-alignment PWM %
    adaptive_freq = 120        # Low PWM frequency (Hz) for strong inductive kick to break stiction
    last_heading = compass.update()
    stable_count = 0
    prev_error = (target_heading - last_heading + 180.0) % 360.0 - 180.0
    last_step_time = time.ticks_ms()

    while True:
        # Check overall timeout safety
        now = time.ticks_ms()
        if time.ticks_diff(now, start_time) > max_duration_ms:
            print(f"[PIVOT TIMEOUT] Heading: {compass.heading:.1f}° | Reached limit of {timeout_sec}s, locking in.")
            brake_motors()
            break

        # Process server requests & update compass (lightweight non-blocking)
        process_web_requests(server_socket, mission_state)
        curr = compass.heading
        error = (target_heading - curr + 180.0) % 360.0 - 180.0
        abs_err = abs(error)

        # 1. TOLERANCE CHECK
        if abs_err <= tolerance:
            brake_motors()
            stable_count += 1
            if stable_count >= 3:  # Steady confirmation for ~80ms
                print(f"[ALIGNED & LOCKED] Steady at {curr:.1f}° ({compass.direction}) | Error: {error:+.1f}° ✅")
                set_motor_freq(1000) # Reset to default frequency
                break
            time.sleep_ms(25)
            continue

        stable_count = 0
        dt = max(0.01, time.ticks_diff(now, last_step_time) / 1000.0)
        d_err = (error - prev_error) / dt  # Angular velocity (°/sec)
        prev_error = error
        last_step_time = now

        # 2. ADAPTIVE REGIMES BASED ON ERROR DISTANCE & COMPASS VELOCITY
        if abs_err > 35.0:
            # --- REGIME A: FAST SLEW (Large Angle: 35° - 180°) ---
            # Use high frequency (800-1000Hz) and scale speed up to MAX_SPEED_PCT (40%)
            set_motor_freq(800)
            
            # Map error proportionally into 26% - 40% range
            slew_speed = min(MAX_SPEED_PCT, 26.0 + (abs_err - 35.0) * (MAX_SPEED_PCT - 26.0) / (180.0 - 35.0))
            
            # Anticipatory easing if already rotating rapidly
            if abs(d_err) > 80.0:
                slew_speed = max(24.0, slew_speed - 6.0)

            if error > 0:
                smooth_motors(target_m1=-slew_speed, target_m2=slew_speed, max_step=3.5)
            else:
                smooth_motors(target_m1=slew_speed, target_m2=-slew_speed, max_step=3.5)
            
            time.sleep_ms(20)

        elif abs_err > 10.0:
            # --- REGIME B: APPROACH & DECELERATION (10° - 35°) ---
            # Self-adapt frequency downwards (from 600Hz down to 200Hz)
            # and smoothly decelerate speed (from 26% down to 20%)
            ratio = (abs_err - 10.0) / (35.0 - 10.0)
            mid_freq = int(200 + ratio * 400)
            mid_speed = 20.0 + ratio * 6.0
            
            # Anticipatory braking if rotational momentum is high:
            if (error * d_err < 0) and (abs(d_err) * 0.18 > abs_err):
                # Apply brief counter-torque active brake to quench overshoot before it happens
                active_brake_pulse(reverse_m1_fwd=(error < 0), reverse_m2_fwd=(error > 0), ms=20, duty=22.0)
                smooth_motors(0, 0, max_step=8.0)
            else:
                if error > 0:
                    smooth_motors(target_m1=-mid_speed, target_m2=mid_speed, max_step=2.5, freq=mid_freq)
                else:
                    smooth_motors(target_m1=mid_speed, target_m2=-mid_speed, max_step=2.5, freq=mid_freq)
            
            time.sleep_ms(20)

        else:
            # --- REGIME C: PRECISION MICRO-STEP ALIGNMENT (tolerance to 10°) ---
            # Solves: "lower pwm wheel wont rotate and high speed overshoots"
            # 1. Kill any existing rotation momentum from previous phase
            if abs(_current_m1) > 0 or abs(_current_m2) > 0:
                brake_motors()
                time.sleep_ms(20)

            # 2. Compass-Feedback Stall Detection:
            # Check if heading moved since last step
            heading_delta = abs(curr - last_heading)
            if heading_delta < 0.25:
                # Compass confirms rover did NOT move: wheels are stalled by static friction!
                # Intelligently adapt: increase breakaway duty and lower frequency for higher pulse torque
                adaptive_duty = min(32.0, adaptive_duty + 1.2)
                adaptive_freq = max(80, adaptive_freq - 10)
            else:
                # Compass confirms motion: gently settle duty towards minimum viable threshold
                adaptive_duty = max(18.0, adaptive_duty - 0.4)
                last_heading = curr

            # 3. Micro-Pulse Dosing (Kick and Settle):
            pulse_ms = int(max(30, min(50, 25 + abs_err * 2.5)))
            
            # Deliver single calibrated pulse at adaptive frequency and duty
            if error > 0:
                _raw_m1(adaptive_duty, fwd=False, freq=adaptive_freq)
                _raw_m2(adaptive_duty, fwd=True, freq=adaptive_freq)
            else:
                _raw_m1(adaptive_duty, fwd=True, freq=adaptive_freq)
                _raw_m2(adaptive_duty, fwd=False, freq=adaptive_freq)
                
            time.sleep_ms(pulse_ms)
            
            # Dynamic motor brake immediately after pulse to prevent coasting
            brake_motors()
            
            # Settling pause to allow mechanical vibration to dampen before next compass read
            time.sleep_ms(40)


def run_patrol_leg(target_heading, target_name, duration_sec=PATROL_DURATION_SEC, s_sock=None, mission_state=None):
    """
    Advances towards target_heading for duration_sec active seconds while CONTINUOUSLY
    adjusting steering via PID so heading remains strictly within +/-2.5° throughout.
    """
    mission_state["target_angle"] = target_heading
    mission_state["target_dir"] = target_name
    elapsed_active_time = 0.0
    last_tick = time.ticks_ms()

    # 1. Initial pivot alignment to target heading with adaptive PWM & frequency
    intelligent_align_to_heading(target_heading, tolerance=2.5, server_socket=s_sock, mission_state=mission_state)

    cruise_pid.reset()
    base_forward_speed = 32.0 # Cruise speed within 0% to 40% envelope
    set_motor_freq(1000)

    print(f"\n[PATROL START] Advancing towards {target_name} ({target_heading}°) for {duration_sec:.1f}s with continuous PID lock (0-40%)...")

    while elapsed_active_time < duration_sec:
        now = time.ticks_ms()
        dt = time.ticks_diff(now, last_tick) / 1000.0
        last_tick = now

        process_web_requests(s_sock, mission_state)
        max_t = thermal.max_temp
        curr_h = compass.heading

        # Heat Intrusion Alarm (> 27.0°C)
        if max_t > ALARM_TEMP_THRESHOLD:
            mission_state["alarm"] = True
            stop_smooth()
            set_buzzer(True)
            print(f"🚨 [HEAT ALARM] {max_t:.1f}°C detected (>{ALARM_TEMP_THRESHOLD:.0f}°C)! Patrol PAUSED at {duration_sec - elapsed_active_time:.1f}s")
            
            led_state = True
            set_m3_led(True, speed=20)
            last_blink = time.ticks_ms()

            while True:
                process_web_requests(s_sock, mission_state, refresh_sensors=True)

                # Blink M3 LED every 0.2s (200ms) with forward speed 20
                now_blink = time.ticks_ms()
                if time.ticks_diff(now_blink, last_blink) >= 200:
                    led_state = not led_state
                    set_m3_led(led_state, speed=20)
                    last_blink = now_blink

                if thermal.max_temp <= ALARM_TEMP_THRESHOLD:
                    break
                time.sleep_ms(20)

            set_m3_led(False)
            set_buzzer(False)
            mission_state["alarm"] = False
            print(f"✅ [HEAT CLEARED] Temp: {thermal.max_temp:.1f}°C. Re-aligning & Resuming...")
            intelligent_align_to_heading(target_heading, tolerance=2.5, server_socket=s_sock, mission_state=mission_state)
            cruise_pid.reset()
            set_motor_freq(1000)
            last_tick = time.ticks_ms()
            continue

        # Active driving timer accumulation
        elapsed_active_time += dt
        mission_state["time_left"] = max(0.0, duration_sec - elapsed_active_time)

        # Telemetry to Serial Monitor
        if int(elapsed_active_time * 4) % 4 == 0:
            print(f"[PATROL LOCK] {target_name} ({target_heading}°) | Current: {curr_h:.1f}° ({compass.direction}) | Heat: {max_t:.1f}°C | Left: {mission_state['time_left']:.1f}s")

        # CONTINUOUS PID ALIGNMENT THROUGHOUT THE 20 SECONDS:
        error, corr = cruise_pid.compute(target_heading, curr_h)

        if abs(error) <= 2.5:
            # Perfectly aligned within +/-2.5° limit: cruise smoothly straight
            smooth_motors(target_m1=base_forward_speed, target_m2=base_forward_speed, max_step=2.0)
        elif abs(error) <= 12.0:
            # Small drift (> 2.5°): continuous differential steering correction within 0-40%
            corr_clamped = max(-8.0, min(8.0, corr))
            m1_cmd = max(0.0, min(MAX_SPEED_PCT, base_forward_speed - corr_clamped))
            m2_cmd = max(0.0, min(MAX_SPEED_PCT, base_forward_speed + corr_clamped))
            smooth_motors(target_m1=m1_cmd, target_m2=m2_cmd, max_step=2.0)
        else:
            # Significant drift (> 12°): actively steer in place to bring back to target angle
            turn_speed = 28.0
            if error > 0:
                smooth_motors(target_m1=-turn_speed, target_m2=turn_speed, max_step=2.5)
            else:
                smooth_motors(target_m1=turn_speed, target_m2=-turn_speed, max_step=2.5)

        time.sleep_ms(20)

    stop_smooth()
    print(f"[PATROL LEG COMPLETE] Finished {duration_sec:.1f} seconds advancing {target_name}!")


# ================= 7. MAIN MISSION ENTRY =================
def main():
    print("==================================================")
    print("🚀 LOF TITAN Continuous-PID Security Rover Ready")
    print(f"⚡ Speed Range: 0% to {MAX_SPEED_PCT:.0f}% | Heading Lock: +/-2.5°")
    print(f"🚨 Heat Intrusion Alarm: >{ALARM_TEMP_THRESHOLD:.0f}°C (AMG8833 Thermal)")
    print(f"⏱️ Patrol Leg Time: {PATROL_DURATION_SEC:.1f}s per direction")
    print("🧭 Adaptive Pivot: Compass Feedback Stall & Freq Tuning")
    print("==================================================")

    start_wifi_ap()
    s_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s_sock.bind(('0.0.0.0', 80))
    s_sock.listen(5)
    s_sock.setblocking(False)

    mission_state = {
        "target_angle": 0.0,
        "target_dir": "NORTH",
        "time_left": PATROL_DURATION_SEC,
        "alarm": False
    }

    set_buzzer(True); time.sleep_ms(80); set_buzzer(False)
    set_m3_led(False)

    try:
        while True:
            # 1. Patrol NORTH (0°) for configured active seconds with continuous alignment
            run_patrol_leg(target_heading=0.0, target_name="NORTH", duration_sec=PATROL_DURATION_SEC, s_sock=s_sock, mission_state=mission_state)
            
            # 2. Pivot 180° to SOUTH (180°) with adaptive PWM & frequency
            intelligent_align_to_heading(target_heading=180.0, tolerance=2.5, server_socket=s_sock, mission_state=mission_state)

            # 3. Patrol SOUTH (180°) for configured active seconds with continuous alignment
            run_patrol_leg(target_heading=180.0, target_name="SOUTH", duration_sec=PATROL_DURATION_SEC, s_sock=s_sock, mission_state=mission_state)

            # 4. Pivot 180° back to NORTH (0°) with adaptive PWM & frequency
            intelligent_align_to_heading(target_heading=0.0, tolerance=2.5, server_socket=s_sock, mission_state=mission_state)

            time.sleep_ms(5)
    except KeyboardInterrupt:
        stop_smooth()
        set_buzzer(False)
        set_m3_led(False)
        print("[ROVER STOPPED BY OPERATOR]")

if __name__ == '__main__':
    main()
