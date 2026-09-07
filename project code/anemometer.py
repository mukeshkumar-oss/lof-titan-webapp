# ==============================================================================
# LOF TITAN — High-Precision AS5600 Magnetic Cup Anemometer
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Sensor: AS5600 12-Bit Contactless Magnetic Rotary Encoder (I2C Addr: 0x36)
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C)
#   - Bus: I2C on SDA: GPIO 7, SCL: GPIO 8
#   - Status LEDs: GPIO 47 (Red / Warning), GPIO 48 (Green / Magnet OK)
#   - Buzzer: GPIO 20 (Audio Alerts)
#
# Operation:
#   1. Displays Title Screen for 2.0 Seconds on boot.
#   2. Main Screen displays real-time Wind Speed in m/s with large text.
#   3. Real-time Magnet Detection Status (OK / WEAK / MISSING).
# ==============================================================================

import time
import math
from machine import Pin, PWM, SoftI2C
import framebuf

# ================= 1. HARDWARE PINS & PWM =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

# Status LEDs & Buzzer
led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)

def beep(freq=2200, duration_ms=40):
    """Audible feedback chirp."""
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty(400)
        time.sleep_ms(duration_ms)
        buz.duty(0)
    except Exception: pass


# ================= 2. 1.3" / 0.96" OLED DISPLAY DRIVER =================
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306 displays."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.is_sh1106 = True # Default for 1.3" OLED
        self.init_display()

    def _cmd(self, cmd):
        try:
            self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
        except Exception: pass

    def init_display(self):
        cmds = [
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0x8D, 0x14, 0x20, 0x00, 0xA1, 0xC8, 0xDA, 0x12,
            0x81, 0xCF, 0xD9, 0xF1, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        ]
        for c in cmds: self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color):
        self.fb.fill(color)

    def text(self, string, x, y, col=1):
        self.fb.text(string, x, y, col)

    def line(self, x1, y1, x2, y2, col=1):
        self.fb.line(x1, y1, x2, y2, col)

    def rect(self, x, y, w, h, col=1):
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=1):
        self.fb.fill_rect(x, y, w, h, col)

    def draw_large_text(self, string, x, y, scale=2, col=1):
        """Render integer-scaled high-contrast text to perfectly fit 1.3" display."""
        temp_buf = bytearray(8 * len(string))
        temp_fb = framebuf.FrameBuffer(temp_buf, 8 * len(string), 8, framebuf.MONO_VLSB)
        temp_fb.fill(0)
        temp_fb.text(string, 0, 0, 1)
        for px in range(8 * len(string)):
            for py in range(8):
                if temp_fb.pixel(px, py):
                    self.fb.fill_rect(x + px * scale, y + py * scale, scale, scale, col)

    def show(self):
        try:
            for page in range(self.height // 8):
                self._cmd(0xB0 + page)
                if self.is_sh1106:
                    self._cmd(0x02) # SH1106 2-column offset for 1.3" OLEDs
                    self._cmd(0x10)
                else:
                    self._cmd(0x00)
                    self._cmd(0x10)
                start = page * self.width
                self.i2c.writeto(self.addr, b'\x40' + self.buffer[start:start + self.width])
        except Exception: pass


# ================= 3. AS5600 12-BIT MAGNETIC ENCODER DRIVER =================
class AS5600Encoder:
    """AS5600 12-bit contactless magnetic rotary encoder driver (I2C Addr: 0x36)."""
    ADDR = 0x36
    REG_RAW_ANGLE = 0x0C
    REG_STATUS = 0x0B
    REG_AGC = 0x1A

    def __init__(self, i2c):
        self.i2c = i2c
        self.raw_angle = 0
        self.angle_deg = 0.0
        self.prev_raw = 0
        self.turns = 0
        
        # Magnet Status Flags
        self.magnet_detected = False
        self.magnet_too_weak = False
        self.magnet_too_strong = False
        self.magnet_status_str = "Checking..."
        self.agc = 0
        self.connected = False
        self.init_sensor()

    def _read_reg(self, reg, n=1):
        try:
            return self.i2c.readfrom_mem(self.ADDR, reg, n)
        except Exception:
            return bytearray(n)

    def init_sensor(self):
        try:
            devs = self.i2c.scan()
            if self.ADDR in devs:
                self.connected = True
                self.update()
                self.prev_raw = self.raw_angle
            else:
                self.connected = False
        except Exception:
            self.connected = False

    def update(self):
        # 1. Read 12-Bit Raw Angle (0x0C, 0x0D)
        angle_bytes = self._read_reg(self.REG_RAW_ANGLE, 2)
        if len(angle_bytes) == 2:
            raw = ((angle_bytes[0] & 0x0F) << 8) | angle_bytes[1]
            self.raw_angle = raw
            self.angle_deg = (raw * 360.0) / 4096.0
            
            # Continuous multi-turn unwrapping
            diff = raw - self.prev_raw
            if diff < -2048:
                self.turns += 1
            elif diff > 2048:
                self.turns -= 1
            self.prev_raw = raw
            self.connected = True
        else:
            self.connected = False

        # 2. Read Status (0x0B: Bit 5 MD, Bit 4 ML, Bit 3 MH)
        st_byte = self._read_reg(self.REG_STATUS, 1)
        if len(st_byte) == 1:
            st = st_byte[0]
            self.magnet_detected = bool(st & 0x20)
            self.magnet_too_weak = bool(st & 0x10)
            self.magnet_too_strong = bool(st & 0x08)
            
            if not self.magnet_detected:
                self.magnet_status_str = "NO MAGNET ❌"
            elif self.magnet_too_weak:
                self.magnet_status_str = "MAG WEAK ⚠️"
            elif self.magnet_too_strong:
                self.magnet_status_str = "MAG CLOSE ⚠️"
            else:
                self.magnet_status_str = "MAGNET OK ✅"

        # 3. Read AGC Gain (0x1A: 0-255)
        agc_byte = self._read_reg(self.REG_AGC, 1)
        if len(agc_byte) == 1:
            self.agc = agc_byte[0]

        return self.raw_angle


# ================= 4. HIGH-PRECISION ANEMOMETER SPEED ENGINE =================
class AnemometerEngine:
    """
    High-Precision Velocity & Wind Speed Engine.
    Supports low speeds (0.1 m/s) to high storm speeds (40+ m/s).
    """
    def __init__(self, encoder, cup_radius_m=0.070, cup_factor_k=2.85):
        self.encoder = encoder
        self.radius = cup_radius_m # 70 mm distance from shaft axis to cup center
        self.k_factor = cup_factor_k # Aerodynamic cup ratio calibration factor
        
        self.rpm = 0.0
        self.filtered_rpm = 0.0
        self.wind_speed_ms = 0.0
        self.filtered_speed_ms = 0.0
        
        self.last_update_ms = time.ticks_ms()
        self.last_angle_raw = 0
        self.last_movement_ms = time.ticks_ms()
        self.history_samples = []

    def compute(self):
        now = time.ticks_ms()
        dt_ms = time.ticks_diff(now, self.last_update_ms)
        if dt_ms < 30:
            return self.wind_speed_ms

        self.encoder.update()
        raw = self.encoder.raw_angle
        
        # Circular delta calculation (-2048 to +2047 steps)
        delta_steps = (raw - self.last_angle_raw + 2048) % 4096 - 2048
        
        if abs(delta_steps) > 0:
            self.last_movement_ms = now
            delta_deg = (abs(delta_steps) * 360.0) / 4096.0
            inst_deg_s = delta_deg / (dt_ms / 1000.0)
            inst_rpm = inst_deg_s / 6.0
        else:
            # Gentle zero decay when stationary (> 600ms without motion)
            idle_dt = time.ticks_diff(now, self.last_movement_ms)
            if idle_dt > 600:
                inst_rpm = 0.0
            else:
                inst_rpm = self.rpm * 0.70

        self.last_angle_raw = raw
        self.last_update_ms = now
        
        # Jitter median filter
        self.history_samples.append(inst_rpm)
        if len(self.history_samples) > 5:
            self.history_samples.pop(0)
        sorted_samples = sorted(self.history_samples)
        median_rpm = sorted_samples[len(sorted_samples) // 2]
        
        # Exponential moving average filter
        alpha = 0.32
        self.filtered_rpm = (alpha * median_rpm) + ((1.0 - alpha) * self.filtered_rpm)
        if self.filtered_rpm < 0.2: self.filtered_rpm = 0.0
        self.rpm = round(self.filtered_rpm, 1)
        
        # Aerodynamic Physics: v_cup = (2 * pi * r * RPM) / 60, v_wind = v_cup * k
        circumference = 2.0 * math.pi * self.radius
        cup_linear_speed = (circumference * self.filtered_rpm) / 60.0
        raw_speed = cup_linear_speed * self.k_factor
        
        if self.rpm == 0.0 or raw_speed < 0.10:
            self.wind_speed_ms = 0.0
            self.filtered_speed_ms = 0.0
        else:
            self.filtered_speed_ms = (0.35 * raw_speed) + (0.65 * self.filtered_speed_ms)
            self.wind_speed_ms = round(self.filtered_speed_ms, 2)
            
        return self.wind_speed_ms


# ================= 5. MAIN SYSTEM PROGRAM =================
def main():
    print("==================================================")
    print("LOF TITAN — High-Precision AS5600 Wind Anemometer")
    print("==================================================")

    # Status LEDs
    led_grn.value(1)
    led_red.value(0)
    beep(1800, 60)

    # Initialize I2C Bus on GPIO 7 (SDA) and GPIO 8 (SCL)
    i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)

    # Initialize 1.3" OLED Display
    oled = TitanOLED(i2c, width=128, height=64, addr=0x3C)

    # -------------------------------------------------------------
    # STEP 1: SHOW TITLE SCREEN FOR EXACTLY 2.0 SECONDS
    # -------------------------------------------------------------
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)
    oled.rect(2, 2, 124, 60, 1)
    oled.text("LOF TITAN", 28, 14, 1)
    oled.text("ANEMOMETER", 24, 28, 1)
    oled.text("Wind Station", 20, 42, 1)
    oled.show()
    
    # 2.0 Second Title Pause with dual confirmation chime
    time.sleep_ms(1000)
    beep(2400, 50)
    time.sleep_ms(1000)

    # -------------------------------------------------------------
    # STEP 2: INITIALIZE SENSORS & START MAIN TELEMETRY
    # -------------------------------------------------------------
    encoder = AS5600Encoder(i2c)
    anemometer = AnemometerEngine(encoder, cup_radius_m=0.070, cup_factor_k=2.85)

    last_oled_time = time.ticks_ms()
    last_serial_time = time.ticks_ms()

    while True:
        now = time.ticks_ms()

        # Continuous high-frequency velocity calculation
        speed_ms = anemometer.compute()

        # LED status handling based on magnet presence
        if not encoder.magnet_detected:
            led_grn.value(0)
            led_red.value(1) # Red ON if magnet is missing
        elif encoder.magnet_too_weak or encoder.magnet_too_strong:
            led_grn.value(1)
            led_red.value(1) # Both ON if marginal distance
        else:
            led_red.value(0)
            led_grn.value(1) # Green ON if Magnet is OK

        # ---------------------------------------------------------
        # STEP 3: REFRESH 1.3" OLED DISPLAY (10 FPS / Every 100ms)
        # ---------------------------------------------------------
        if time.ticks_diff(now, last_oled_time) > 100:
            last_oled_time = now
            oled.fill(0)

            # Warning if Magnet is not detected
            if not encoder.magnet_detected:
                oled.fill_rect(0, 0, 128, 14, 1)
                oled.text("! NO MAGNET !", 14, 3, 0)
                oled.text("Attach Magnet", 12, 24, 1)
                oled.text("Above AS5600", 16, 38, 1)
                oled.text("Dist: 1.0-2.5mm", 8, 52, 1)
            else:
                # Top Header: Magnet Detection Status
                oled.text("WIND SPEED", 0, 0, 1)
                if encoder.magnet_too_weak:
                    oled.text("MAG:WEAK", 64, 0, 1)
                elif encoder.magnet_too_strong:
                    oled.text("MAG:CLOSE", 56, 0, 1)
                else:
                    oled.text("MAG:OK", 80, 0, 1)

                oled.line(0, 10, 128, 10, 1)

                # Center: Large High-Contrast Wind Speed in m/s
                speed_text = f"{speed_ms:.1f}"
                # Render 3x scaled digits if short, or 2x scaled
                oled.draw_large_text(speed_text, 4, 16, scale=3, col=1)
                oled.draw_large_text("m/s", 4 + len(speed_text) * 24 + 4, 24, scale=2, col=1)

                # Bottom Section: Dynamic Visual Speed Bar Gauge (0 - 30 m/s)
                oled.line(0, 48, 128, 48, 1)
                oled.text(f"RPM:{anemometer.rpm:.0f}", 0, 53, 1)
                
                # Visual Bar Gauge
                bar_x = 54
                bar_w = 72
                oled.rect(bar_x, 52, bar_w, 9, 1)
                fill_w = int(min(bar_w - 4, max(0, (speed_ms / 25.0) * (bar_w - 4))))
                if fill_w > 0:
                    oled.fill_rect(bar_x + 2, 54, fill_w, 5, 1)

            oled.show()

        # Serial Monitor Diagnostics (Every 500ms)
        if time.ticks_diff(now, last_serial_time) > 500:
            last_serial_time = now
            print(f"[ANEMOMETER] Wind Speed: {speed_ms:.2f} m/s | RPM: {anemometer.rpm:.1f} | Magnet: {encoder.magnet_status_str} (AGC: {encoder.agc})")

        # Crucial CPU yield to keep background FreeRTOS / BLE alive
        time.sleep_ms(5)

if __name__ == '__main__':
    main()
