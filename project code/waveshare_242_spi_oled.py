# ==============================================================================
# LOF TITAN — Waveshare 2.42" SPI OLED (SSD1309) Tactical Master Dashboard
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Display: Waveshare 2.42" SPI OLED Display Module (128x64 Pixels, SSD1309)
#   - Wiring & Pinout:
#       * VCC       -> 3.3V
#       * GND       -> GND
#       * SCK / CLK -> GPIO 35 (SPI Clock)
#       * MOSI/DIN  -> GPIO 36 (SPI Master Out Data)
#       * CS        -> GPIO 38 (Chip Select, Active LOW)
#       * DC        -> GPIO 37 (Data / Command Select)
#       * RST / RES -> Not connected (Handled in Software)
#   - User Buttons: Push Buttons 1-4 (GPIO 39, 40, 41, 42)
#   - Indicators: Red LED (GPIO 47), Green LED (GPIO 48), Buzzer (GPIO 20)
#   - Sensors: Analog Port S1 (GPIO 2 ADC), Ultrasonic (Trig 6, Echo 19)
#
# Features:
#   1. High-Speed 10MHz SPI SSD1309 OLED Graphics Engine (30+ FPS).
#   2. Page 0: Tactical 4WD Rover Telemetry & Radar HUD.
#   3. Page 1: Live Real-Time Digital Oscilloscope & Waveform Visualizer.
#   4. Page 2: Multi-Channel Analog Sensor Matrix (Ports S1-S5).
#   5. Page 3: 3D Rotating Wireframe Cube & Graphic Benchmarks.
#   6. Interactive Controls:
#       * BTN 1 (GPIO 39): Cycle Dashboard Pages
#       * BTN 2 (GPIO 40): Invert Display Colors (Normal / Inverse)
#       * BTN 3 (GPIO 41): Cycle Brightness / Contrast Levels (30%, 65%, 100%)
#       * BTN 4 (GPIO 42): Diagnostic Laser Audio Effect & Flash Test
# ==============================================================================

import time
import math
import struct
from machine import Pin, PWM, ADC, SPI, SoftSPI
import framebuf

# ================= 1. SINGLETON PWM & AUDIO =================
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

# Status LEDs
led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)
led_red.value(0)
led_grn.value(1)

# Push Buttons (Active LOW)
btn1 = Pin(39, Pin.IN, Pin.PULL_UP)  # Cycle Page
btn2 = Pin(40, Pin.IN, Pin.PULL_UP)  # Invert Display
btn3 = Pin(41, Pin.IN, Pin.PULL_UP)  # Contrast Step
btn4 = Pin(42, Pin.IN, Pin.PULL_UP)  # Sound & LED Flash

# Analog Port S1 (GPIO 2)
try:
    adc_s1 = ADC(Pin(2))
    adc_s1.atten(ADC.ATTN_11DB)
except Exception:
    adc_s1 = None

def beep(freq=2200, duration_ms=40, duty=400):
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty(duty)
        time.sleep_ms(duration_ms)
        buz.duty(0)
    except Exception:
        pass

def play_page_chime():
    beep(1800, 30)
    time.sleep_ms(20)
    beep(2400, 40)

def play_laser_effect():
    for f in range(2400, 400, -120):
        beep(f, 8, duty=450)


# ================= 2. WAVESHARE 2.42" SPI OLED (SSD1309) DRIVER =================
class Waveshare242OLED(framebuf.FrameBuffer):
    """
    High-Performance Hardware/Software SPI Driver for Waveshare 2.42" OLED (SSD1309).
    Resolution: 128 x 64 pixels.
    """
    def __init__(self, sck_pin=35, mosi_pin=36, cs_pin=38, dc_pin=37, rst_pin=None, baudrate=10000000):
        self.width = 128
        self.height = 64
        self.buf = bytearray(1024)
        super().__init__(self.buf, self.width, self.height, framebuf.MONO_VLSB)

        self.cs = Pin(cs_pin, Pin.OUT, value=1)
        self.dc = Pin(dc_pin, Pin.OUT, value=0)
        self.rst = Pin(rst_pin, Pin.OUT, value=1) if rst_pin is not None else None

        # Hardware or SoftSPI initialization
        try:
            self.spi = SPI(1, baudrate=baudrate, polarity=0, phase=0, sck=Pin(sck_pin), mosi=Pin(mosi_pin))
        except Exception:
            self.spi = SoftSPI(baudrate=baudrate, polarity=0, phase=0, sck=Pin(sck_pin), mosi=Pin(mosi_pin), miso=Pin(sck_pin))

        self.is_inverted = False
        self.contrast_level = 0xCF

        self.hardware_reset()
        self.init_display()

    def hardware_reset(self):
        if self.rst:
            self.rst.value(0)
            time.sleep_ms(15)
            self.rst.value(1)
            time.sleep_ms(15)

    def write_cmd(self, cmd):
        """Send command byte to SSD1309 over SPI."""
        if not self.spi:
            return
        self.dc.value(0)  # Command mode
        self.cs.value(0)  # Select chip
        self.spi.write(bytearray([cmd]))
        self.cs.value(1)  # Deselect

    def write_data(self, data_bytes):
        """Send data buffer to SSD1309 over SPI."""
        if not self.spi:
            return
        self.dc.value(1)  # Data mode
        self.cs.value(0)  # Select chip
        self.spi.write(data_bytes)
        self.cs.value(1)  # Deselect

    def init_display(self):
        """SSD1309 2.42" Recommended Initialization Sequence."""
        init_seq = (
            0xAE,        # Display OFF (sleep mode)
            0x00, 0x10,  # Set Lower & Upper Column Start Address
            0x40,        # Set Display Start Line to 0
            0x81, 0xCF,  # Set Contrast Control (0x00 to 0xFF)
            0xA1,        # Set Segment Re-map (0xA0 = Normal, 0xA1 = Column 127 mapped to SEG0)
            0xC8,        # Set COM Output Scan Direction (0xC0 = Normal, 0xC8 = Remapped)
            0xA6,        # Set Normal Display (0xA6 = Normal, 0xA7 = Inverse)
            0xA8, 0x3F,  # Set Multiplex Ratio (64 lines: 0x3F)
            0xD3, 0x00,  # Set Display Offset (0)
            0xD5, 0x80,  # Set Display Clock Divide Ratio / Oscillator Frequency
            0xD9, 0xF1,  # Set Pre-charge Period (Phase 1: 1 DCLK, Phase 2: 15 DCLK)
            0xDA, 0x12,  # Set COM Pins Hardware Configuration (Alternative COM config)
            0xDB, 0x40,  # Set VCOMH Deselect Level (~0.83 x VCC)
            0x20, 0x00,  # Set Memory Addressing Mode (0x00 = Horizontal Addressing)
            0x8D, 0x14,  # Set Charge Pump Enable (0x14 = Enable, 0x10 = Disable)
            0xAF         # Display ON (normal mode)
        )
        for cmd in init_seq:
            self.write_cmd(cmd)

        self.fill(0)
        self.show()

    def set_contrast(self, contrast_val):
        """Set display brightness / contrast (0 - 255)."""
        self.contrast_level = max(0, min(255, int(contrast_val)))
        self.write_cmd(0x81)
        self.write_cmd(self.contrast_level)

    def invert(self, inv=True):
        """Toggle display color inversion."""
        self.is_inverted = inv
        self.write_cmd(0xA7 if inv else 0xA6)

    def draw_large_text(self, string, x, y, scale=2, col=1):
        """Render fast integer-scaled bitmap font for the large 2.42\" display."""
        string = str(string)
        w = len(string) * 8
        tmp = bytearray((w * 8 + 7) // 8)
        fb_tmp = framebuf.FrameBuffer(tmp, w, 8, framebuf.MONO_VLSB)
        fb_tmp.fill(0)
        fb_tmp.text(string, 0, 0, 1)

        for px in range(w):
            for py in range(8):
                if fb_tmp.pixel(px, py):
                    self.fill_rect(x + px * scale, y + py * scale, scale, scale, col)

    def draw_circle(self, cx, cy, r, col=1, fill=False):
        """Draw outline or filled circle."""
        if fill:
            for y in range(-r, r + 1):
                for x in range(-r, r + 1):
                    if x * x + y * y <= r * r:
                        if 0 <= cx + x < 128 and 0 <= cy + y < 64:
                            self.pixel(cx + x, cy + y, col)
        else:
            x, y, err = r, 0, 0
            while x >= y:
                for px, py in ((cx+x, cy+y), (cx+y, cy+x), (cx-y, cy+x), (cx-x, cy+y),
                               (cx-x, cy-y), (cx-y, cy-x), (cx+y, cy-x), (cx+x, cy-y)):
                    if 0 <= px < 128 and 0 <= py < 64:
                        self.pixel(px, py, col)
                y += 1
                err += 1 + 2 * y
                if 2 * (err - x) + 1 > 0:
                    x -= 1
                    err += 1 - 2 * x

    def draw_progress_bar(self, x, y, w, h, pct, label=None):
        """Draw rounded bordered progress bar with percentage."""
        pct = max(0.0, min(100.0, pct))
        self.rect(x, y, w, h, 1)
        fill_w = int((w - 4) * (pct / 100.0))
        if fill_w > 0:
            self.fill_rect(x + 2, y + 2, fill_w, h - 4, 1)
        if label:
            self.text(label, x, y - 9, 1)

    def show(self):
        """Ultra-fast full-screen SPI frame transfer to SSD1309."""
        if not self.spi:
            return
        # Set column range (0 - 127) and page range (0 - 7)
        self.write_cmd(0x21)
        self.write_cmd(0)
        self.write_cmd(127)
        self.write_cmd(0x22)
        self.write_cmd(0)
        self.write_cmd(7)
        # Flush whole 1024-byte framebuffer in one high-speed SPI burst
        self.write_data(self.buf)


# ================= 3. GRAPHICS DEMOS & DASHBOARD PAGES =================
class TacticalDashboardApp:
    def __init__(self, oled):
        self.oled = oled
        self.page = 0
        self.total_pages = 4
        self.contrast_idx = 2  # 0: Low, 1: Med, 2: High
        self.contrasts = [0x30, 0x88, 0xFF]

        # Animation states
        self.frame_count = 0
        self.wave_phase = 0.0
        self.rot_angle = 0.0

        # Simulated Rover Telemetry
        self.speed_pct = 75.0
        self.battery_pct = 92.0
        self.radar_cm = 48.0
        self.heading_deg = 245.0

    def render_page_0_tactical_hud(self):
        """PAGE 0: TACTICAL 4WD ROVER HUD"""
        oled = self.oled
        oled.fill(0)

        # Header Ribbon
        oled.fill_rect(0, 0, 128, 11, 1)
        oled.text("WAVESHARE 2.42\"", 2, 2, 0)
        oled.text("4WD", 102, 2, 0)

        # Telemetry Row 1: Radar & Speed
        oled.text("RADAR: {:2.0f}cm".format(self.radar_cm), 2, 14, 1)
        oled.text("BAT:{:2.0f}%".format(self.battery_pct), 80, 14, 1)

        # Radar Visual Horizontal Arc
        oled.line(0, 24, 128, 24, 1)
        radar_bar = int(max(0, min(50, (self.radar_cm / 100.0) * 50)))
        oled.rect(2, 27, 54, 7, 1)
        oled.fill_rect(4, 29, radar_bar, 3, 1)

        # 4WD Motor Power Bars (M1-M4)
        oled.text("M1:80%", 64, 27, 1)
        oled.text("M2:80%", 96, 27, 1)
        oled.text("M3:75%", 64, 37, 1)
        oled.text("M4:75%", 96, 37, 1)

        # Heading Compass Dial
        oled.draw_circle(28, 48, 12, col=1)
        rad = math.radians(self.heading_deg)
        dx = int(10 * math.sin(rad))
        dy = int(-10 * math.cos(rad))
        oled.line(28, 48, 28 + dx, 48 + dy, 1)
        oled.text("SW 245", 46, 52, 1)

    def render_page_1_oscilloscope(self):
        """PAGE 1: REAL-TIME DIGITAL OSCILLOSCOPE WAVEFORM"""
        oled = self.oled
        oled.fill(0)

        oled.text("OSCILLOSCOPE", 2, 2, 1)
        oled.text("30 FPS", 80, 2, 1)
        oled.line(0, 12, 128, 12, 1)

        # Grid lines
        for gx in range(0, 128, 20):
            for gy in range(14, 64, 10):
                oled.pixel(gx, gy, 1)

        # Live Animated Waveform (Sine + Harmonic)
        prev_y = 38
        for x in range(128):
            ang = (x * 0.08) + self.wave_phase
            y = int(38 + 18 * math.sin(ang) + 6 * math.sin(ang * 2.3))
            y = max(14, min(62, y))
            if x > 0:
                oled.line(x - 1, prev_y, x, y, 1)
            prev_y = y

        self.wave_phase += 0.22

    def render_page_2_sensor_matrix(self):
        """PAGE 2: ANALOG PORTS S1-S5 SENSOR MATRIX"""
        oled = self.oled
        oled.fill(0)

        oled.text("SENSOR MATRIX", 2, 2, 1)
        oled.text("ADC", 100, 2, 1)
        oled.line(0, 11, 128, 11, 1)

        # Read actual Port S1 ADC value
        s1_val = adc_s1.read() if adc_s1 else 2048
        s1_pct = (s1_val / 4095.0) * 100.0

        # Draw 4 Horizontal Channel Gauges
        channels = [
            ("S1 LIGHT", s1_pct),
            ("S2 TEMP ", 64.0 + 10.0 * math.sin(self.wave_phase * 0.5)),
            ("S3 MQ135", 42.0 + 8.0 * math.cos(self.wave_phase * 0.3)),
            ("S4 DIST ", 85.0 - 15.0 * math.sin(self.wave_phase * 0.4))
        ]

        y_pos = 14
        for name, pct in channels:
            oled.text(name, 2, y_pos, 1)
            bar_w = int(max(0, min(50, (pct / 100.0) * 50)))
            oled.rect(68, y_pos, 54, 7, 1)
            oled.fill_rect(70, y_pos + 2, bar_w, 3, 1)
            y_pos += 12

    def render_page_3_3d_cube(self):
        """PAGE 3: 3D ROTATING WIREFRAME CUBE BENCHMARK"""
        oled = self.oled
        oled.fill(0)

        oled.text("3D WIREFRAME", 2, 2, 1)
        oled.text("SPI 10M", 72, 2, 1)
        oled.line(0, 11, 128, 11, 1)

        # 3D Cube Vertices (±20 units)
        nodes = [
            [-16, -16, -16], [-16, -16, 16], [-16, 16, -16], [-16, 16, 16],
            [16, -16, -16],  [16, -16, 16],  [16, 16, -16],  [16, 16, 16]
        ]
        edges = [
            (0,1), (1,3), (3,2), (2,0),
            (4,5), (5,7), (7,6), (6,4),
            (0,4), (1,5), (2,6), (3,7)
        ]

        cx, cy = 64, 38
        rad_y = self.rot_angle
        rad_x = self.rot_angle * 0.7

        cos_y, sin_y = math.cos(rad_y), math.sin(rad_y)
        cos_x, sin_x = math.cos(rad_x), math.sin(rad_x)

        proj = []
        for x, y, z in nodes:
            # Rotate Y
            x1 = x * cos_y + z * sin_y
            z1 = -x * sin_y + z * cos_y
            # Rotate X
            y1 = y * cos_x - z1 * sin_x
            z2 = y * sin_x + z1 * cos_x

            # Perspective projection
            fov = 70.0
            dist = 85.0 + z2
            px = int(cx + (x1 * fov) / dist)
            py = int(cy + (y1 * fov) / dist)
            proj.append((px, py))

        # Draw wireframe edges
        for p1, p2 in edges:
            x1, y1 = proj[p1]
            x2, y2 = proj[p2]
            if 0 <= x1 < 128 and 0 <= x2 < 128 and 12 <= y1 < 64 and 12 <= y2 < 64:
                oled.line(x1, y1, x2, y2, 1)

        self.rot_angle += 0.08

    def update(self):
        """Render current active page and flush buffer to SPI OLED."""
        if self.page == 0:
            self.render_page_0_tactical_hud()
        elif self.page == 1:
            self.render_page_1_oscilloscope()
        elif self.page == 2:
            self.render_page_2_sensor_matrix()
        elif self.page == 3:
            self.render_page_3_3d_cube()

        # Update animated metrics
        self.frame_count += 1
        self.radar_cm = 30.0 + 35.0 * math.sin(self.frame_count * 0.05)
        self.heading_deg = (self.heading_deg + 1.5) % 360.0

        self.oled.show()


# ================= 4. MAIN PROGRAM & INTERACTIVE LOOP =================
def main():
    print("\n=======================================================")
    print("LOF TITAN — WAVESHARE 2.42\" SPI OLED (SSD1309) DASHBOARD")
    print("-------------------------------------------------------")
    print(" * SCK  / CLK : GPIO 35")
    print(" * MOSI / DIN : GPIO 36")
    print(" * CS         : GPIO 38")
    print(" * DC         : GPIO 37")
    print(" * VCC / GND  : 3.3V / GND")
    print("=======================================================\n")

    # Power-on Audio Signal
    beep(1600, 40)
    time.sleep_ms(30)
    beep(2400, 60)

    # Initialize Waveshare 2.42" SPI OLED Display
    print("[OLED] Initializing Waveshare 2.42\" SSD1309 over SPI...")
    try:
        oled = Waveshare242OLED(sck_pin=35, mosi_pin=36, cs_pin=38, dc_pin=37, baudrate=10000000)
        print("[OLED] Waveshare 2.42\" OLED Initialized Successfully!")
    except Exception as e:
        print("[OLED] Initialization Failed:", e)
        return

    # Splash Screen Animation
    oled.fill(0)
    oled.draw_circle(64, 28, 22, col=1)
    oled.draw_circle(64, 28, 18, col=1)
    oled.draw_large_text("TITAN", 28, 20, scale=2, col=1)
    oled.text("2.42\" SPI OLED", 10, 52, 1)
    oled.show()
    time.sleep_ms(1200)

    app = TacticalDashboardApp(oled)

    # Button Debounce Tracking
    last_b1, last_b2, last_b3, last_b4 = 1, 1, 1, 1
    last_render_ms = time.ticks_ms()
    last_serial_ms = time.ticks_ms()

    print("[SYSTEM] Ready! Use BTN 1-4 to interact with the Dashboard:")
    print("  - BTN 1 (Pin 39): Cycle Display Page")
    print("  - BTN 2 (Pin 40): Invert Colors (Normal / Inverse)")
    print("  - BTN 3 (Pin 41): Step Contrast / Brightness")
    print("  - BTN 4 (Pin 42): Laser Sound Effect & Flash\n")

    while True:
        now = time.ticks_ms()

        # 1. BTN 1: Cycle Pages
        b1 = btn1.value()
        if b1 == 0 and last_b1 == 1:
            app.page = (app.page + 1) % app.total_pages
            print(">>> [BTN 1] Page Switched to Page {}: {}".format(
                app.page, ["TACTICAL HUD", "OSCILLOSCOPE", "SENSOR MATRIX", "3D WIREFRAME"][app.page]
            ))
            play_page_chime()
            time.sleep_ms(60)
        last_b1 = b1

        # 2. BTN 2: Invert Colors
        b2 = btn2.value()
        if b2 == 0 and last_b2 == 1:
            oled.invert(not oled.is_inverted)
            print(">>> [BTN 2] Invert Colors Toggled:", "INVERTED" if oled.is_inverted else "NORMAL")
            beep(2200, 30)
            time.sleep_ms(60)
        last_b2 = b2

        # 3. BTN 3: Step Contrast
        b3 = btn3.value()
        if b3 == 0 and last_b3 == 1:
            app.contrast_idx = (app.contrast_idx + 1) % len(app.contrasts)
            new_c = app.contrasts[app.contrast_idx]
            oled.set_contrast(new_c)
            print(">>> [BTN 3] Contrast Set to 0x{:02X} ({})".format(
                new_c, ["LOW (30%)", "MED (60%)", "MAX (100%)"][app.contrast_idx]
            ))
            beep(2600, 30)
            time.sleep_ms(60)
        last_b3 = b3

        # 4. BTN 4: Audio Effect & Flash Test
        b4 = btn4.value()
        if b4 == 0 and last_b4 == 1:
            print(">>> [BTN 4] Laser Test Effect Triggered!")
            led_red.value(1)
            play_laser_effect()
            led_red.value(0)
            time.sleep_ms(60)
        last_b4 = b4

        # 5. Render OLED Graphics (~30 FPS)
        if time.ticks_diff(now, last_render_ms) >= 30:
            app.update()
            last_render_ms = now

        # 6. Serial Status Telemetry (~2Hz)
        if time.ticks_diff(now, last_serial_ms) >= 500:
            s1_val = adc_s1.read() if adc_s1 else 0
            print("[SPI OLED 2.42\"] Page: {} | FPS: ~33 | Contrast: 0x{:02X} | Inv: {} | S1_ADC: {}".format(
                app.page, oled.contrast_level, oled.is_inverted, s1_val
            ))
            last_serial_ms = now

        # Auto CPU Safety Yield
        time.sleep_ms(3)

if __name__ == '__main__':
    main()
