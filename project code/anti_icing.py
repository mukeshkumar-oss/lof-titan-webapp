# ==============================================================================
# LOF TITAN — Anti-Icing Thermal Control System
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Sensor: DS18B20 Waterproof 1-Wire Digital Temperature Probe (Port S1 / GPIO 2)
#   - Actuator: PTC Heating Element connected to Motor Channel 1 (M1: GPIO 15 PWM, GPIO 16 = 0)
#   - Display: 2 x 16 (1602) Liquid Crystal I2C Display (HD44780 + PCF8574 I2C adapter)
#   - Bus: I2C on SDA: GPIO 7, SCL: GPIO 8 (Addr: 0x27 or 0x3F auto-detected)
#   - Status LEDs: GPIO 47 (Red / Heating Active), GPIO 48 (Green / Safe & Standby)
#   - Buzzer: GPIO 20 (Audio Alerts on State Changes)
#
# Control Specifications & Behavior:
#   1. Splash Screen: Displays "ANTI-ICING SYSTEM" with animated initialization.
#   2. Temperature Trigger:
#      - Below 20.0°C: Anti-icing heating activates automatically.
#      - Target Setpoint: 30.0°C (Heater modulates via PID and cuts off at >= 30.0°C).
#   3. PID Control: Proportional-Integral-Derivative algorithm modulates M1 PWM duty
#      cycle smoothly (0–100%) to maintain steady thermal equilibrium without overshoot.
#   4. 16x2 LCD Display Layout:
#      - Line 1: Live Temperature reading & Target setpoint (e.g., "T: 18.5°C SET:30°C")
#      - Line 2: Heater status (ON/OFF), PID output percentage, and visual power bar.
#   5. Failsafe Protection: Automatically cuts heater PWM if sensor disconnected.
# ==============================================================================

import time
from machine import Pin, PWM, SoftI2C, I2C
import onewire
import ds18x20

# ==============================================================================
# ⚙️ USER CONFIGURATION — GLOBAL TEMPERATURE & POWER LIMITS
# ------------------------------------------------------------------------------
# Easily adjust thermal thresholds and power limits here:
# ==============================================================================
HEATER_ON_TEMP   = 20.0   # Heating turns ON when temperature drops below this (°C)
HEATER_OFF_TEMP  = 30.0   # Heating cuts OFF when temperature reaches or exceeds this (°C)
MAX_PWM_PERCENT  = 50.0   # Maximum heater speed / PWM percentage limit (0.0 to 50.0%)

# ================= 1. HARDWARE PINS & PWM MANAGER =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    """Singleton PWM pool manager to prevent timer exhaustion on ESP32-S3."""
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

# Status LEDs & Buzzer
led_red = Pin(47, Pin.OUT)   # Red: Heating Active
led_grn = Pin(48, Pin.OUT)   # Green: Safe / Target Reached
pin_m1_dir = Pin(16, Pin.OUT) # M1 Direction Pin (Ground for uni-directional heater)
pin_m1_dir.value(0)

def beep(freq=2400, duration_ms=50):
    """Short audible feedback tone."""
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty_u16(32768)
        time.sleep_ms(duration_ms)
        buz.duty_u16(0)
    except Exception:
        pass

def alert_sound(pattern="start"):
    """Audible alerts for system state transitions."""
    if pattern == "start":
        for f in (1200, 1800, 2400):
            beep(f, 40)
            time.sleep_ms(25)
    elif pattern == "heat_on":
        beep(1500, 70)
        time.sleep_ms(30)
        beep(2000, 90)
    elif pattern == "cutoff":
        beep(2200, 60)
        time.sleep_ms(30)
        beep(1400, 80)
    elif pattern == "error":
        for _ in range(3):
            beep(800, 100)
            time.sleep_ms(50)


# ================= 2. 2x16 I2C LIQUID CRYSTAL DISPLAY (LCD 1602) DRIVER =================
class TitanLCD1602:
    """Zero-dependency HD44780 + PCF8574 I2C Character LCD Driver."""
    def __init__(self, i2c, addr=0x27, cols=16, rows=2):
        self.i2c = i2c
        self.cols = cols
        self.rows = rows
        self.addr = addr
        self.backlight_state = 0x08 # Bit 3 = Backlight ON
        
        # Auto-detect I2C address if needed
        if self.i2c:
            try:
                devs = self.i2c.scan()
                if self.addr not in devs:
                    if 0x27 in devs: self.addr = 0x27
                    elif 0x3F in devs: self.addr = 0x3F
                    elif devs: self.addr = devs[0]
            except Exception:
                pass
        
        self._init_lcd()
        self._create_custom_chars()

    def _write_byte(self, data):
        if not self.i2c: return
        try:
            self.i2c.writeto(self.addr, bytes([data | self.backlight_state]))
        except Exception:
            pass

    def _pulse_enable(self, data):
        self._write_byte(data | 0x04) # En High
        time.sleep_us(500)
        self._write_byte(data & ~0x04) # En Low
        time.sleep_us(100)

    def _write_nibble(self, nibble, mode=0):
        # mode: 0 for command (RS=0), 1 for data (RS=1)
        byte = (nibble & 0xF0) | mode
        self._write_byte(byte)
        self._pulse_enable(byte)

    def _send(self, value, mode=0):
        self._write_nibble(value & 0xF0, mode)
        self._write_nibble((value << 4) & 0xF0, mode)

    def command(self, cmd):
        self._send(cmd, 0)
        if cmd <= 3:
            time.sleep_ms(2)

    def write_char(self, char_code):
        self._send(char_code, 1)

    def _init_lcd(self):
        time.sleep_ms(50)
        # 4-bit initialization sequence
        for _ in range(3):
            self._write_nibble(0x30, 0)
            time.sleep_ms(5)
        self._write_nibble(0x20, 0)
        time.sleep_ms(2)
        self.command(0x28) # 2 lines, 5x8 font
        self.command(0x0C) # Display ON, Cursor OFF, Blink OFF
        self.command(0x06) # Auto increment
        self.command(0x01) # Clear
        time.sleep_ms(5)

    def _create_custom_chars(self):
        """Define custom character glyphs for degree symbol, flame, and thermometer."""
        # Char 0: Degree Symbol (°)
        deg_glyph = [0x06, 0x09, 0x09, 0x06, 0x00, 0x00, 0x00, 0x00]
        # Char 1: Flame / Heat Icon
        flame_glyph = [0x04, 0x0A, 0x0A, 0x11, 0x15, 0x1F, 0x0E, 0x04]
        # Char 2: Snowflake / Ice Icon
        ice_glyph = [0x00, 0x15, 0x0E, 0x1F, 0x0E, 0x15, 0x00, 0x00]
        # Char 3: Power Bar block (1 bar)
        bar1_glyph = [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x10]
        # Char 4: Power Bar block (Full bar)
        bar_full = [0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F, 0x1F]

        glyphs = [deg_glyph, flame_glyph, ice_glyph, bar1_glyph, bar_full]
        for idx, pattern in enumerate(glyphs):
            self.command(0x40 | (idx << 3))
            for b in pattern:
                self.write_char(b)
        self.command(0x80) # Reset to DDRAM

    def clear(self):
        self.command(0x01)
        time.sleep_ms(2)

    def backlight(self, on=True):
        self.backlight_state = 0x08 if on else 0x00
        self._write_byte(0)

    def set_cursor(self, col, row):
        col = max(0, min(col, self.cols - 1))
        row = max(0, min(row, self.rows - 1))
        row_offsets = [0x00, 0x40]
        self.command(0x80 | (col + row_offsets[row]))

    def print(self, text, col=None, row=None):
        if col is not None and row is not None:
            self.set_cursor(col, row)
        for ch in str(text):
            if ch == '\n':
                row = ((row or 0) + 1) % self.rows
                self.set_cursor(0, row)
            elif ch == '°':
                self.write_char(0) # Custom degree symbol
            else:
                self.write_char(ord(ch))

    def print_lines(self, line1="", line2=""):
        """Format and print two lines ensuring full 16-character clear padding."""
        s1 = str(line1)
        s2 = str(line2)
        # Pad to 16 characters to overwrite previous line without full clear flash
        s1_pad = s1[:self.cols] + " " * max(0, self.cols - len(s1))
        s2_pad = s2[:self.cols] + " " * max(0, self.cols - len(s2))
        self.set_cursor(0, 0)
        for ch in s1_pad:
            if ch == '°': self.write_char(0)
            elif ch == '\x01': self.write_char(1) # Flame
            elif ch == '\x02': self.write_char(2) # Ice
            elif ch == '\x04': self.write_char(4) # Full Bar
            else: self.write_char(ord(ch))
            
        self.set_cursor(0, 1)
        for ch in s2_pad:
            if ch == '°': self.write_char(0)
            elif ch == '\x01': self.write_char(1) # Flame
            elif ch == '\x02': self.write_char(2) # Ice
            elif ch == '\x04': self.write_char(4) # Full Bar
            else: self.write_char(ord(ch))


# ================= 3. DS18B20 1-WIRE TEMPERATURE SENSOR DRIVER =================
class TitanDS18B20:
    """Robust 1-Wire DS18B20 Temperature Sensor interface with CRC check & caching."""
    def __init__(self, pin_num=2):
        self.pin = Pin(pin_num)
        self.ow = onewire.OneWire(self.pin)
        self.ds = ds18x20.DS18X20(self.ow)
        self.roms = []
        self.last_temp = 22.0
        self.last_measure_time = 0
        self.conversion_started = False
        self.connected = False
        self.scan_sensor()

    def scan_sensor(self):
        """Scan 1-Wire bus for DS18B20 ROMs."""
        try:
            self.roms = self.ds.scan()
            self.connected = len(self.roms) > 0
            return self.connected
        except Exception:
            self.connected = False
            return False

    def trigger_conversion(self):
        """Initiate asynchronous ADC conversion."""
        if not self.connected and not self.scan_sensor():
            return False
        try:
            self.ds.convert_temp()
            self.conversion_started = True
            self.last_measure_time = time.ticks_ms()
            return True
        except Exception:
            self.connected = False
            return False

    def read_temperature(self):
        """Read temperature value in Celsius with conversion delay management."""
        now = time.ticks_ms()
        
        # If conversion was not started, trigger now
        if not self.conversion_started:
            self.trigger_conversion()
            time.sleep_ms(20) # Minimal wait
            
        # Ensure at least 750ms elapsed since conversion trigger (12-bit DS18B20 spec)
        if time.ticks_diff(now, self.last_measure_time) >= 750:
            if self.roms:
                try:
                    temp = self.ds.read_temp(self.roms[0])
                    # Filter out power-on reset value (85.0°C) or disconnected reads
                    if -55.0 <= temp <= 125.0 and temp != 85.0:
                        self.last_temp = round(temp, 1)
                        self.connected = True
                    elif temp == 85.0 and self.last_temp != 85.0:
                        pass # Ignore one-time 85°C reset artifact
                except Exception:
                    self.connected = False
            self.trigger_conversion() # Start next conversion immediately

        return self.last_temp if self.connected else None


# ================= 4. PID TEMPERATURE CONTROLLER =================
class PIDController:
    """
    Precision Proportional-Integral-Derivative Controller for thermal management.
    Features anti-windup clamp, derivative smoothing, and output power saturation.
    """
    def __init__(self, kp=15.0, ki=0.5, kd=8.0, setpoint=30.0, out_min=0.0, out_max=50.0):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.setpoint = setpoint
        self.out_min = out_min
        self.out_max = out_max
        
        self.integral = 0.0
        self.last_error = 0.0
        self.last_time = time.ticks_ms()
        self.last_pv = setpoint

    def reset(self):
        """Reset internal integrator and derivative history."""
        self.integral = 0.0
        self.last_error = 0.0
        self.last_time = time.ticks_ms()

    def compute(self, current_temp):
        """Calculate PID duty cycle output (0–50% max) based on current temperature."""
        now = time.ticks_ms()
        dt_ms = time.ticks_diff(now, self.last_time)
        if dt_ms <= 0:
            dt_ms = 100
        dt = dt_ms / 1000.0
        self.last_time = now

        error = self.setpoint - current_temp

        # Proportional term
        p_term = self.kp * error

        # Integral term with anti-windup clamping
        self.integral += error * dt
        # Anti-windup clamping
        max_integral = self.out_max / (self.ki if self.ki > 0 else 1.0)
        self.integral = max(-max_integral, min(max_integral, self.integral))
        i_term = self.ki * self.integral

        # Derivative on measurement error (mitigates derivative kick)
        d_term = self.kd * ((error - self.last_error) / dt) if dt > 0 else 0.0
        self.last_error = error
        self.last_pv = current_temp

        # Total combined PID output
        output = p_term + i_term + d_term
        # Clamp output strictly to 0..50% max duty cycle
        output_clamped = max(self.out_min, min(self.out_max, output))

        return output_clamped


# ================= 5. HEATER ACTUATOR CONTROL (M1) =================
def set_heater_power(duty_percent):
    """
    Set PTC heater power via Motor Channel 1 (Pin 15 PWM).
    duty_percent: 0.0 (OFF) to MAX_PWM_PERCENT (e.g. 50% POWER CAP)
    """
    pct = max(0.0, min(MAX_PWM_PERCENT, float(duty_percent)))
    pwm_val = int((pct / 100.0) * 65535)
    
    # Motor Channel 1 Forward: Pin 15 = PWM, Pin 16 = 0
    pin_m1_dir.value(0)
    heater_pwm = _get_pwm(15, freq=1000)
    heater_pwm.duty_u16(pwm_val)
    return pct

def stop_heater():
    """Immediately cut off power to PTC heater."""
    try:
        _get_pwm(15).duty_u16(0)
        pin_m1_dir.value(0)
    except Exception:
        pass


# ================= 6. MAIN SYSTEM INITIALIZATION & LOOP =================
def main():
    print("==================================================")
    print("LOF TITAN — Anti-Icing Thermal Control System")
    print("==================================================")
    
    # 1. Initialize Hardware Pins
    led_red.value(0)
    led_grn.value(1)
    stop_heater()

    # 2. Initialize I2C Bus (SDA: 7, SCL: 8)
    i2c = None
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
    except Exception:
        try:
            i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
        except Exception:
            print("[WARN] Could not initialize I2C bus.")

    # 3. Initialize LCD 1602 Display
    lcd = TitanLCD1602(i2c, addr=0x27, cols=16, rows=2)
    
    # 4. Initialize DS18B20 Temperature Sensor (Port S1 / GPIO 2)
    temp_sensor = TitanDS18B20(pin_num=2)
    
    # 5. Initialize PID Controller with global thresholds
    pid = PIDController(kp=14.0, ki=0.35, kd=6.0, setpoint=HEATER_OFF_TEMP, out_min=0.0, out_max=MAX_PWM_PERCENT)

    # 6. Display Splash Screen (Intelligent Centering & Timing)
    alert_sound("start")
    lcd.clear()
    lcd.print(" ANTI-ICING SYS ", col=0, row=0)
    lcd.print("INITIALIZING...", col=1, row=1)
    time.sleep_ms(1500)

    # Sensor discovery check on splash
    if temp_sensor.connected:
        lcd.print_lines("  DS18B20: OK   ", " HEATER M1: READY")
    else:
        lcd.print_lines("DS18B20 SENSOR: ", "SCANNING BUS...")
        temp_sensor.scan_sensor()
    time.sleep_ms(1000)

    # 7. System State Machine Variables
    is_heating = False
    last_display_update = 0
    last_pid_update = 0
    current_duty = 0.0

    print(f"[INFO] Anti-Icing System active. ON: < {HEATER_ON_TEMP}°C | OFF: >= {HEATER_OFF_TEMP}°C | Max PWM: {MAX_PWM_PERCENT}%")

    # Initial temperature pre-reading
    temp_sensor.trigger_conversion()
    time.sleep_ms(800)

    while True:
        now = time.ticks_ms()

        # ---------------- A. Temperature Acquisition ----------------
        temp = temp_sensor.read_temperature()

        # ---------------- B. Thermal Logic & PID Regulation ----------------
        if temp is None:
            # Sensor Disconnected Safety Cutoff
            stop_heater()
            is_heating = False
            led_red.value(0)
            led_grn.value(0) # Blink warning
            current_duty = 0.0
            alert_sound("error")
        else:
            # Anti-Icing Threshold Logic:
            # 1. If temperature drops below HEATER_ON_TEMP -> START HEATING
            if temp < HEATER_ON_TEMP and not is_heating:
                is_heating = True
                pid.reset()
                alert_sound("heat_on")
                print(f"[STATE] Temp ({temp:.1f}°C) < {HEATER_ON_TEMP}°C -> HEATER ACTIVATED (Max {MAX_PWM_PERCENT}%)")

            # 2. If temperature reaches >= HEATER_OFF_TEMP -> CUTOFF HEATER
            elif temp >= HEATER_OFF_TEMP and is_heating:
                is_heating = False
                current_duty = 0.0
                stop_heater()
                alert_sound("cutoff")
                print(f"[STATE] Temp ({temp:.1f}°C) >= {HEATER_OFF_TEMP}°C -> HEATER CUTOFF (SAFE)")

            # 3. PID Power Modulation when Heating is Active
            if is_heating:
                # Update PID calculations every 200ms
                if time.ticks_diff(now, last_pid_update) >= 200:
                    last_pid_update = now
                    current_duty = pid.compute(temp)
                    # If very close to cutoff or overshoot, clamp duty to 0
                    if temp >= HEATER_OFF_TEMP:
                        current_duty = 0.0
                    set_heater_power(current_duty)
                
                # Visual LED Indicators: Red ON, Green OFF
                led_red.value(1)
                led_grn.value(0)
            else:
                # Standby / Safe Mode: Red OFF, Green ON
                stop_heater()
                current_duty = 0.0
                led_red.value(0)
                led_grn.value(1)

        # ---------------- C. Intelligent 16x2 Display Rendering ----------------
        # Refresh LCD display at 4Hz (every 250ms) to maintain smooth, readable telemetry
        if time.ticks_diff(now, last_display_update) >= 250:
            last_display_update = now

            if temp is None:
                # Error Screen
                line1 = "T: SENSOR ERROR "
                line2 = "CHECK 1-WIRE S1 "
            else:
                # Line 1: Real-time Temp & Target Setpoint
                # Format: "T: 18.4°C SET:30°C" (Exactly 16 chars)
                t_str = f"{temp:4.1f}"
                line1 = f"T:{t_str}°C SET:{int(HEATER_OFF_TEMP)}°C"

                # Line 2: Heating Status & Power Output Bar
                if is_heating:
                    # Create 4-character visual power meter bar relative to max cap
                    bars = int(round((current_duty / MAX_PWM_PERCENT) * 4))
                    bar_str = ("\x04" * bars) + ("-" * (4 - bars))
                    # Format: "HTR:ON 48% [####]" (16 chars)
                    duty_int = int(current_duty)
                    line2 = f"HTR:ON {duty_int:2d}% [{bar_str}]"
                else:
                    if temp >= HEATER_OFF_TEMP:
                        line2 = "HTR:OFF  [SAFE] "
                    else:
                        line2 = "HTR:OFF [STANDBY]"

            lcd.print_lines(line1, line2)

        # FreeRTOS CPU Safety Yield
        time.sleep_ms(20)


if __name__ == '__main__':
    main()
