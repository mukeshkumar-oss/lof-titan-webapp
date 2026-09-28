# ==============================================================================
# LOF TITAN — TERRAIN TREK: Light-Activated 4WD Incline-Crawling Rover
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - 4WD Motors (Independently Controlled):
#       * M1: GPIO 15, 16 (Front-Left Motor)
#       * M2: GPIO 13, 14 (Front-Right Motor)
#       * M3: GPIO 11, 12 (Rear-Left Motor)
#       * M4: GPIO 9, 10  (Rear-Right Motor)
#   - IMU Sensor: MPU6050 6-Axis Gyroscope & Accelerometer (I2C: SDA 7, SCL 8, Addr 0x68)
#   - Distance Sensor: Ultrasonic Sensor (Trig: GPIO 6, Echo: GPIO 19)
#   - Light Sensor: LDR Analog Sensor (Port S1 / GPIO 2 ADC)
#   - Push Buttons: BTN 1-4 (GPIO 39, 40, 41, 42)
#   - Indicators: Red LED (GPIO 47), Green LED (GPIO 48)
#
# Core Operation:
#   1. Light-Activated Lifecycle:
#      - LIGHT DETECTED (> Threshold): Rover wakes up, activates 4WD, and navigates.
#      - DARK DETECTED (<= Threshold): Rover enters STANDBY MODE (all motors STOP,
#        system sleeps, awaiting light).
#   2. MPU6050 Adaptive Slope Crawling:
#      - Uphill Slope (> 11.5° Pitch): Shifts to high-torque slow CRAWL MODE (prevents slip).
#      - Downhill Decline (< -11.5° Pitch): Controlled low-speed descent engine braking.
#      - Critical Rollover Protection (> 38° Pitch/Roll): Emergency safety brake.
#   3. Ultrasonic Intelligent Obstacle Avoidance:
#      - Multi-stage collision avoidance (Safe, Decelerate Arc-Steer, Reverse-Pivot Escape).
#   4. Comprehensive Live Serial Telemetry:
#      - Continuous formatted debug printing of Light %, Mode, Pitch, Distance, and 4WD status.
# ==============================================================================

import time
import math
import struct
from machine import Pin, PWM, ADC, SoftI2C

# ================= 1. HARDWARE PINOUT & ACTIVE-PIN PWM MANAGER =================
_pwm_pool = {}

def _set_pin_pwm(pin, duty, freq=1000):
    """
    Assigns hardware PWM only when duty > 0.
    When duty == 0, deinitializes PWM immediately and drives as digital LOW (0)
    to guarantee at most 4 hardware PWM channels are ever used across the entire 4WD rover.
    """
    if duty > 0:
        if pin not in _pwm_pool:
            try:
                _pwm_pool[pin] = PWM(Pin(pin, Pin.OUT), freq=freq)
            except Exception:
                # If pool was full, clear idle pins and retry
                _clean_idle_pwms()
                _pwm_pool[pin] = PWM(Pin(pin, Pin.OUT), freq=freq)
        else:
            try:
                _pwm_pool[pin].freq(freq)
            except Exception:
                pass
        _pwm_pool[pin].duty(duty)
    else:
        if pin in _pwm_pool:
            try:
                _pwm_pool[pin].duty(0)
                _pwm_pool[pin].deinit()
            except Exception:
                pass
            del _pwm_pool[pin]
        try:
            Pin(pin, Pin.OUT).value(0)
        except Exception:
            pass

def _clean_idle_pwms():
    """Emergency helper to free all allocated PWM channels."""
    for p, obj in list(_pwm_pool.items()):
        try:
            obj.duty(0)
            obj.deinit()
        except Exception:
            pass
    _pwm_pool.clear()

# Status Indicators
led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)
led_red.value(0)
led_grn.value(0)

# Push Buttons (Active LOW)
btn1 = Pin(39, Pin.IN, Pin.PULL_UP)  # Manual Override / Force Wake Toggle
btn2 = Pin(40, Pin.IN, Pin.PULL_UP)  # Calibrate IMU Zero Horizon
btn3 = Pin(41, Pin.IN, Pin.PULL_UP)  # Toggle High / Low LDR Sensitivity
btn4 = Pin(42, Pin.IN, Pin.PULL_UP)  # Diagnostic Test Button

# Ultrasonic Sensor Pins
trig_pin = Pin(6, Pin.OUT)
echo_pin = Pin(19, Pin.IN)
trig_pin.value(0)

# LDR Light Sensor (Analog Port S1 = GPIO 2)
try:
    ldr_adc = ADC(Pin(2))
    ldr_adc.atten(ADC.ATTN_11DB)  # Full 0 - 3.3V range
except Exception:
    ldr_adc = None


# ================= 2. 4-WHEEL DRIVE (4WD) MOTOR ENGINE =================
def _drive_motor(pin_a, pin_b, duty_pct, fwd=True):
    """
    H-Bridge motor control using at most 1 PWM channel per motor.
    PWM Duty Cycle Percentage: 0 - 100% (Flat: 80%, Slight tilt: 70%, Strong tilt: 50%).
    Maps 0-100% duty to 0-1023 (10-bit ESP32 PWM duty).
    Forward: pin_a is PWM, pin_b is digital LOW (0).
    Reverse: pin_b is PWM, pin_a is digital LOW (0).
    Stop:    both pins are digital LOW (0, PWM released).
    """
    pct = max(0.0, min(100.0, float(duty_pct)))
    duty = int(pct * 1023 / 100) if pct > 0 else 0
    if duty == 0:
        _set_pin_pwm(pin_a, 0)
        _set_pin_pwm(pin_b, 0)
    elif fwd:
        _set_pin_pwm(pin_b, 0)      # Release PWM on reverse pin first
        _set_pin_pwm(pin_a, duty)   # Drive forward pin with PWM
    else:
        _set_pin_pwm(pin_a, 0)      # Release PWM on forward pin first
        _set_pin_pwm(pin_b, duty)   # Drive reverse pin with PWM

def _raw_m1(duty_pct, fwd=True):
    """M1 Front-Left: GPIO 15, 16"""
    _drive_motor(15, 16, duty_pct, fwd)

def _raw_m2(duty_pct, fwd=True):
    """M2 Front-Right: GPIO 13, 14"""
    _drive_motor(13, 14, duty_pct, fwd)

def _raw_m3(duty_pct, fwd=True):
    """M3 Rear-Left: GPIO 11, 12"""
    _drive_motor(11, 12, duty_pct, fwd)

def _raw_m4(duty_pct, fwd=True):
    """M4 Rear-Right: GPIO 9, 10"""
    _drive_motor(9, 10, duty_pct, fwd)

class Titan4WDEngine:
    """
    Independent 4WD Controller with smooth slew rate acceleration
    for maximum traction on rocky, steep, and uneven terrain.
    """
    def __init__(self):
        self.m1 = 0.0  # Front-Left (%)
        self.m2 = 0.0  # Front-Right (%)
        self.m3 = 0.0  # Rear-Left (%)
        self.m4 = 0.0  # Rear-Right (%)
        self.slew_step = 6.0

    def set_targets(self, m1_t, m2_t, m3_t, m4_t, max_step=None):
        step = max_step if max_step is not None else self.slew_step

        # Slew M1
        if self.m1 < m1_t: self.m1 = min(m1_t, self.m1 + step)
        elif self.m1 > m1_t: self.m1 = max(m1_t, self.m1 - step)

        # Slew M2
        if self.m2 < m2_t: self.m2 = min(m2_t, self.m2 + step)
        elif self.m2 > m2_t: self.m2 = max(m2_t, self.m2 - step)

        # Slew M3
        if self.m3 < m3_t: self.m3 = min(m3_t, self.m3 + step)
        elif self.m3 > m3_t: self.m3 = max(m3_t, self.m3 - step)

        # Slew M4
        if self.m4 < m4_t: self.m4 = min(m4_t, self.m4 + step)
        elif self.m4 > m4_t: self.m4 = max(m4_t, self.m4 - step)

        # Output to PWM
        _raw_m1(abs(self.m1), fwd=(self.m1 >= 0))
        _raw_m2(abs(self.m2), fwd=(self.m2 >= 0))
        _raw_m3(abs(self.m3), fwd=(self.m3 >= 0))
        _raw_m4(abs(self.m4), fwd=(self.m4 >= 0))

    def drive_skid(self, left_pct, right_pct, max_step=None):
        """Differential Skid Steering across all 4 wheels."""
        self.set_targets(left_pct, right_pct, left_pct, right_pct, max_step)

    def emergency_brake(self):
        """Instant active brake for all wheels."""
        self.m1 = 0.0
        self.m2 = 0.0
        self.m3 = 0.0
        self.m4 = 0.0
        _raw_m1(0); _raw_m2(0); _raw_m3(0); _raw_m4(0)

motors = Titan4WDEngine()


# ================= 3. MPU6050 6-AXIS IMU (SLOPE & CRAWL DETECTOR) =================
class MPU6050:
    """
    MPU6050 IMU Driver (I2C Addr: 0x68) on SDA: GPIO 7, SCL: GPIO 8.
    Calculates stable pitch (slope climb/descent) and roll angles using
    vibration-filtered gravity vectors without gyro integration runaway.
    """
    ADDR = 0x68
    def __init__(self, i2c):
        self.i2c = i2c
        self.connected = False
        self.pitch_raw = 0.0
        self.roll_raw = 0.0
        self.pitch = 0.0      # + Climbing uphill, - Downhill
        self.roll = 0.0       # + Right tilt, - Left tilt
        self.accel_z = 1.0
        self.pitch_offset = 0.0
        self.roll_offset = 0.0
        self.alpha = 0.15     # Low-pass filter smoothing coefficient
        self.init_sensor()

    def _w(self, reg, val):
        try: self.i2c.writeto_mem(self.ADDR, reg, bytearray([val]))
        except Exception: pass

    def _r(self, reg, n=1):
        try: return self.i2c.readfrom_mem(self.ADDR, reg, n)
        except Exception: return bytearray(n)

    def init_sensor(self):
        try:
            self._w(0x6B, 0x00)  # Wake up (PWR_MGMT_1)
            time.sleep_ms(25)
            self._w(0x1C, 0x08)  # Accel ±4g (8192 LSB/g)
            self._w(0x1B, 0x08)  # Gyro ±500°/s (65.5 LSB/deg/s)
            time.sleep_ms(20)
            who = self._r(0x75, 1)
            self.connected = len(who) > 0
        except Exception:
            self.connected = False

    def calibrate_zero(self):
        """Zero the horizon on flat ground by averaging 25 accelerometer samples."""
        p_acc, r_acc = 0.0, 0.0
        samples = 25
        valid_cnt = 0
        for _ in range(samples):
            try:
                data = self._r(0x3B, 6)
                if len(data) == 6:
                    ax, ay, az = struct.unpack('>hhh', data)
                    acc_x = ax / 8192.0
                    acc_y = ay / 8192.0
                    acc_z = az / 8192.0
                    p = math.atan2(acc_x, math.sqrt(acc_y**2 + acc_z**2)) * 57.2958
                    r = math.atan2(acc_y, math.sqrt(acc_x**2 + acc_z**2)) * 57.2958
                    p_acc += p
                    r_acc += r
                    valid_cnt += 1
            except Exception:
                pass
            time.sleep_ms(15)

        if valid_cnt > 0:
            self.pitch_offset = p_acc / valid_cnt
            self.roll_offset = r_acc / valid_cnt
            self.pitch_raw = self.pitch_offset
            self.roll_raw = self.roll_offset
            self.pitch = 0.0
            self.roll = 0.0
        print(">>> [IMU] Zero Horizon Calibrated. Pitch Offset: {:.1f}°, Roll Offset: {:.1f}°".format(
            self.pitch_offset, self.roll_offset))

    def update(self):
        """Read 6-axis accelerometer & gyroscope and compute smooth tilt angles."""
        try:
            data = self._r(0x3B, 14)
            if len(data) == 14:
                ax, ay, az, _, gx, gy, gz = struct.unpack('>hhhhhhh', data)
                accel_x = ax / 8192.0
                accel_y = ay / 8192.0
                self.accel_z = az / 8192.0

                # Compute instantaneous geometric tilt angles from gravity vector (symmetrical 3D)
                acc_p = math.atan2(accel_x, math.sqrt(accel_y**2 + self.accel_z**2)) * 57.2958
                acc_r = math.atan2(accel_y, math.sqrt(accel_x**2 + self.accel_z**2)) * 57.2958

                # Low-pass filter to reject motor chassis vibration & rough terrain noise
                self.pitch_raw = self.pitch_raw * (1.0 - self.alpha) + acc_p * self.alpha
                self.roll_raw = self.roll_raw * (1.0 - self.alpha) + acc_r * self.alpha

                # Output zero-calibrated slope and tilt angles
                self.pitch = round(self.pitch_raw - self.pitch_offset, 1)
                self.roll = round(self.roll_raw - self.roll_offset, 1)
                return True
        except Exception:
            pass
        return False


# ================= 4. ULTRASONIC SENSOR DRIVER =================
def read_ultrasonic_cm():
    """Measure obstacle distance in cm with median filtering."""
    readings = []
    for _ in range(3):
        try:
            trig_pin.value(0)
            time.sleep_us(2)
            trig_pin.value(1)
            time.sleep_us(10)
            trig_pin.value(0)

            t_start = time.ticks_us()
            while echo_pin.value() == 0:
                if time.ticks_diff(time.ticks_us(), t_start) > 20000:
                    break

            pulse_start = time.ticks_us()
            while echo_pin.value() == 1:
                if time.ticks_diff(time.ticks_us(), pulse_start) > 25000:
                    break
            pulse_end = time.ticks_us()

            dist = time.ticks_diff(pulse_end, pulse_start) / 58.0
            if 2.0 <= dist <= 400.0:
                readings.append(dist)
        except Exception:
            pass
        time.sleep_ms(3)

    if readings:
        readings.sort()
        return round(readings[len(readings) // 2], 1)
    return 250.0  # Clear path


# ================= 5. LDR LIGHT SENSOR DRIVER (INVERTED POLARITY) =================
def read_ldr_percentage():
    """
    Read ambient light intensity from LDR (Port S1 / GPIO 2).
    Standard LDR voltage drops in bright light (raw -> 0) and rises in dark (raw -> 4095).
    Inverted formula: ((4095 - raw) / 4095) * 100% -> High % = Bright Daylight, Low % = Darkness.
    """
    if ldr_adc is None:
        return 75.0
    try:
        raw = ldr_adc.read()  # 0 to 4095
        # Inverted ADC scaling: Low raw voltage in light -> High light percentage
        pct = ((4095.0 - raw) / 4095.0) * 100.0
        return round(max(0.0, min(100.0, pct)), 1)
    except Exception:
        return 50.0


# ================= 6. TERRAIN TREK AUTONOMOUS CONTROLLER =================
class TerrainTrekEngine:
    def __init__(self, imu):
        self.imu = imu
        
        # Rover Operational States:
        # "STANDBY" (Dark detected, sleeping)
        # "ACTIVE_TREK" (Light detected, navigating)
        # "AVOID_REVERSE", "AVOID_TURN"
        self.state = "STANDBY"
        
        # LDR Light Activation Thresholds (with Hysteresis to prevent flickering)
        self.LDR_WAKE_THRESHOLD = 30.0   # Light level to Wake Up and Move (%)
        self.LDR_SLEEP_THRESHOLD = 20.0  # Dark level to enter Standby Mode (%)

        # Exact Motor PWM Cycle Percentages (0 - 100%)
        self.SPEED_FLAT = 80.0           # Flat MPU (Tilt < 8°) -> 70% PWM Duty
        self.SPEED_SLIGHT_TILT = 55.0    # Slight tilt (8° <= Tilt < 20°) -> 55% PWM Duty
        self.SPEED_STRONG_TILT = 30.0    # Strong tilt (20° <= Tilt < 60°) -> 30% PWM Duty
        self.SPEED_TURN = 65.0           # Pivot turn obstacle escape speed
        self.SPEED_REVERSE = 60.0        # Reverse avoidance speed

        # Tilt Angle Boundaries (Degrees)
        self.TILT_SLIGHT_THRESHOLD = 5.0   # Boundary for Slight Tilt
        self.TILT_STRONG_THRESHOLD = 15.0  # Boundary for Strong Tilt / High-Torque Crawl
        self.ROLLOVER_LIMIT = 45.0         # Critical rollover threshold (60°)

        # Avoidance State Machine
        self.avoid_start_ms = 0
        self.avoid_duration_ms = 0
        self.avoid_dir = 1

    def update_lifecycle(self, ldr_pct):
        """Manage Wake / Standby transitions based on LDR light."""
        if self.state == "STANDBY":
            if ldr_pct >= self.LDR_WAKE_THRESHOLD:
                # LIGHT DETECTED -> WAKE UP & ACTIVATE 4WD
                self.state = "ACTIVE_TREK"
                led_grn.value(1)
                led_red.value(0)
                print("\n=======================================================")
                print(">>> [LDR TRIGGER] LIGHT DETECTED ({:.1f}%) -> WAKING UP!".format(ldr_pct))
                print(">>> 4WD PROPULSION SYSTEM ENGAGED.")
                print("=======================================================")
                return "WAKE"

        elif self.state in ["ACTIVE_TREK", "AVOID_REVERSE", "AVOID_TURN"]:
            if ldr_pct < self.LDR_SLEEP_THRESHOLD:
                # DARK DETECTED -> ENTER STANDBY MODE
                self.state = "STANDBY"
                motors.emergency_brake()
                led_grn.value(0)
                led_red.value(0)
                print("\n=======================================================")
                print(">>> [LDR TRIGGER] DARK DETECTED ({:.1f}%) -> ENTERING STANDBY".format(ldr_pct))
                print(">>> MOTORS SHUT DOWN. WAITING FOR LIGHT...")
                print("=======================================================")
                return "SLEEP"

        return "NO_CHANGE"

    def evaluate_slope(self):
        """
        Analyze MPU6050 3D tilt angle and determine adaptive motor PWM cycle:
          * Flat ground (Tilt < 8°): 70% PWM Cycle
          * Slight tilt (8° <= Tilt < 20°): 55% PWM Cycle
          * Strong tilt (Tilt >= 20°): 30% PWM Cycle
          * Rollover (Tilt >= 60°): Emergency Brake (0% Duty)
        """
        pitch = self.imu.pitch
        roll = self.imu.roll
        tilt = math.sqrt(pitch * pitch + roll * roll)

        # 1. Rollover Safety Check (> 60°)
        if abs(pitch) > self.ROLLOVER_LIMIT or abs(roll) > self.ROLLOVER_LIMIT or tilt > self.ROLLOVER_LIMIT:
            motors.emergency_brake()
            led_red.value(1)
            led_grn.value(0)
            return "ROLLOVER_LOCK", 0.0, tilt

        # 2. Strong Tilt (Incline/Decline/Rock Crawl >= 20°) -> 30% PWM Duty
        if tilt >= self.TILT_STRONG_THRESHOLD:
            return "STRONG_TILT", self.SPEED_STRONG_TILT, tilt

        # 3. Slight Tilt (8° to 20°) -> 55% PWM Duty
        elif tilt >= self.TILT_SLIGHT_THRESHOLD:
            return "SLIGHT_TILT", self.SPEED_SLIGHT_TILT, tilt

        # 4. Flat / Level Ground (< 8°) -> 70% PWM Duty
        else:
            return "FLAT_CRUISE", self.SPEED_FLAT, tilt

    def execute_navigation(self, dist_cm, slope_mode, target_spd):
        """Execute 4WD obstacle avoidance and tilt-adaptive motor drive."""
        now = time.ticks_ms()

        # If in Standby Mode or Rollover Lock, stop all 4 motors
        if self.state == "STANDBY" or slope_mode == "ROLLOVER_LOCK":
            motors.emergency_brake()
            return

        # Avoidance State 1: Reverse Backwards away from Obstacle
        if self.state == "AVOID_REVERSE":
            if time.ticks_diff(now, self.avoid_start_ms) < self.avoid_duration_ms:
                motors.drive_skid(-self.SPEED_REVERSE, -self.SPEED_REVERSE * 0.85, max_step=12.0)
                led_red.value(1)
                return
            else:
                self.state = "AVOID_TURN"
                self.avoid_start_ms = now
                self.avoid_duration_ms = 500  # 500ms escape turn
                return

        # Avoidance State 2: Pivot Turn to Open Vector
        elif self.state == "AVOID_TURN":
            if time.ticks_diff(now, self.avoid_start_ms) < self.avoid_duration_ms:
                if self.avoid_dir > 0:
                    motors.drive_skid(self.SPEED_TURN, -self.SPEED_TURN, max_step=12.0)
                else:
                    motors.drive_skid(-self.SPEED_TURN, self.SPEED_TURN, max_step=12.0)
                led_red.value(1)
                return
            else:
                self.state = "ACTIVE_TREK"
                led_red.value(0)
                print(">>> [OBSTACLE] Avoidance Complete. Resuming Forward Trek.")

        # Active Trekking
        if self.state == "ACTIVE_TREK":
            # --- Ultrasonic Obstacle Reaction ---
            if dist_cm < 18.0:
                # DANGER ZONE (<18cm): Emergency stop, start avoidance
                motors.emergency_brake()
                print(">>> [OBSTACLE] Critical Danger! Distance: {:.1f}cm -> REVERSING".format(dist_cm))
                self.state = "AVOID_REVERSE"
                self.avoid_start_ms = now
                self.avoid_duration_ms = 550
                self.avoid_dir = 1 if (now % 2 == 0) else -1
                return

            elif dist_cm < 35.0:
                # CAUTION ZONE (18-35cm): Decelerate and curved arc steer
                caution_spd = max(25.0, target_spd * 0.6)
                motors.drive_skid(caution_spd * 0.4, caution_spd, max_step=6.0)
                led_red.value(1)
                return

            # --- Clear Path: Speed Regulated by MPU6050 Slope ---
            led_red.value(0)
            if slope_mode == "STRONG_TILT":
                # Strong Tilt: 30% PWM crawler duty
                motors.drive_skid(target_spd, target_spd, max_step=6.0)
                led_grn.value((now // 250) % 2)  # Blink green on steep climb

            elif slope_mode == "SLIGHT_TILT":
                # Slight Tilt: 55% PWM duty
                motors.drive_skid(target_spd, target_spd, max_step=8.0)
                led_grn.value(1)

            else:
                # Flat Terrain: 70% PWM cruise duty
                motors.drive_skid(target_spd, target_spd, max_step=10.0)
                led_grn.value(1)


# ================= 7. MAIN PROGRAM ENTRY & SERIAL DEBUG LOOP =================
def main():
    print("\n=======================================================")
    print("LOF TITAN — TERRAIN TREK: LIGHT-ACTIVATED 4WD ROVER")
    print("-------------------------------------------------------")
    print(" * MPU6050 (I2C: SDA 7, SCL 8) -> PWM: Flat 70% | Slight 55% | Strong 30%")
    print(" * Ultrasonic (Trig 6, Echo 19) -> Radar Collision Avoidance")
    print(" * LDR Sensor (Port S1 / GPIO 2) -> Light Wake / Dark Standby")
    print(" * 4WD Motors (M1:15,16 | M2:13,14 | M3:11,12 | M4:9,10)")
    print("=======================================================\n")

    # Initial Power-on Visual LED Indication
    led_grn.value(1); led_red.value(1)
    time.sleep_ms(100)
    led_grn.value(0); led_red.value(0)

    # Initialize I2C for MPU6050
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=200000, timeout=1000)
        devices = i2c.scan()
        print("[I2C] Bus Initialized. Found Devices:", [hex(d) for d in devices])
    except Exception as e:
        print("[I2C] Error initializing bus:", e)
        i2c = None

    # Initialize MPU6050
    imu = None
    if i2c:
        try:
            imu = MPU6050(i2c)
            print("[MPU6050] Connected:", imu.connected)
            for _ in range(8):
                imu.update()
                time.sleep_ms(10)
        except Exception as e:
            print("[MPU6050] Init Error:", e)

    if imu is None:
        class DummyIMU:
            pitch = 0.0
            roll = 0.0
            accel_z = 1.0
            def update(self): pass
            def calibrate_zero(self): pass
        imu = DummyIMU()

    trek = TerrainTrekEngine(imu)

    # Button tracking
    last_b1, last_b2, last_b3, last_b4 = 1, 1, 1, 1

    last_radar_ms = time.ticks_ms()
    last_debug_ms = time.ticks_ms()
    cached_dist = 250.0
    cached_ldr = 50.0

    print("[SYSTEM] Calibrating Sensors... Hold Rover Still.")
    time.sleep_ms(400)
    imu.calibrate_zero()
    print("[SYSTEM] Ready! Rover will ACTIVATE when light is detected.\n")

    # Continuous Control Loop
    while True:
        now = time.ticks_ms()

        # 1. Update MPU6050 IMU Pitch & Roll (~50Hz)
        imu.update()

        # 2. Update Sensors (~10Hz)
        if time.ticks_diff(now, last_radar_ms) > 90:
            cached_dist = read_ultrasonic_cm()
            cached_ldr = read_ldr_percentage()
            last_radar_ms = now

        # 3. LDR Light Lifecycle (Wake on Light / Standby on Dark)
        trek.update_lifecycle(cached_ldr)

        # 4. MPU6050 Slope Analysis (Flat: 70% | Slight: 55% | Strong: 30%)
        slope_mode, target_spd, tilt_deg = trek.evaluate_slope()

        # 5. 4WD Autonomous Navigation & Obstacle Avoidance
        trek.execute_navigation(cached_dist, slope_mode, target_spd)

        # 6. Push Button Controls
        # BTN 1: Force Wake / Toggle Override
        b1 = btn1.value()
        if b1 == 0 and last_b1 == 1:
            if trek.state == "STANDBY":
                trek.state = "ACTIVE_TREK"
                print(">>> [BTN1] Manual Force WAKE Triggered.")
                led_grn.value(1)
            else:
                trek.state = "STANDBY"
                motors.emergency_brake()
                print(">>> [BTN1] Manual Force STANDBY Triggered.")
                led_grn.value(0)
            time.sleep_ms(60)
        last_b1 = b1

        # BTN 2: Re-zero IMU Flat Horizon
        b2 = btn2.value()
        if b2 == 0 and last_b2 == 1:
            motors.emergency_brake()
            imu.calibrate_zero()
            time.sleep_ms(60)
        last_b2 = b2

        # BTN 3: Adjust LDR Sensitivity
        b3 = btn3.value()
        if b3 == 0 and last_b3 == 1:
            if trek.LDR_WAKE_THRESHOLD == 30.0:
                trek.LDR_WAKE_THRESHOLD = 50.0
                trek.LDR_SLEEP_THRESHOLD = 40.0
                print(">>> [BTN3] LDR Sensitivity: HIGH LIGHT REQUIRED (Wake > 50%)")
            else:
                trek.LDR_WAKE_THRESHOLD = 30.0
                trek.LDR_SLEEP_THRESHOLD = 20.0
                print(">>> [BTN3] LDR Sensitivity: NORMAL SENSITIVITY (Wake > 30%)")
            led_grn.value(1)
            time.sleep_ms(40)
            led_grn.value(0)
            time.sleep_ms(60)
        last_b3 = b3

        # BTN 4: Diagnostic LED Test
        b4 = btn4.value()
        if b4 == 0 and last_b4 == 1:
            led_red.value(1); led_grn.value(1)
            time.sleep_ms(100)
            led_red.value(0); led_grn.value(0)
            time.sleep_ms(60)
        last_b4 = b4

        # 7. Real-Time Serial Telemetry Debug Printing & JSON Stream (~5Hz)
        if time.ticks_diff(now, last_debug_ms) > 200:
            m1, m2, m3, m4 = motors.m1, motors.m2, motors.m3, motors.m4
            
            # Formatted Serial Output
            if trek.state == "STANDBY":
                print("[STANDBY] Light: {:4.1f}% (DARK < {:2.0f}%) | Tilt: {:4.1f}° | Dist: {:3.0f}cm | Motors: [OFF]".format(
                    cached_ldr, trek.LDR_SLEEP_THRESHOLD, tilt_deg, cached_dist
                ))
            else:
                gear_tag = "[ROLLOVER]" if slope_mode == "ROLLOVER_LOCK" else (
                    "[STRONG(30%)]" if slope_mode == "STRONG_TILT" else (
                        "[SLIGHT(55%)]" if slope_mode == "SLIGHT_TILT" else "[FLAT(70%)]"
                    )
                )
                print("[ACTIVE] LDR:{:4.1f}% | Tilt:{:4.1f}° (P:{:+4.1f}° R:{:+4.1f}°) {:14s} | Radar:{:3.0f}cm | 4WD:[FL:{:3.0f}% FR:{:3.0f}% RL:{:3.0f}% RR:{:3.0f}%]".format(
                    cached_ldr, tilt_deg, imu.pitch, imu.roll, gear_tag, cached_dist, m1, m2, m3, m4
                ))
            
            # Compact JSON Telemetry Stream for Web Dashboard UI
            print("TLM:{" + f'"ldr":{cached_ldr:.1f},"pitch":{imu.pitch:.1f},"roll":{imu.roll:.1f},"tilt":{tilt_deg:.1f},"dist":{cached_dist:.1f},"state":"{trek.state}","mode":"{slope_mode}","spd":{int(target_spd)},"m1":{int(m1)},"m2":{int(m2)},"m3":{int(m3)},"m4":{int(m4)}' + "}")
            last_debug_ms = now

        # CPU Safety Yield (prevents task watchdog reset)
        time.sleep_ms(5)

if __name__ == '__main__':
    main()
