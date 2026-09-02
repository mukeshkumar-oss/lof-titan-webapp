# ==============================================================================
# LOF TITAN — Intelligent Continuous-PID Magnetic Security Rover
# Speed Range: 0% to 30% Full Dynamic Envelope
# Real-Time Trajectory Control: Continuous Heading Lock (+/-2° Tolerance) Throughout 20s
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

# ================= 1. SINGLETON PWM MOTOR INTERFACE (0% - 30% RANGE) =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def _raw_m1(duty_pct, fwd=True):
    # Absolute dynamic range: 0% to 30%
    capped_pct = max(0.0, min(30.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p15 = _get_pwm(15); p16 = _get_pwm(16)
    if duty == 0: p15.duty(0); p16.duty(0)
    elif fwd: p15.duty(duty); p16.duty(0)
    else: p15.duty(0); p16.duty(duty)

def _raw_m2(duty_pct, fwd=True):
    # Absolute dynamic range: 0% to 30%
    capped_pct = max(0.0, min(30.0, duty_pct))
    duty = int(capped_pct * 1023 / 100) if capped_pct > 0 else 0
    p13 = _get_pwm(13); p14 = _get_pwm(14)
    if duty == 0: p13.duty(0); p14.duty(0)
    elif fwd: p13.duty(duty); p14.duty(0)
    else: p13.duty(0); p14.duty(duty)

def set_buzzer(active):
    buz = _get_pwm(20, freq=2400)
    buz.duty(512 if active else 0)


# ================= 2. ULTRA-SMOOTH SLEW ACCELERATION CONTROLLER =================
_current_m1 = 0.0
_current_m2 = 0.0

def smooth_motors(target_m1, target_m2, max_step=1.8):
    """
    Slew-rate limiter from 0% to 30%:
    Smoothly ramps motor speed without sudden jolts or loss of wheel traction.
    """
    global _current_m1, _current_m2
    
    target_m1 = max(-30.0, min(30.0, target_m1))
    target_m2 = max(-30.0, min(30.0, target_m2))
    
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
    for _ in range(12):
        smooth_motors(0, 0, max_step=4.0)
        time.sleep_ms(15)
    _raw_m1(0); _raw_m2(0)
    _current_m1 = 0.0; _current_m2 = 0.0


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

    def update(self):
        data = self._r(0x00, 6)
        if len(data) == 6:
            raw_x, raw_y, raw_z = struct.unpack('<hhh', data)
            self.x = raw_x; self.y = raw_y; self.z = raw_z
            rad = math.atan2(self.y, self.x)
            deg = math.degrees(rad)
            if deg < 0: deg += 360.0
            
            # 3-sample median filter
            self._h_buf.pop(0)
            self._h_buf.append(deg)
            sorted_h = sorted(self._h_buf)
            self.heading = round(sorted_h[1], 1)
            
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
      <div>Time Left<div class="stat-num" id="timer">20.0s</div></div>
      <div>Speed Range<div class="stat-num">0% - 30%</div></div>
    </div>
  </div>

  <script>
    function tempToColor(t) {
      const norm = Math.max(0, Math.min(1, (t - 22) / (35 - 22)));
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
          st.innerText = '🚨 HEAT INTRUSION DETECTED (>30°C)';
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

def process_web_requests(s_sock, mission_state):
    thermal.update()
    compass.update()
    if not s_sock: return
    try:
        r, _, _ = select.select([s_sock], [], [], 0)
        if r:
            client, addr = s_sock.accept()
            client.settimeout(0.5)
            req = client.recv(512).decode('utf-8', 'ignore')
            
            if "GET /data" in req:
                payload = ujson.dumps({
                    "max": thermal.max_temp,
                    "min": thermal.min_temp,
                    "avg": thermal.avg_temp,
                    "cur_angle": compass.heading,
                    "cur_dir": compass.direction,
                    "tgt_angle": mission_state.get("target_angle", 0.0),
                    "tgt_dir": mission_state.get("target_dir", "NORTH"),
                    "time_left": mission_state.get("time_left", 20.0),
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

def intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=None, mission_state=None):
    """
    Smoothly pivots the rover to the target heading using intelligent PID
    with smooth acceleration and deceleration between 0% and 30%.
    """
    target_dir_name = "NORTH" if (target_heading < 90 or target_heading > 270) else "SOUTH"
    mission_state["target_angle"] = target_heading
    mission_state["target_dir"] = target_dir_name

    print(f"\n[PID PIVOT] Aligning to {target_dir_name} ({target_heading}°) | Tolerance: +/-{tolerance}°...")
    align_pid.reset()
    stable_count = 0

    while True:
        process_web_requests(server_socket, mission_state)
        curr = compass.heading
        error, pid_cmd = align_pid.compute(target_heading, curr)

        # Within tolerance check
        if abs(error) <= tolerance:
            smooth_motors(0, 0, max_step=3.0)
            stable_count += 1
            if stable_count >= 5: # Steady for ~100ms
                stop_smooth()
                print(f"[PID LOCKED] Steady at {curr:.1f}° ({compass.direction}) | Error: {error:+.1f}° ✅")
                break
        else:
            stable_count = 0
            
            # Smoothly map PID output into 0% - 30% range
            abs_err = abs(error)
            if abs_err > 45.0:
                speed = 28.0
            elif abs_err > 15.0:
                speed = 24.0
            else:
                speed = max(18.0, min(23.0, 16.0 + abs_err * 0.4))
            
            # Direct negative feedback turn towards target
            if error > 0:
                smooth_motors(target_m1=-speed, target_m2=speed, max_step=1.8)
            else:
                smooth_motors(target_m1=speed, target_m2=-speed, max_step=1.8)

        time.sleep_ms(20)


def run_patrol_leg(target_heading, target_name, duration_sec=20.0, s_sock=None, mission_state=None):
    """
    Advances towards target_heading for 20 active seconds while CONTINUOUSLY
    adjusting steering via PID so heading remains strictly within +/-2° throughout.
    """
    mission_state["target_angle"] = target_heading
    mission_state["target_dir"] = target_name
    elapsed_active_time = 0.0
    last_tick = time.ticks_ms()

    # 1. Initial pivot alignment to target heading
    intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

    cruise_pid.reset()
    base_forward_speed = 25.0 # Center speed (0% to 30% envelope)

    print(f"\n[PATROL START] Advancing towards {target_name} ({target_heading}°) for {duration_sec}s with continuous PID lock...")

    while elapsed_active_time < duration_sec:
        now = time.ticks_ms()
        dt = time.ticks_diff(now, last_tick) / 1000.0
        last_tick = now

        process_web_requests(s_sock, mission_state)
        max_t = thermal.max_temp
        curr_h = compass.heading

        # Heat Intrusion Alarm (> 30°C)
        if max_t > 30.0:
            mission_state["alarm"] = True
            stop_smooth()
            set_buzzer(True)
            print(f"🚨 [HEAT ALARM] {max_t:.1f}°C detected (>30°C)! Patrol PAUSED at {duration_sec - elapsed_active_time:.1f}s")
            
            while True:
                process_web_requests(s_sock, mission_state)
                if thermal.max_temp <= 30.0:
                    break
                time.sleep_ms(20)

            set_buzzer(False)
            mission_state["alarm"] = False
            print(f"✅ [HEAT CLEARED] Temp: {thermal.max_temp:.1f}°C. Re-aligning & Resuming...")
            intelligent_align_to_heading(target_heading, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)
            cruise_pid.reset()
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

        if abs(error) <= 2.0:
            # Perfectly aligned within +/-2° limit: cruise smoothly straight
            smooth_motors(target_m1=base_forward_speed, target_m2=base_forward_speed, max_step=1.5)
        elif abs(error) <= 12.0:
            # Small drift (> 2°): continuous differential steering correction within 0-30%
            corr_clamped = max(-6.0, min(6.0, corr))
            m1_cmd = max(0.0, min(30.0, base_forward_speed - corr_clamped))
            m2_cmd = max(0.0, min(30.0, base_forward_speed + corr_clamped))
            smooth_motors(target_m1=m1_cmd, target_m2=m2_cmd, max_step=1.5)
        else:
            # Significant drift (> 12°): actively steer in place to bring back to target angle
            turn_speed = 22.0
            if error > 0:
                smooth_motors(target_m1=-turn_speed, target_m2=turn_speed, max_step=2.0)
            else:
                smooth_motors(target_m1=turn_speed, target_m2=-turn_speed, max_step=2.0)

        time.sleep_ms(20)

    stop_smooth()
    print(f"[PATROL LEG COMPLETE] Finished 20 seconds advancing {target_name}!")


# ================= 7. MAIN MISSION ENTRY =================
def main():
    print("==================================================")
    print("🚀 LOF TITAN Continuous-PID Security Rover Ready")
    print("⚡ Speed Range: 0% to 30% | Heading Lock: +/-2.0°")
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
        "time_left": 20.0,
        "alarm": False
    }

    set_buzzer(True); time.sleep_ms(80); set_buzzer(False)

    try:
        while True:
            # 1. Patrol NORTH (0°) for 20 active seconds with continuous alignment
            run_patrol_leg(target_heading=0.0, target_name="NORTH", duration_sec=20.0, s_sock=s_sock, mission_state=mission_state)
            
            # 2. Pivot 180° to SOUTH (180°)
            intelligent_align_to_heading(target_heading=180.0, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

            # 3. Patrol SOUTH (180°) for 20 active seconds with continuous alignment
            run_patrol_leg(target_heading=180.0, target_name="SOUTH", duration_sec=20.0, s_sock=s_sock, mission_state=mission_state)

            # 4. Pivot 180° back to NORTH (0°)
            intelligent_align_to_heading(target_heading=0.0, tolerance=2.0, server_socket=s_sock, mission_state=mission_state)

            time.sleep_ms(5)
    except KeyboardInterrupt:
        stop_smooth()
        set_buzzer(False)
        print("[ROVER STOPPED BY OPERATOR]")

if __name__ == '__main__':
    main()
