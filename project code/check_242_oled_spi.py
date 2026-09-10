# ==============================================================================
# LOF TITAN — Waveshare 2.42" SPI OLED (SSD1309) U8g2-Grade Diagnostic Driver
# ------------------------------------------------------------------------------
# Pin Connections (PCB SPI Header):
#   * VCC       -> 3.3V (or 5V)
#   * GND       -> GND
#   * CLK / SCK -> GPIO 35
#   * MOSI / DIN-> GPIO 36
#   * CS        -> GPIO 38
#   * DC / MISO -> GPIO 37
#   * RST / RES -> IMPORTANT: If your OLED module has an RST pin, connect it to 3.3V
#                  (or GPIO). If left floating LOW, the SSD1309 will remain OFF!
# ==============================================================================

import time
import math
from machine import Pin, PWM, SoftSPI, SPI
import framebuf

# ================= 1. BUZZER & LED SIGNALS =================
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


# ================= 2. U8G2-COMPATIBLE SSD1309 SPI DRIVER =================
class U8g2_SSD1309_SPI(framebuf.FrameBuffer):
    """
    Exact U8g2 initialization sequence for SSD1309 Waveshare 2.42" OLED.
    Includes Command Lock (0xFD 0x12) & Page-by-Page Refresh.
    """
    def __init__(self, sck=35, mosi=36, cs=38, dc=37, rst=None, use_soft_spi=True):
        self.width = 128
        self.height = 64
        self.buf = bytearray(1024)
        super().__init__(self.buf, self.width, self.height, framebuf.MONO_VLSB)

        self.cs = Pin(cs, Pin.OUT, value=1)
        self.dc = Pin(dc, Pin.OUT, value=0)
        self.rst = Pin(rst, Pin.OUT, value=1) if rst is not None else None

        # Hardware Reset if RST pin is assigned
        if self.rst:
            self.rst.value(0)
            time.sleep_ms(20)
            self.rst.value(1)
            time.sleep_ms(50)

        # SPI Bus initialization (5MHz Mode 0 MSB first for maximum reliability)
        if use_soft_spi:
            self.spi = SoftSPI(baudrate=5000000, polarity=0, phase=0, sck=Pin(sck), mosi=Pin(mosi), miso=Pin(sck))
            self.bus_type = "SoftSPI (Bit-Bang 5MHz)"
        else:
            try:
                self.spi = SPI(1, baudrate=8000000, polarity=0, phase=0, sck=Pin(sck), mosi=Pin(mosi))
                self.bus_type = "Hardware SPI (8MHz)"
            except Exception:
                self.spi = SoftSPI(baudrate=5000000, polarity=0, phase=0, sck=Pin(sck), mosi=Pin(mosi), miso=Pin(sck))
                self.bus_type = "SoftSPI Fallback (5MHz)"

        self.init_display()

    def write_cmd(self, cmd):
        """Write single command byte with CS active LOW."""
        self.dc.value(0)  # DC = 0 for Command
        self.cs.value(0)
        self.spi.write(bytearray([cmd]))
        self.cs.value(1)

    def write_data(self, data_bytes):
        """Write buffer with CS active LOW."""
        self.dc.value(1)  # DC = 1 for Data
        self.cs.value(0)
        self.spi.write(data_bytes)
        self.cs.value(1)

    def init_display(self):
        """
        Official U8g2 SSD1309 128x64 Initialization Sequence.
        Reference: u8g2_d_ssd1309_128x64_noname0.c
        """
        # 1. Unlock Command Input (ESSENTIAL FOR SSD1309!)
        self.write_cmd(0xFD)  # Set Command Lock
        self.write_cmd(0x12)  # Unlock OLED Driver IC

        # 2. Display OFF
        self.write_cmd(0xAE)

        # 3. Set Display Clock Divide Ratio & Oscillator Frequency
        self.write_cmd(0xD5)
        self.write_cmd(0xA0)  # High frequency for flicker-free display

        # 4. Set Multiplex Ratio (64 lines: 0x3F)
        self.write_cmd(0xA8)
        self.write_cmd(0x3F)

        # 5. Set Display Offset (0)
        self.write_cmd(0xD3)
        self.write_cmd(0x00)

        # 6. Set Display Start Line (0)
        self.write_cmd(0x40)

        # 7. Set Segment Re-map (0xA1: Column 127 mapped to SEG0)
        self.write_cmd(0xA1)

        # 8. Set COM Output Scan Direction (0xC8: Remapped mode)
        self.write_cmd(0xC8)

        # 9. Set COM Pins Hardware Configuration
        self.write_cmd(0xDA)
        self.write_cmd(0x12)

        # 10. Set Contrast Control (0xDF = bright)
        self.write_cmd(0x81)
        self.write_cmd(0xDF)

        # 11. Set Pre-charge Period (Phase 1: 2 DCLKs, Phase 2: 8 DCLKs)
        self.write_cmd(0xD9)
        self.write_cmd(0x82)

        # 12. Set VCOMH Deselect Level (~0.83 x VCC)
        self.write_cmd(0xDB)
        self.write_cmd(0x34)

        # 13. Set Entire Display ON (Resume from RAM content)
        self.write_cmd(0xA4)

        # 14. Set Normal Display (0xA6: Normal, 0xA7: Inverse)
        self.write_cmd(0xA6)

        # 15. Set Memory Addressing Mode (Page Addressing Mode)
        self.write_cmd(0x20)
        self.write_cmd(0x02)  # Page Addressing Mode (0x02)

        # 16. Charge Pump Setting (Internal DC-DC Converter Enable)
        self.write_cmd(0x8D)
        self.write_cmd(0x14)

        # 17. Display ON
        self.write_cmd(0xAF)

        self.fill(0)
        self.show()

    def set_contrast(self, val):
        self.write_cmd(0x81)
        self.write_cmd(max(0, min(255, int(val))))

    def invert(self, inv=True):
        self.write_cmd(0xA7 if inv else 0xA6)

    def test_all_pixels_on(self, all_on=True):
        """Hardware override test: 0xA5 forces all pixels ON without RAM."""
        self.write_cmd(0xA5 if all_on else 0xA4)

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
        """
        Page-by-Page Refresh (Identical to U8g2 sendBuffer).
        Transfers 8 pages (0 to 7) of 128 bytes each.
        """
        for page in range(8):
            # Set Page Address (0xB0 to 0xB7)
            self.write_cmd(0xB0 + page)
            # Set Column Start Address (0x00 Lower Nibble, 0x10 Upper Nibble)
            self.write_cmd(0x00)
            self.write_cmd(0x10)
            # Send 128 data bytes for this page
            start_idx = page * 128
            self.write_data(self.buf[start_idx : start_idx + 128])


# ================= 3. DIAGNOSTIC RUNNER =================
def main():
    print("\n=======================================================")
    print("  LOF TITAN — WAVESHARE 2.42\" OLED (SSD1309) U8G2 TEST  ")
    print("=======================================================")
    print("Connecting on:")
    print("  [VCC]  -> 3.3V")
    print("  [GND]  -> GND")
    print("  [CLK]  -> GPIO 35")
    print("  [MOSI] -> GPIO 36")
    print("  [CS]   -> GPIO 38")
    print("  [DC]   -> GPIO 37")
    print("-------------------------------------------------------")

    beep(1800, 50)
    time.sleep_ms(25)
    beep(2400, 70)

    print("[STEP 1] Initializing U8g2 SSD1309 Engine with Command Unlock...")
    try:
        oled = U8g2_SSD1309_SPI(sck=35, mosi=36, cs=38, dc=37, use_soft_spi=True)
        print("  -> Initialized! Bus: {}".format(oled.bus_type))
    except Exception as e:
        print("  -> ERROR:", e)
        led_red.value(1)
        return

    # TEST A: Hardware Force ALL Pixels ON (0xA5)
    print("\n[STEP 2] Hardware Test: 0xA5 (Forcing All Pixels ON for 1.5s)...")
    print("  -> (If screen stays completely dark here, check RST pin or 3.3V power!)")
    oled.test_all_pixels_on(True)
    time.sleep_ms(1500)
    oled.test_all_pixels_on(False)  # Resume RAM display
    time.sleep_ms(200)

    # TEST B: RAM Framebuffer Inverted Test
    print("[STEP 3] Rendering U8g2 Graphical Test Pattern...")
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)
    oled.rect(2, 2, 124, 60, 1)
    oled.fill_rect(0, 0, 128, 12, 1)
    oled.text("WAVESHARE 2.42", 8, 2, 0)
    oled.draw_large_text("TITAN", 24, 20, scale=2, col=1)
    oled.text("SSD1309 SPI OK", 8, 44, 1)
    oled.text("CLK:35 MOSI:36", 8, 54, 1)
    oled.show()
    beep(2600, 60)
    time.sleep_ms(2000)

    # TEST C: Live Counter & Moving Waveform
    print("\n[STEP 4] Live 30 FPS Counter & Graphics Loop...")
    frame = 0
    while True:
        oled.fill(0)
        oled.fill_rect(0, 0, 128, 11, 1)
        oled.text("SSD1309 2.42\"", 2, 2, 0)
        oled.text("{:04d}".format(frame), 92, 2, 0)

        # Dynamic sine wave
        for x in range(128):
            y = int(36 + 14 * math.sin((x * 0.09) + (frame * 0.12)))
            oled.pixel(x, y, 1)

        # Orbiting circle
        cx = int(64 + 35 * math.cos(frame * 0.08))
        cy = int(36 + 12 * math.sin(frame * 0.08))
        oled.fill_rect(cx - 3, cy - 3, 7, 7, 1)

        oled.text("STATUS: RUNNING", 8, 54, 1)
        oled.show()

        frame += 1
        if frame % 40 == 0:
            print("  [LIVE] Frame: {:05d} | Screen Active!".format(frame))
            led_grn.value(1 - led_grn.value())

        time.sleep_ms(15)

if __name__ == '__main__':
    main()
