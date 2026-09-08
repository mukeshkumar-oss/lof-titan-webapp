# =====================================================
# LOF TITAN — 4-MOTOR ROVER OBSTACLE NAVIGATION (VL53L0X)
# Converted from lostbot_navigation.ino
# Hardware Pinout:
# - I2C ToF Sensor: GPIO 7 (SDA), GPIO 8 (SCL)
# - Motor 1 (Left Front): GPIO 15 (PWM), GPIO 16 (PWM)
# - Motor 2 (Right Front): GPIO 13 (PWM), GPIO 14 (PWM)
# - Motor 3 (Left Back): GPIO 11 (PWM), GPIO 12 (PWM)
# - Motor 4 (Right Back): GPIO 9 (PWM), GPIO 10 (PWM)
# =====================================================

import time
from machine import Pin, PWM, SoftI2C, I2C
from supervisor.led_buzzer import hw

# ================= PWM POOL MANAGER =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

# ================= MOTOR PIN CONSTANTS =================
M1_A = 15
M1_B = 16

M2_A = 13
M2_B = 14

M3_A = 11
M3_B = 12

M4_A = 9
M4_B = 10

FORWARD_SPEED = 200     # 0-255 scale
TURN_SPEED = 150
BACKWARD_SPEED = 150
OBSTACLE_DISTANCE_MM = 300  # 30 cm

M1_INVERT = False
M2_INVERT = False
M3_INVERT = False
M4_INVERT = False

# ================= MOTOR DRIVE FUNCTIONS =================
def motor_drive(pin_a, pin_b, speed_val, forward=True, invert=False):
    speed_val = max(0, min(int(speed_val), 255))
    duty = int(speed_val * 65535 / 255)

    if invert:
        forward = not forward

    pwm_a = _get_pwm(pin_a)
    pwm_b = _get_pwm(pin_b)

    if speed_val == 0:
        pwm_a.duty_u16(0)
        pwm_b.duty_u16(0)
        return

    if forward:
        pwm_a.duty_u16(duty)
        pwm_b.duty_u16(0)
    else:
        pwm_a.duty_u16(0)
        pwm_b.duty_u16(duty)

def motor_m1(spd, forward=True):
    motor_drive(M1_A, M1_B, spd, forward, M1_INVERT)

def motor_m2(spd, forward=True):
    motor_drive(M2_A, M2_B, spd, forward, M2_INVERT)

def motor_m3(spd, forward=True):
    motor_drive(M3_A, M3_B, spd, forward, M3_INVERT)

def motor_m4(spd, forward=True):
    motor_drive(M4_A, M4_B, spd, forward, M4_INVERT)

def move_forward(spd):
    motor_m1(spd, True)
    motor_m2(spd, True)
    motor_m3(spd, True)
    motor_m4(spd, True)

def move_backward(spd):
    motor_m1(spd, False)
    motor_m2(spd, False)
    motor_m3(spd, False)
    motor_m4(spd, False)

def turn_right(spd):
    # Left side forward, right side backward
    motor_m1(spd, True)
    motor_m3(spd, True)
    motor_m2(spd, False)
    motor_m4(spd, False)

def turn_left(spd):
    # Left side backward, right side forward
    motor_m1(spd, False)
    motor_m3(spd, False)
    motor_m2(spd, True)
    motor_m4(spd, True)

def motor_off():
    for p in (M1_A, M1_B, M2_A, M2_B, M3_A, M3_B, M4_A, M4_B):
        _get_pwm(p).duty_u16(0)

# ================= SHARED I2C BUS (SDA: 7, SCL: 8) =================
_shared_i2c = None
def _get_shared_i2c():
    global _shared_i2c
    if _shared_i2c is None:
        try:
            _shared_i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=400000, timeout=50000)
        except Exception:
            try:
                _shared_i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
            except Exception: pass
    return _shared_i2c

# ================= VL53L0X LASER TOF DRIVER =================
class VL53L0X:
    """Accurate Adafruit/Pololu compatible VL53L0X Driver for MicroPython."""
    def __init__(self, i2c=None, address=0x29):
        self.i2c = i2c if i2c else _get_shared_i2c()
        self.address = address
        self.stop_variable = 0
        self.init_done = False
        self._init_sensor()

    def _write_reg(self, reg, val):
        if not self.i2c: return
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([val]))
        except Exception: pass

    def _write_reg_16(self, reg, val):
        if not self.i2c: return
        try:
            self.i2c.writeto_mem(self.address, reg, bytes([(val >> 8) & 0xFF, val & 0xFF]))
        except Exception: pass

    def _read_reg(self, reg, n=1):
        if not self.i2c: return bytearray(n)
        try:
            return self.i2c.readfrom_mem(self.address, reg, n)
        except Exception:
            return bytearray(n)

    def _init_sensor(self):
        if not self.i2c: return False
        try:
            # 2V8 I/O mode
            self._write_reg(0x89, self._read_reg(0x89)[0] | 0x01)
            self._write_reg(0x88, 0x00)
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            r91 = self._read_reg(0x91)
            self.stop_variable = r91[0] if len(r91) > 0 else 0x3C
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Signal rate limits
            self._write_reg(0x60, self._read_reg(0x60)[0] | 0x12)
            self._write_reg_16(0x44, 32)
            self._write_reg(0x01, 0xFF)

            # SPAD calibration with clean exit
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            self._write_reg(0xFF, 0x06)
            self._write_reg(0x83, self._read_reg(0x83)[0] | 0x04)
            self._write_reg(0xFF, 0x07)
            self._write_reg(0x81, 0x01)
            self._write_reg(0x80, 0x01)
            self._write_reg(0x94, 0x6B)
            self._write_reg(0x83, 0x00)
            for _ in range(50):
                if self._read_reg(0x83)[0] != 0: break
                time.sleep_ms(2)
            self._write_reg(0x83, 0x01)
            spad_info = self._read_reg(0x92)[0] if len(self._read_reg(0x92)) > 0 else 0
            spad_count = spad_info & 0x7F
            is_aperture = (spad_info >> 7) & 0x01

            # Exit SPAD reading mode cleanly
            self._write_reg(0x81, 0x00)
            self._write_reg(0xFF, 0x06)
            self._write_reg(0x83, self._read_reg(0x83)[0] & ~0x04)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Load SPAD map
            ref_spad_map = bytearray(self._read_reg(0xB0, 6))
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x4F, 0x00)
            self._write_reg(0x4E, 0x2C)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0xB6, 0xB4)

            first_spad = 12 if is_aperture else 0
            spads_enabled = 0
            for i in range(48):
                if i < first_spad or spads_enabled == spad_count:
                    ref_spad_map[i // 8] &= ~(1 << (i % 8))
                elif (ref_spad_map[i // 8] >> (i % 8)) & 0x01:
                    spads_enabled += 1
            if len(ref_spad_map) == 6:
                try: self.i2c.writeto_mem(self.address, 0xB0, ref_spad_map)
                except: pass

            # Standard ST Tuning Registers
            tuning = (
                (0xFF, 0x01), (0x00, 0x00), (0xFF, 0x00), (0x09, 0x00),
                (0x10, 0x00), (0x11, 0x00), (0x24, 0x01), (0x25, 0xFF),
                (0x75, 0x00), (0xFF, 0x01), (0x4E, 0x2C), (0x48, 0x00),
                (0x30, 0x20), (0xFF, 0x00), (0x30, 0x09), (0x54, 0x00),
                (0x31, 0x04), (0x32, 0x03), (0x40, 0x83), (0x46, 0x25),
                (0x60, 0x00), (0x27, 0x00), (0x50, 0x06), (0x51, 0x00),
                (0x52, 0x96), (0x56, 0x08), (0x57, 0x30), (0x61, 0x00),
                (0x62, 0x00), (0x64, 0x00), (0x65, 0x00), (0x66, 0xA0),
                (0xFF, 0x01), (0x22, 0x32), (0x47, 0x14), (0x49, 0xFF),
                (0x4A, 0x00), (0xFF, 0x00), (0x7A, 0x0A), (0x7B, 0x00),
                (0x78, 0x21), (0xFF, 0x01), (0x23, 0x34), (0x42, 0x00),
                (0x44, 0xFF), (0x45, 0x26), (0x46, 0x05), (0x40, 0x40),
                (0x0E, 0x06), (0x20, 0x1A), (0x43, 0x40), (0xFF, 0x00),
                (0x34, 0x03), (0x35, 0x44), (0xFF, 0x01), (0x31, 0x04),
                (0x4B, 0x09), (0x4C, 0x05), (0x4D, 0x04), (0xFF, 0x00),
                (0x44, 0x00), (0x45, 0x20), (0x47, 0x08), (0x48, 0x28),
                (0x67, 0x00), (0x70, 0x04), (0x71, 0x01), (0x72, 0xFE),
                (0x76, 0x00), (0x77, 0x00), (0xFF, 0x01), (0x0D, 0x01),
                (0xFF, 0x00), (0x80, 0x01), (0x01, 0xF8), (0xFF, 0x01),
                (0x8E, 0x01), (0x00, 0x01), (0xFF, 0x00), (0x80, 0x00)
            )
            for r, v in tuning:
                self._write_reg(r, v)

            # Interrupt Config
            self._write_reg(0x0A, 0x04)
            self._write_reg(0x84, self._read_reg(0x84)[0] & ~0x10)
            self._write_reg(0x0B, 0x01)

            # Sequence Config & VHV / Phase Cal
            self._write_reg(0x01, 0xE8)
            self._write_reg(0x01, 0x01)
            self._single_ref_cal(0x40)
            self._write_reg(0x01, 0x02)
            self._single_ref_cal(0x00)
            self._write_reg(0x01, 0xE8)
            self.init_done = True
            return True
        except Exception:
            return False

    def _single_ref_cal(self, b):
        self._write_reg(0x00, 0x01 | b)
        for _ in range(50):
            if self._read_reg(0x13)[0] & 0x07: break
            time.sleep_ms(2)
        self._write_reg(0x0B, 0x01)
        self._write_reg(0x00, 0x00)

    def read_distance_mm(self):
        if not self.i2c: return -1
        if not self.init_done:
            if not self._init_sensor(): return -1
        try:
            self._write_reg(0x80, 0x01)
            self._write_reg(0xFF, 0x01)
            self._write_reg(0x00, 0x00)
            self._write_reg(0x91, self.stop_variable)
            self._write_reg(0x00, 0x01)
            self._write_reg(0xFF, 0x00)
            self._write_reg(0x80, 0x00)

            # Trigger measurement
            self._write_reg(0x00, 0x01)
            for _ in range(60):
                val = self._read_reg(0x00)[0]
                if not (val & 0x01): break
                time.sleep_ms(2)

            for _ in range(60):
                val = self._read_reg(0x13)[0]
                if val & 0x07: break
                time.sleep_ms(2)

            data = self._read_reg(0x14, 12)
            self._write_reg(0x0B, 0x01)

            if len(data) >= 12:
                range_status = (data[0] >> 3) & 0x07
                dist_mm = (data[10] << 8) | data[11]
                # Status 4 = Phase fail (no obstacle / target out of range)
                if range_status == 4 or dist_mm in (8190, 8191) or dist_mm > 2200:
                    return -1
                if 20 <= dist_mm <= 2000:
                    return dist_mm
            return -1
        except Exception:
            return -1

    def read_distance(self, unit="MM"):
        mm = self.read_distance_mm()
        if mm == -1: return -1
        if unit == "MM": return mm
        elif unit == "CM": return round(mm / 10.0, 1)
        elif unit == "INCHES": return round(mm / 25.4, 1)
        elif unit == "M": return round(mm / 1000.0, 2)
        return mm

_vl53l0x_instance = None
def _get_vl53l0x():
    global _vl53l0x_instance
    if _vl53l0x_instance is None:
        _vl53l0x_instance = VL53L0X(_get_shared_i2c())
    return _vl53l0x_instance

# ================= OBSTACLE AVOIDANCE ALGORITHM =================
def avoid_obstacle():
    print("Obstacle -> BACKWARD")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(450)

    print("Check RIGHT")
    turn_right(TURN_SPEED)
    time.sleep_ms(550)

    right_distance = _get_vl53l0x().read_distance_mm()
    print("Right Distance:", right_distance, "mm")

    if right_distance == -1 or right_distance > OBSTACLE_DISTANCE_MM:
        print("Right clear -> FORWARD")
        move_forward(FORWARD_SPEED)
        time.sleep_ms(300)
        return

    print("Right blocked -> BACKWARD")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(350)

    print("Check LEFT")
    turn_left(TURN_SPEED)
    time.sleep_ms(1100)

    left_distance = _get_vl53l0x().read_distance_mm()
    print("Left Distance:", left_distance, "mm")

    if left_distance == -1 or left_distance > OBSTACLE_DISTANCE_MM:
        print("Left clear -> FORWARD")
        move_forward(FORWARD_SPEED)
        time.sleep_ms(300)
        return

    print("Both blocked -> BACKWARD + LEFT ESCAPE")
    move_backward(BACKWARD_SPEED)
    time.sleep_ms(500)

    turn_left(TURN_SPEED)
    time.sleep_ms(700)

    move_forward(FORWARD_SPEED)
    time.sleep_ms(300)

# ================= MAIN LOOP =================
def main():
    print("ESP32-S3 VL53L0X 4-Motor Rover Starting...")
    motor_off()

    tof = _get_vl53l0x()
    if not tof.init_done:
        print("Initializing VL53L0X...")
        tof._init_sensor()

    move_forward(FORWARD_SPEED)

    while True:
        distance = tof.read_distance_mm()
        print("Distance:", distance, "mm")

        # Invalid reading / clear distance -> continue forward
        if distance == -1:
            print("Clear (no target) -> FORWARD")
            move_forward(FORWARD_SPEED)
            time.sleep_ms(80)
            continue

        if distance > OBSTACLE_DISTANCE_MM:
            print("Clear path -> FORWARD")
            move_forward(FORWARD_SPEED)
        else:
            print("Obstacle detected!")
            avoid_obstacle()

        time.sleep_ms(80)

if __name__ == '__main__':
    main()
