# ==============================================================================
# LOF TITAN — Measuring the Cosmos (Space Science & Astronomy)
# ------------------------------------------------------------------------------
# Hardware Pin Assignment:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Display: 1.3" SH1106 / 0.96" SSD1306 I2C OLED (SDA: GPIO 7, SCL: GPIO 8, Addr: 0x3C)
#   - ToF Distance Sensor: VL53L1X (SDA: GPIO 7, SCL: GPIO 8, Addr: 0x29)
#   - Pan & Tilt Servos: 
#       * Rotation (Pan) Servo: GPIO 2 (Sensor Port S1 - PWM)
#       * Pitch (Tilt) Servo:    GPIO 1 (Sensor Port S2 - PWM)
#   - Laser Module (Red Diode / Pointer on Sensor Port S5):
#       * Pin 1 (GND):           Connect to Sensor Port S5 GND
#       * Pin 2 (5V / VCC):      Connect to Sensor Port S5 5V / VCC
#       * Pin 3 (S / Control):   Connect to Sensor Port S5 Signal (GPIO 5, HIGH = ON, LOW = OFF)
#   - Analog Joystick (Ultrasonic Port):
#       * VRX (Pan X-Axis):      GPIO 6  (Ultrasonic S1 / 12-bit ADC1_CH5)
#       * VRY (Tilt Y-Axis):     GPIO 19 (Ultrasonic S2 / 12-bit ADC2_CH8)
#       * VCC & GND:             Directly powered by Ultrasonic Port VCC & GND
#   - In-Built Joystick Switch SW / Push Buttons (Target Lock / Measure / Start):
#       * SW Push Switch:        GPIO 18 (UART Port RX / Active LOW with Pull-Up)
#       * Board Buttons:         GPIO 39 (SW1), GPIO 40 (SW2), GPIO 41 (SW3), GPIO 42 (SW4)
#   - Status Indicators:
#       * Red LED:   GPIO 47 (Aiming / Lock / Error)
#       * Green LED: GPIO 48 (Target Match / Victory)
#       * Buzzer:    GPIO 20 (Audio alerts, tones & celebratory fanfares)
#
# Workflow:
#   1. STARTUP & IDLE: Laser is OFF and Servos are in standby mode.
#   2. WAIT_FOR_START: Prompts astronaut to press SW button to begin mission.
#   3. MISSION ACTIVE (All 3 Planet Measurements):
#       - Laser module (GPIO 5) turns ON immediately when start is pressed.
#       - Servos (GPIO 2 & 1) activate for continuous Joystick aiming.
#       - Laser and Servos REMAIN ON across all 3 planet selections and measurements.
#       - Pressing SW button takes the distance measurement:
#           * Correct distance: Score +1, celebratory chime -> RESULT screen.
#           * Incorrect distance: Alert beep & retry prompt.
#   4. MISSION COMPLETED:
#       - Once all 3 planets are measured successfully, Laser turns OFF and Servos enter standby.
#       - Victory fanfare plays and celebration screen is shown.
#       - Pressing SW button restarts a new 3-planet mission.
# ==============================================================================

import time
import math
import random
from machine import Pin, PWM, ADC, I2C, SoftI2C
import framebuf

# ==============================================================================
# 1. HARDWARE PIN DEFINITIONS
# ==============================================================================

# I2C Bus (OLED Display & VL53L1X Laser ToF Sensor)
PIN_I2C_SDA = 7
PIN_I2C_SCL = 8

# Pan & Tilt Servos (Sensor Ports S1 & S2)
PIN_SERVO_ROTATION = 2  # Pan / Rotation Servo (Sensor Port S1 / GPIO 2)
PIN_SERVO_PITCH    = 1  # Tilt / Pitch Servo    (Sensor Port S2 / GPIO 1)

# Laser Module (Sensor Port S5 / GPIO 5)
PIN_LASER          = 5  # Laser Module Signal / Control (Sensor Port S5)

# Analog Joystick (Ultrasonic Port)
PIN_JOYSTICK_VRX   = 6   # Ultrasonic Port S1: Analog VRX (ADC1_CH5)
PIN_JOYSTICK_VRY   = 19  # Ultrasonic Port S2: Analog VRY (ADC2_CH8)

# Joystick In-Built Switch / Push Button (UART Port RX - GPIO 18)
# Connect Switch between GPIO 18 and GND
PIN_BUTTON_18      = 18  # UART RX: Primary digital switch input (Active-LOW to GND with Pull-Up)

# Status LEDs & Buzzer
PIN_LED_RED   = 47
PIN_LED_GREEN = 48
PIN_BUZZER    = 20

# ==============================================================================
# 2. PWM POOL & AUDIO FEEDBACK
# ==============================================================================

_pwm_pool = {}

def get_pwm(pin_num, freq=50):
    """Reuses PWM timers to avoid ESP32-S3 hardware timer exhaustion."""
    if pin_num not in _pwm_pool:
        _pwm_pool[pin_num] = PWM(Pin(pin_num), freq=freq)
    else:
        try:
            _pwm_pool[pin_num].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin_num]

led_red = Pin(PIN_LED_RED, Pin.OUT, value=0)
led_green = Pin(PIN_LED_GREEN, Pin.OUT, value=0)

def beep(freq=2000, duration_ms=50, duty_val=512):
    """Produces crisp audio tone feedback."""
    try:
        buz = get_pwm(PIN_BUZZER, freq=freq)
        buz.duty(duty_val)
        time.sleep_ms(duration_ms)
        buz.duty(0)
    except Exception:
        pass

def tone_button_click():
    beep(2400, 35)

def tone_correct():
    led_green.value(1)
    notes = [1046, 1318, 1568, 2093]  # C6, E6, G6, C7
    for n in notes:
        beep(n, 70)
        time.sleep_ms(20)
    led_green.value(0)

def tone_wrong():
    led_red.value(1)
    beep(400, 150)
    time.sleep_ms(50)
    beep(300, 250)
    led_red.value(0)

def tone_mission_complete():
    fanfare = [
        (1046, 120), (1046, 120), (1046, 120), (1318, 300),
        (1174, 150), (1318, 150), (1568, 400), (2093, 600)
    ]
    for freq, dur in fanfare:
        led_green.value(1)
        led_red.value(0)
        beep(freq, dur)
        led_green.value(0)
        led_red.value(1)
        time.sleep_ms(30)
    led_red.value(0)
    led_green.value(1)

# ==============================================================================
# 3. HIGH-PRECISION SERVO DRIVER (50Hz RC PWM WITH NANOSECOND PRECISION)
# ==============================================================================

class TitanServo:
    """Controls RC standard servo (0° to 180°) using 50Hz PWM with nanosecond precision."""
    def __init__(self, pin_num, min_us=500, max_us=2500, default_deg=90.0, auto_enable=False):
        self.pin_num = pin_num
        self.min_us = min_us
        self.max_us = max_us
        self.current_angle = default_deg
        self.target_angle = default_deg
        self.pwm = get_pwm(pin_num, freq=50)
        self.enabled = False
        self._last_ns = -1
        if auto_enable:
            self.enable()
        else:
            self.disable()

    def enable(self):
        """Enables servo PWM signal output."""
        self.enabled = True
        self._last_ns = -1
        self.write_angle(self.current_angle)

    def disable(self):
        """Disables servo PWM signal to eliminate idle jitter & save power."""
        self.enabled = False
        self._last_ns = -1
        try:
            if hasattr(self.pwm, 'duty_u16'):
                self.pwm.duty_u16(0)
            else:
                self.pwm.duty(0)
        except Exception:
            pass

    def write_angle(self, angle_deg):
        """Sets servo angle (0 to 180 degrees) with sub-degree nanosecond resolution."""
        angle_deg = max(0.0, min(180.0, float(angle_deg)))
        self.current_angle = angle_deg
        if not self.enabled:
            return
        us = self.min_us + (angle_deg / 180.0) * (self.max_us - self.min_us)
        ns = int(us * 1000)
        if ns == self._last_ns:
            return
        self._last_ns = ns
        try:
            if hasattr(self.pwm, 'duty_ns'):
                self.pwm.duty_ns(ns)
            elif hasattr(self.pwm, 'duty_u16'):
                duty_16bit = int((us / 20000.0) * 65535.0)
                self.pwm.duty_u16(duty_16bit)
            else:
                duty_10bit = int((us / 20000.0) * 1023.0)
                self.pwm.duty(duty_10bit)
        except Exception:
            try:
                duty_16bit = int((us / 20000.0) * 65535.0)
                self.pwm.duty_u16(duty_16bit)
            except Exception:
                pass

    def update_smooth(self, target, max_step=2.0):
        """Smoothly interpolates towards target angle."""
        self.target_angle = target
        diff = self.target_angle - self.current_angle
        if abs(diff) <= max_step:
            self.current_angle = self.target_angle
        else:
            self.current_angle += max_step if diff > 0 else -max_step
        self.write_angle(self.current_angle)

# ==============================================================================
# 4. 1.3" SH1106 / 0.96" SSD1306 OLED DRIVER
# ==============================================================================

class TitanOLED:
    """OLED graphics and text rendering engine with Large Font scaling."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C, is_sh1106=True):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.is_sh1106 = is_sh1106
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.init_display()

    def _cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception:
            pass

    def init_display(self):
        cmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ]
        for c in cmds:
            self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color):
        self.fb.fill(color)

    def text(self, string, x, y, col=1):
        self.fb.text(string, int(x), int(y), col)

    def center_text(self, string, y, col=1):
        x = max(0, (self.width - len(string) * 8) // 2)
        self.fb.text(string, int(x), int(y), col)

    def draw_large_text(self, string, x, y, scale=2, col=1):
        """Renders integer-scaled bold characters."""
        _w = len(string) * 8
        temp_buf = bytearray(_w)
        temp_fb = framebuf.FrameBuffer(temp_buf, _w, 8, framebuf.MONO_VLSB)
        temp_fb.fill(0)
        temp_fb.text(string, 0, 0, 1)
        for px in range(_w):
            for py in range(8):
                if temp_fb.pixel(px, py):
                    self.fb.fill_rect(int(x + px * scale), int(y + py * scale), scale, scale, col)

    def center_large_text(self, string, y, scale=2, col=1):
        w = len(string) * 8 * scale
        x = max(0, (self.width - w) // 2)
        self.draw_large_text(string, x, y, scale=scale, col=col)

    def line(self, x1, y1, x2, y2, col=1):
        self.fb.line(int(x1), int(y1), int(x2), int(y2), col)

    def rect(self, x, y, w, h, col=1):
        self.fb.rect(int(x), int(y), int(w), int(h), col)

    def fill_rect(self, x, y, w, h, col=1):
        self.fb.fill_rect(int(x), int(y), int(w), int(h), col)

    def show(self):
        try:
            for page in range(self.height // 8):
                self._cmd(0xB0 + page)
                if self.is_sh1106:
                    self._cmd(0x02)  # SH1106 2-column offset for 1.3" OLEDs
                    self._cmd(0x10)
                else:
                    self._cmd(0x00)
                    self._cmd(0x10)
                start = page * self.width
                self.i2c.writeto(self.addr, b'\x40' + self.buffer[start:start + self.width])
        except Exception:
            pass

# ==============================================================================
# 5. VL53L1X TIME-OF-FLIGHT LASER SENSOR DRIVER (SINGLE FILE MICROPYTHON)
# ==============================================================================

VL53_ADDR = 0x29

class VL53L1X:
    """VL53L1X single-file driver for LOF TITAN (ESP32-S3)."""
    def __init__(self, i2c, address=0x29):
        self.i2c = i2c
        self.address = address
        self.connected = False

        try:
            print("Resetting VL53L1X...")
            self.reset()
            time.sleep_ms(150)

            model_id = self.read16(0x010F)
            print("Sensor ID:", hex(model_id))

            if model_id != 0xEACC:
                print("Note: Sensor model ID is {}".format(hex(model_id)))

            print("VL53L1X detected")
            self.init_sensor()
            print("VL53L1X initialised")
            self.connected = True
        except Exception as e:
            print("[VL53L1X] Init Error:", e)
            self.connected = False
        except KeyboardInterrupt:
            raise

    def write8(self, reg, value):
        self.i2c.writeto_mem(
            self.address,
            reg,
            bytes([value]),
            addrsize=16
        )

    def write16(self, reg, value):
        data = bytes([
            (value >> 8) & 0xFF,
            value & 0xFF
        ])
        self.i2c.writeto_mem(
            self.address,
            reg,
            data,
            addrsize=16
        )

    def read8(self, reg):
        return self.i2c.readfrom_mem(
            self.address,
            reg,
            1,
            addrsize=16
        )[0]

    def read16(self, reg):
        data = self.i2c.readfrom_mem(
            self.address,
            reg,
            2,
            addrsize=16
        )
        return (data[0] << 8) | data[1]

    def reset(self):
        self.write8(0x0000, 0x00)
        time.sleep_ms(100)
        self.write8(0x0000, 0x01)
        time.sleep_ms(100)

    def init_sensor(self):
        config = bytes([
            0x00, 0x00, 0x00, 0x01,
            0x02, 0x00, 0x02, 0x08,
            0x00, 0x08, 0x10, 0x01,
            0x01, 0x00, 0x00, 0x00,

            0x00, 0xFF, 0x00, 0x0F,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x20, 0x0B, 0x00,
            0x00, 0x02, 0x0A, 0x21,

            0x00, 0x00, 0x05, 0x00,
            0x00, 0x00, 0x00, 0xC8,
            0x00, 0x00, 0x38, 0xFF,
            0x01, 0x00, 0x08, 0x00,

            0x00, 0x01, 0xDB, 0x0F,
            0x01, 0xF1, 0x0D, 0x01,
            0x68, 0x00, 0x80, 0x08,
            0xB8, 0x00, 0x00, 0x00,

            0x00, 0x0F, 0x89, 0x00,
            0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x01, 0x0F,
            0x0D, 0x0E, 0x0E, 0x00,

            0x00, 0x02, 0xC7, 0xFF,
            0x9B, 0x00, 0x00, 0x00,
            0x01, 0x01, 0x40
        ])

        self.i2c.writeto_mem(
            self.address,
            0x002D,
            config,
            addrsize=16
        )

        value = self.read16(0x0022)
        self.write16(
            0x001E,
            value * 4
        )
        time.sleep_ms(300)

    def read_distance(self):
        if not self.connected:
            return 0, 255
        try:
            data = self.i2c.readfrom_mem(
                self.address,
                0x0089,
                17,
                addrsize=16
            )
            status = data[0]
            distance = ((data[13] << 8) | data[14])
            self.write8(0x0086, 0x01)
            return distance, status
        except Exception:
            return 0, 255

    def read_distance_cm(self):
        dist_mm, status = self.read_distance()
        if dist_mm > 0 and dist_mm < 4000:
            return round(dist_mm / 10.0, 1)
        return 0.0

# ==============================================================================
# 6. SOLAR SYSTEM PLANETS DATABASE
# ==============================================================================

# Scaled astronomical target distances (15 cm to 60 cm for tabletop lab activities)
PLANETS = [
    {"name": "MERCURY", "cm": 18.0, "au": 0.39,  "min_cm": 16.0, "max_cm": 20.0, "measured": False},
    {"name": "VENUS",   "cm": 24.0, "au": 0.72,  "min_cm": 22.0, "max_cm": 26.0, "measured": False},
    {"name": "EARTH",   "cm": 30.0, "au": 1.00,  "min_cm": 28.0, "max_cm": 32.0, "measured": False},
    {"name": "MARS",    "cm": 36.0, "au": 1.52,  "min_cm": 34.0, "max_cm": 38.0, "measured": False},
    {"name": "JUPITER", "cm": 42.0, "au": 5.20,  "min_cm": 40.0, "max_cm": 44.0, "measured": False},
    {"name": "SATURN",  "cm": 48.0, "au": 9.58,  "min_cm": 46.0, "max_cm": 50.0, "measured": False},
    {"name": "URANUS",  "cm": 54.0, "au": 19.22, "min_cm": 52.0, "max_cm": 56.0, "measured": False},
    {"name": "NEPTUNE", "cm": 60.0, "au": 30.05, "min_cm": 58.0, "max_cm": 62.0, "measured": False},
]

def map_float(val, in_min, in_max, out_min, out_max):
    """Linearly maps a floating point value across ranges."""
    if in_max == in_min:
        return out_min
    return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

# ==============================================================================
# 7. MAIN COSMOS CONTROLLER & STATE MACHINE
# ==============================================================================

class CosmosMissionController:
    # Game States
    STATE_STARTUP          = 0
    STATE_TITLE            = 1
    STATE_WAIT_FOR_START   = 2
    STATE_PLANET_SELECT    = 3
    STATE_MEASUREMENT      = 4
    STATE_RESULT           = 5
    STATE_COMPLETED        = 6

    def __init__(self):
        print("=" * 60)
        print("LOF TITAN — MEASURING THE COSMOS (SPACE SCIENCE IDE)")
        print("=" * 60)

        # 1. Initialize High-Speed I2C Bus at 400kHz (SDA: 7, SCL: 8)
        try:
            self.i2c = I2C(0, sda=Pin(PIN_I2C_SDA), scl=Pin(PIN_I2C_SCL), freq=400000)
        except Exception:
            self.i2c = SoftI2C(sda=Pin(PIN_I2C_SDA), scl=Pin(PIN_I2C_SCL), freq=400000)
        time.sleep_ms(50)

        # 2. Initialize 1.3" OLED Display
        self.oled = TitanOLED(self.i2c, width=128, height=64, addr=0x3C, is_sh1106=True)

        # 3. Initialize VL53L1X Laser ToF Sensor
        self.tof = VL53L1X(self.i2c, address=VL53_ADDR)

        # 4. Initialize Laser Module (Sensor Port S5 / GPIO 5)
        self.laser = Pin(PIN_LASER, Pin.OUT, value=0)

        # 5. Initialize Servos (Pan: Sensor S1 / GPIO 2, Tilt: Sensor S2 / GPIO 1)
        self.servo_rot = TitanServo(PIN_SERVO_ROTATION, default_deg=90.0, auto_enable=False)
        self.servo_pitch = TitanServo(PIN_SERVO_PITCH, default_deg=90.0, auto_enable=False)

        # Servo motion parameters
        self.target_rot = 90.0
        self.target_pitch = 90.0
        self.min_rot = 0.0
        self.max_rot = 180.0
        self.min_pitch = 30.0
        self.max_pitch = 150.0
        self.servo_speed = 3.0

        # 6. Initialize 12-bit Analog Joystick on Ultrasonic Port (VRX=GPIO 6, VRY=GPIO 19)
        self.joy_vrx = ADC(Pin(PIN_JOYSTICK_VRX))
        self.joy_vry = ADC(Pin(PIN_JOYSTICK_VRY))
        try:
            self.joy_vrx.atten(ADC.ATTN_11DB)
            self.joy_vry.atten(ADC.ATTN_11DB)
        except Exception:
            pass

        # 7. Initialize Button Inputs with Pull-Up (Primary: GPIO 18 / UART RX, Secondary: SW1..SW4)
        # GPIO 18 (UART RX) is a dedicated digital GPIO with strong pull-up that works 100% reliably with GND.
        self.btn_pins = [
            ("RX_18", Pin(PIN_BUTTON_18, Pin.IN, Pin.PULL_UP)),
            ("SW1", Pin(39, Pin.IN, Pin.PULL_UP)),
            ("SW2", Pin(40, Pin.IN, Pin.PULL_UP)),
            ("SW3", Pin(41, Pin.IN, Pin.PULL_UP)),
            ("SW4", Pin(42, Pin.IN, Pin.PULL_UP)),
        ]

        # State Variables
        self.state = self.STATE_STARTUP
        self.state_start_time = time.ticks_ms()
        self.score = 0
        self.current_planet_idx = -1
        self.used_planets = []
        self.current_distance_cm = 0.0
        self.last_measure_time = 0
        self.last_serial_print_time = 0
        self.last_btn_press_time = 0
        self.last_screen_draw_time = 0
        self.last_joy_time = time.ticks_ms()
        self.filtered_joy_x = 2048.0
        self.filtered_joy_y = 2048.0
        self.attempts = 0

        # Initial standby: Laser OFF, Servos DISABLED
        self.disable_laser_and_servos()

        # Button debounce state tracking
        self.prev_btn_states = {name: pin.value() for name, pin in self.btn_pins}

    def enable_laser_and_servos(self):
        """Enables laser and pan/tilt servos when planet search/measurement starts."""
        try:
            self.laser.value(1)
        except Exception:
            pass
        self.servo_rot.enable()
        self.servo_pitch.enable()
        self.servo_rot.write_angle(self.target_rot)
        self.servo_pitch.write_angle(self.target_pitch)
        self.last_joy_time = time.ticks_ms()
        print("[ACTIVE] Laser ON (GPIO 5) & Pan/Tilt Servos ENABLED")

    def disable_laser_and_servos(self):
        """Disables laser and pan/tilt servos during menus and result screens."""
        try:
            self.laser.value(0)
        except Exception:
            pass
        self.servo_rot.disable()
        self.servo_pitch.disable()
        print("[STANDBY] Laser OFF (GPIO 5) & Pan/Tilt Servos DISABLED")

    def reset_game(self):
        for p in PLANETS:
            p["measured"] = False
        self.score = 0
        self.used_planets = []
        self.current_planet_idx = -1
        self.target_rot = 90.0
        self.target_pitch = 90.0
        self.disable_laser_and_servos()

    def change_state(self, new_state):
        self.state = new_state
        self.state_start_time = time.ticks_ms()
        print("[STATE] Transitioned to:", new_state)

    def select_random_planet(self):
        if len(self.used_planets) >= len(PLANETS):
            self.reset_game()

        available = [i for i in range(len(PLANETS)) if i not in self.used_planets]
        if available:
            self.current_planet_idx = random.choice(available)
            self.used_planets.append(self.current_planet_idx)
        else:
            self.current_planet_idx = random.randint(0, len(PLANETS) - 1)

        self.attempts = 0
        planet_name = PLANETS[self.current_planet_idx]["name"]
        print("[MISSION] Target Planet Selected:", planet_name)

    def is_correct_distance(self):
        if self.current_planet_idx < 0:
            return False
        p = PLANETS[self.current_planet_idx]
        return p["min_cm"] <= self.current_distance_cm <= p["max_cm"]

    def read_inputs(self):
        """Reads 12-bit Analog Joystick (GPIO 6, GPIO 19) and Button inputs (Active-LOW to GND)."""
        now = time.ticks_ms()

        # 1. Read Button Inputs (Active-LOW: Pin pulled to GND when pressed)
        #    Monitors UART RX (GPIO 18) and onboard switches simultaneously
        action_triggered = False
        for name, pin in self.btn_pins:
            val = pin.value()
            prev = self.prev_btn_states[name]
            if val == 0 and prev == 1:
                if time.ticks_diff(now, self.last_btn_press_time) > 150:
                    self.last_btn_press_time = now
                    action_triggered = True
                    tone_button_click()
                    print(f"[BUTTON] {name} Pressed (Short to GND) -> Target Lock / Action!")
            self.prev_btn_states[name] = val

        # 2. Read 12-bit Analog Joystick with Time-Delta Integration & Low-Pass Filtering
        # Provides instant response, smooth proportional control, and zero resting jitter
        dt_ms = time.ticks_diff(now, self.last_joy_time)
        if dt_ms < 1:
            dt_ms = 1
        elif dt_ms > 50:
            dt_ms = 50
        self.last_joy_time = now
        dt = dt_ms / 1000.0

        if self.state in (self.STATE_MEASUREMENT, self.STATE_PLANET_SELECT) and self.servo_rot.enabled:
            raw_x = 2048
            raw_y = 2048
            try:
                raw_x = self.joy_vrx.read()
                raw_y = self.joy_vry.read()
            except Exception:
                pass

            # Exponential low-pass filter (alpha = 0.35) to eliminate raw ADC jitter
            self.filtered_joy_x += (raw_x - self.filtered_joy_x) * 0.35
            self.filtered_joy_y += (raw_y - self.filtered_joy_y) * 0.35

            diff_x = self.filtered_joy_x - 2048.0
            diff_y = self.filtered_joy_y - 2048.0

            # Tight responsive deadzone (120 counts)
            deadzone = 120.0

            # Dynamic Proportional Pan Control (VRX: GPIO 6)
            abs_dx = abs(diff_x)
            if abs_dx > deadzone:
                norm_x = min(1.0, (abs_dx - deadzone) / (2048.0 - deadzone))
                # Smooth progressive curve: fine precision aiming at low tilt, up to 85°/s at full tilt
                speed_x = (norm_x ** 1.4) * 85.0
                dir_x = -1.0 if diff_x > 0 else 1.0
                self.target_rot = max(self.min_rot, min(self.max_rot, self.target_rot + dir_x * speed_x * dt))
                self.servo_rot.write_angle(self.target_rot)

            # Dynamic Proportional Tilt Control (VRY: GPIO 19)
            abs_dy = abs(diff_y)
            if abs_dy > deadzone:
                norm_y = min(1.0, (abs_dy - deadzone) / (2048.0 - deadzone))
                speed_y = (norm_y ** 1.4) * 85.0
                dir_y = 1.0 if diff_y > 0 else -1.0
                self.target_pitch = max(self.min_pitch, min(self.max_pitch, self.target_pitch + dir_y * speed_y * dt))
                self.servo_pitch.write_angle(self.target_pitch)

        # 3. Periodic Serial Telemetry (every 250ms)
        if time.ticks_diff(now, self.last_serial_print_time) >= 250:
            self.last_serial_print_time = now
            rx18_val = self.prev_btn_states.get("RX_18", 1)
            sw_status = "CLICKED(GND)" if rx18_val == 0 else "IDLE(3.3V)"
            target_p = PLANETS[self.current_planet_idx]["name"] if self.current_planet_idx >= 0 else "READY"
            laser_st = "ON" if self.laser.value() == 1 else "OFF"
            print(f"[STATUS] Laser={laser_st} | SW_RX(GPIO18)={sw_status} | Pan={self.target_rot:.1f}° | Tilt={self.target_pitch:.1f}° | ToF={self.current_distance_cm:.1f}cm | Target={target_p}")

        return action_triggered

    def update_distance(self):
        """Samples VL53L1X ToF laser distance sensor."""
        now = time.ticks_ms()
        if time.ticks_diff(now, self.last_measure_time) >= 150:
            self.last_measure_time = now
            if self.tof and self.tof.connected:
                dist_cm = self.tof.read_distance_cm()
                if dist_cm > 0:
                    self.current_distance_cm = dist_cm
            else:
                # Simulation / Test fallback if sensor unplugged
                self.current_distance_cm = round(map_float(self.target_rot, 0, 180, 15.0, 65.0), 1)

    # ----------------------------------------------------------
    # DISPLAY SCREENS
    # ----------------------------------------------------------

    def show_screen_startup(self):
        self.oled.fill(0)
        self.oled.rect(0, 0, 128, 64, 1)
        self.oled.center_large_text("LOF TITAN", 8, scale=2)
        self.oled.line(10, 28, 118, 28, 1)
        self.oled.center_text("Lab of Future", 34)
        self.oled.center_text("Cosmos Observatory", 48)
        self.oled.show()

    def show_screen_title(self):
        self.oled.fill(0)
        self.oled.center_large_text("MEASURING", 6, scale=2)
        self.oled.center_large_text("COSMOS", 24, scale=2)
        self.oled.line(10, 44, 118, 44, 1)
        self.oled.center_text("Space Science IDE", 50)
        self.oled.show()

    def show_screen_wait_for_start(self):
        self.oled.fill(0)
        self.oled.rect(2, 2, 124, 60, 1)
        self.oled.center_text("READY TO LAUNCH", 10)
        self.oled.line(10, 22, 118, 22, 1)
        self.oled.center_text("Press SW (Pin 18)", 30)
        self.oled.center_text("to Start Mission", 44)
        self.oled.show()

    def show_screen_planet_selection(self):
        if self.current_planet_idx < 0:
            return
        p = PLANETS[self.current_planet_idx]
        self.oled.fill(0)
        self.oled.rect(0, 0, 128, 64, 1)
        self.oled.center_text("TARGET PLANET:", 8)
        self.oled.line(10, 22, 118, 22, 1)
        self.oled.center_large_text(p["name"], 30, scale=2)
        self.oled.center_text(f"Expected: {p['au']} AU", 50)
        self.oled.show()

    def show_screen_measurement(self):
        if self.current_planet_idx < 0:
            return
        p = PLANETS[self.current_planet_idx]
        self.oled.fill(0)

        # Header: Planet target
        self.oled.fill_rect(0, 0, 128, 12, 1)
        self.oled.text(f"FIND: {p['name']}", 4, 2, 0)

        # Distance Readings
        self.oled.text(f"DIST : {self.current_distance_cm:.1f} cm", 4, 16, 1)
        
        # Calculate scaled AU
        if self.current_distance_cm > 0:
            calc_au = map_float(self.current_distance_cm, 15.0, 60.0, 0.39, 30.05)
            self.oled.text(f"SCALE: {calc_au:.2f} AU", 4, 28, 1)
        else:
            self.oled.text("SCALE: --- AU", 4, 28, 1)

        # Status Bar & Controls
        self.oled.line(0, 42, 128, 42, 1)
        self.oled.text("Joy:Aim  SW:Measure", 4, 46, 1)
        self.oled.text(f"Pan:{int(self.target_rot)}° Tilt:{int(self.target_pitch)}°", 4, 55, 1)
        self.oled.show()

    def show_screen_wrong_attempt(self):
        self.oled.fill(0)
        self.oled.rect(2, 2, 124, 60, 1)
        self.oled.center_large_text("TRY AGAIN", 10, scale=2)
        self.oled.line(10, 30, 118, 30, 1)
        self.oled.center_text("Distance Mismatch!", 36)
        self.oled.center_text(f"Got {self.current_distance_cm:.1f}cm", 48)
        self.oled.show()

    def show_screen_result(self):
        if self.current_planet_idx < 0:
            return
        p = PLANETS[self.current_planet_idx]
        self.oled.fill(0)
        self.oled.center_large_text("CORRECT!", 4, scale=2)
        self.oled.line(0, 22, 128, 22, 1)
        self.oled.text(f"Planet: {p['name']}", 4, 26, 1)
        self.oled.text(f"Dist  : {p['cm']:.1f} cm", 4, 38, 1)
        self.oled.text(f"AU    : {p['au']:.2f} AU", 4, 48, 1)
        self.oled.text(f"Score : {self.score}/3", 80, 48, 1)
        self.oled.show()

    def show_screen_completed(self):
        self.oled.fill(0)
        self.oled.rect(0, 0, 128, 64, 1)
        self.oled.center_large_text("MISSION", 6, scale=2)
        self.oled.center_large_text("COMPLETE!", 24, scale=2)
        self.oled.line(10, 42, 118, 42, 1)
        self.oled.center_text("Score: 3/3 Planets", 46)
        self.oled.center_text("Press SW to Restart", 55)
        self.oled.show()

    # ----------------------------------------------------------
    # MAIN EVENT LOOP
    # ----------------------------------------------------------

    def run(self):
        while True:
            now = time.ticks_ms()
            elapsed = time.ticks_diff(now, self.state_start_time)
            action_btn_triggered = self.read_inputs()

            if self.state == self.STATE_STARTUP:
                self.show_screen_startup()
                if elapsed >= 2000:
                    self.change_state(self.STATE_TITLE)

            elif self.state == self.STATE_TITLE:
                self.show_screen_title()
                if elapsed >= 3000:
                    self.change_state(self.STATE_WAIT_FOR_START)

            elif self.state == self.STATE_WAIT_FOR_START:
                self.show_screen_wait_for_start()
                if action_btn_triggered:
                    self.reset_game()
                    self.select_random_planet()
                    self.enable_laser_and_servos()  # Laser ON & Servos active for entire 3-planet mission
                    self.change_state(self.STATE_PLANET_SELECT)

            elif self.state == self.STATE_PLANET_SELECT:
                self.show_screen_planet_selection()
                if elapsed >= 2500:
                    self.change_state(self.STATE_MEASUREMENT)

            elif self.state == self.STATE_MEASUREMENT:
                self.update_distance()
                if time.ticks_diff(now, self.last_screen_draw_time) >= 60:
                    self.last_screen_draw_time = now
                    self.show_screen_measurement()

                # Single push button measures current pointed distance
                if action_btn_triggered:
                    print(f"[MEASURE] Reading: {self.current_distance_cm} cm | Checking against target...")
                    if self.is_correct_distance():
                        self.score += 1
                        PLANETS[self.current_planet_idx]["measured"] = True
                        tone_correct()
                        # Laser and Servos REMAIN ON for next planet
                        self.change_state(self.STATE_RESULT)
                    else:
                        tone_wrong()
                        self.show_screen_wrong_attempt()
                        time.sleep_ms(1800)

            elif self.state == self.STATE_RESULT:
                self.show_screen_result()
                if elapsed >= 3500:
                    if self.score >= 3:
                        # All 3 measurements completed: turn off laser & disable servos
                        self.disable_laser_and_servos()
                        tone_mission_complete()
                        self.change_state(self.STATE_COMPLETED)
                    else:
                        # Continue to next planet without turning off laser/servos
                        self.select_random_planet()
                        self.change_state(self.STATE_PLANET_SELECT)

            elif self.state == self.STATE_COMPLETED:
                self.show_screen_completed()
                if action_btn_triggered:
                    self.reset_game()
                    self.select_random_planet()
                    self.enable_laser_and_servos()
                    self.change_state(self.STATE_PLANET_SELECT)

            # Auto CPU Safety Yield
            time.sleep_ms(5)

# ==============================================================================
# 8. PROGRAM ENTRY POINT
# ==============================================================================

def main():
    try:
        app = CosmosMissionController()
        app.run()
    except KeyboardInterrupt:
        print("\n[INFO] Stopped by user.")
    except Exception as e:
        print("[FATAL ERROR]:", e)

if __name__ == '__main__':
    main()
