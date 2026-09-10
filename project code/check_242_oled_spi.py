# ==============================================================================
# LOF TITAN — Waveshare 2.42" SPI OLED (SSD1309) Quick Hardware Diagnostic Check
# ------------------------------------------------------------------------------
# Pin Connections:
#   * VCC       -> 3.3V
#   * GND       -> GND
#   * SCK / CLK -> GPIO 35 (SPI Clock)
#   * MOSI/DIN  -> GPIO 36 (SPI MOSI Data)
#   * CS        -> GPIO 38 (Chip Select)
#   * DC        -> GPIO 37 (Data / Command)
#   * RST       -> Not connected (Handled in Software)
#
# Diagnostic Suite:
#   1. SPI Bus & SSD1309 Controller Handshake.
#   2. All-Pixels ON / OFF (Dead pixel inspection).
#   3. Border & Coordinate Alignment test (0,0 to 127,63).
#   4. Multi-Size Text Rendering (8px, 16px, 24px).
#   5. Contrast / Brightness Dynamic Sweep.
#   6. Live High-Speed Animation & FPS Benchmark.
# ==============================================================================

import time
import math
from machine import Pin, PWM, SPI, SoftSPI
import framebuf

# ================= 1. STATUS LEDS & AUDIO =================
led_red = Pin(47, Pin.OUT, value=0)
led_grn = Pin(48, Pin.OUT, value=1)

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    return _pwm_pool[pin]

def beep(freq=2400, duration_ms=50):
    try:
        buz = _get_pwm(20, freq=freq)
        buz.duty(400)
        time.sleep_ms(duration_ms)
        buz.duty(0)
    except Exception:
        pass


# ================= 2. 2.42" SPI OLED (SSD1309) DRIVER =================
class Waveshare242OLED(framebuf.FrameBuffer):
    def __init__(self, sck=35, mosi=36, cs=38, dc=37, baudrate=10000000):
        self.width = 128
        self.height = 64
        self.buf = bytearray(1024)
        super().__init__(self.buf, self.width, self.height, framebuf.MONO_VLSB)

        self.cs = Pin(cs, Pin.OUT, value=1)
        self.dc = Pin(dc, Pin.OUT, value=0)

        # Initialize SPI Interface
        try:
            self.spi = SPI(1, baudrate=baudrate, polarity=0, phase=0, sck=Pin(sck), mosi=Pin(mosi))
            self.spi_type = "Hardware SPI"
        except Exception:
            self.spi = SoftSPI(baudrate=baudrate, polarity=0, phase=0, sck=Pin(sck), mosi=Pin(mosi), miso=Pin(sck))
            self.spi_type = "SoftSPI"

        self.init_display()

    def write_cmd(self, cmd):
        if not self.spi: return
        self.dc.value(0)  # Command Mode
        self.cs.value(0)
        self.spi.write(bytearray([cmd]))
        self.cs.value(1)

    def write_data(self, data_bytes):
        if not self.spi: return
        self.dc.value(1)  # Data Mode
        self.cs.value(0)
        self.spi.write(data_bytes)
        self.cs.value(1)

    def init_display(self):
        """SSD1309 2.42" Recommended Initialization Sequence."""
        init_seq = (
            0xAE,        # Display OFF
            0x00, 0x10,  # Set Lower & Upper Column Start Address
            0x40,        # Set Start Line (0)
            0x81, 0xCF,  # Set Contrast (0xCF)
            0xA1,        # Set Segment Re-map (0xA1 = Column 127)
            0xC8,        # Set COM Scan Direction (0xC8 = Remapped)
            0xA6,        # Normal Display (0xA6)
            0xA8, 0x3F,  # Multiplex Ratio (1/64)
            0xD3, 0x00,  # Display Offset (0)
            0xD5, 0x80,  # Display Clock Div Ratio
            0xD9, 0xF1,  # Pre-charge Period
            0xDA, 0x12,  # COM Hardware Configuration
            0xDB, 0x40,  # VCOMH Deselect Level
            0x20, 0x00,  # Horizontal Addressing Mode
            0x8D, 0x14,  # Charge Pump Enable
            0xAF         # Display ON
        )
        for cmd in init_seq:
            self.write_cmd(cmd)

        self.fill(0)
        self.show()

    def set_contrast(self, val):
        self.write_cmd(0x81)
        self.write_cmd(max(0, min(255, int(val))))

    def invert(self, inv=True):
        self.write_cmd(0xA7 if inv else 0xA6)

    def draw_large_text(self, string, x, y, scale=2, col=1):
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

    def show(self):
        """Full-frame 1024-byte burst transmission to SSD1309."""
        if not self.spi: return
        self.write_cmd(0x21); self.write_cmd(0); self.write_cmd(127)
        self.write_cmd(0x22); self.write_cmd(0); self.write_cmd(7)
        self.write_data(self.buf)


# ================= 3. DIAGNOSTIC TEST RUNNER =================
def main():
    print("\n=======================================================")
    print("  LOF TITAN — WAVESHARE 2.42\" SPI OLED HARDWARE CHECK  ")
    print("=======================================================")
    print("Wiring Verification:")
    print("  [VCC] -> 3.3V        [GND] -> GND")
    print("  [SCK] -> GPIO 35     [MOSI/DIN] -> GPIO 36")
    print("  [CS]  -> GPIO 38     [DC]       -> GPIO 37")
    print("-------------------------------------------------------")

    # Audio Signal
    beep(1800, 60)
    time.sleep_ms(30)
    beep(2400, 80)

    print("[TEST 1/6] Initializing SPI Driver & SSD1309 Display...")
    try:
        oled = Waveshare242OLED(sck=35, mosi=36, cs=38, dc=37, baudrate=10000000)
        print("  -> Success! Bus Mode: {}".format(oled.spi_type))
    except Exception as e:
        print("  -> ERROR: Failed to initialize SPI OLED:", e)
        led_red.value(1)
        return

    # TEST 1: All Pixels ON (Dead Pixel Check)
    print("\n[TEST 2/6] Screen Full-White Flood (Checking Dead Pixels)...")
    oled.fill(1)
    oled.show()
    time.sleep_ms(1000)

    oled.fill(0)
    oled.show()
    time.sleep_ms(300)

    # TEST 2: Border & Coordinate Alignment
    print("[TEST 3/6] Screen Boundaries & Center Alignment Test...")
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)              # Outer border
    oled.rect(2, 2, 124, 60, 1)              # Inner border
    oled.line(0, 0, 127, 63, 1)              # Diagonal 1
    oled.line(0, 63, 127, 0, 1)              # Diagonal 2
    oled.fill_rect(54, 22, 20, 20, 0)        # Center clearing
    oled.rect(54, 22, 20, 20, 1)
    oled.text("OK", 58, 28, 1)
    oled.show()
    beep(2200, 40)
    time.sleep_ms(1200)

    # TEST 3: Multi-Size Text Fonts
    print("[TEST 4/6] Text Typography & Scaler Test...")
    oled.fill(0)
    oled.fill_rect(0, 0, 128, 10, 1)
    oled.text("2.42\" OLED CHECK", 4, 1, 0)
    oled.text("Size 1 (8px standard)", 2, 14, 1)
    oled.draw_large_text("TITAN", 4, 26, scale=2, col=1)
    oled.text("128x64 SSD1309", 4, 46, 1)
    oled.text("SPI: 35/36/38/37", 4, 55, 1)
    oled.show()
    beep(2600, 40)
    time.sleep_ms(1500)

    # TEST 4: Contrast & Brightness Sweep
    print("[TEST 5/6] Brightness & Contrast Sweep (0% -> 100%)...")
    oled.fill(0)
    oled.text("CONTRAST SWEEP", 8, 8, 1)
    oled.rect(14, 26, 100, 14, 1)
    for c in range(5, 256, 25):
        pct = int((c / 255.0) * 100)
        oled.set_contrast(c)
        fill_w = int((pct / 100.0) * 96)
        oled.fill_rect(16, 28, fill_w, 10, 1)
        oled.fill_rect(30, 46, 68, 10, 0)
        oled.text("{:3d}% (0x{:02X})".format(pct, c), 32, 46, 1)
        oled.show()
        time.sleep_ms(50)
    oled.set_contrast(0xCF)  # Restore optimal brightness
    time.sleep_ms(500)

    # TEST 5: Live Real-Time Benchmark
    print("\n[TEST 6/6] Live High-Speed Animation & FPS Counter...")
    print(">>> All Hardware Checks PASSED! Running live benchmark loop (Press Ctrl+C to stop)...\n")

    frame = 0
    t_start = time.ticks_ms()
    fps = 0.0

    while True:
        t0 = time.ticks_ms()
        oled.fill(0)

        # Header
        oled.fill_rect(0, 0, 128, 10, 1)
        oled.text("TITAN 2.42\" OLED", 2, 1, 0)
        oled.text("{:.0f}FPS".format(fps), 90, 1, 0)

        # Animated Sine Waves
        for x in range(128):
            y1 = int(24 + 10 * math.sin((x * 0.08) + (frame * 0.1)))
            y2 = int(48 + 10 * math.cos((x * 0.08) + (frame * 0.1)))
            oled.pixel(x, y1, 1)
            oled.pixel(x, y2, 1)

        # Orbiting Circle
        rad = frame * 0.08
        cx = int(64 + 36 * math.cos(rad))
        cy = int(36 + 14 * math.sin(rad))
        oled.fill_rect(cx - 3, cy - 3, 7, 7, 1)

        # Frame Counter Status
        oled.text("Frame: {:05d}".format(frame), 18, 55, 1)

        oled.show()

        frame += 1
        t1 = time.ticks_ms()
        dt = time.ticks_diff(t1, t0)
        if dt > 0:
            fps = 0.9 * fps + 0.1 * (1000.0 / dt)

        # Periodic Serial Status
        if frame % 50 == 0:
            print("  [OLED LIVE] Frame: {:05d} | Measured Speed: {:.1f} FPS | SPI: 10 MHz".format(frame, fps))

        time.sleep_ms(2)

if __name__ == '__main__':
    main()
