# ==============================================================================
# LOF TITAN — Cosmic Pulse Tracker (Transmitter / Lost Beacon)
# MicroPython conversion of cosmic_pulsetracker_transmittercode.ino
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Wireless: ESP-NOW 2.4GHz Fast Pulses (Channel 1, Broadcast FF:FF:FF:FF:FF:FF)
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C, SDA: 7, SCL: 8)
#   - Buzzer: GPIO 20 (Continuous long BEEEEEP tone only when HERE)
#   - Status LEDs: GPIO 47 (Red), GPIO 48 (Green)
#
# OLED Visual Modes (AKNO-Style Expressive Eyes, No Text):
#   - ZONE_SEARCHING (0) -> Moving Eyes (wandering pupils)
#   - ZONE_FAR       (1) -> Crying Eyes with animated dropping tears
#   - ZONE_NEAR      (2) -> Rapid Scanning / Tracking Eyes
#   - ZONE_HERE      (3) -> Happy Blinking Eyes + Wide Arc Smile
# ==============================================================================

import time
import math
import struct
from machine import Pin, PWM, SoftI2C, I2C
import network
import framebuf

# ESP-NOW Protocol
try:
    import espnow
    HAS_ESPNOW = True
except ImportError:
    HAS_ESPNOW = False

# ---------- CONSTANTS & ZONES ----------
ZONE_SEARCHING = 0
ZONE_FAR       = 1
ZONE_NEAR      = 2
ZONE_HERE      = 3

SEND_INTERVAL_MS    = 200
FEEDBACK_TIMEOUT_MS = 1800
DISPLAY_INTERVAL_MS = 55

# ---------- HARDWARE PINS & PWM ----------
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    """Singleton PWM manager for ESP32-S3."""
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try:
            _pwm_pool[pin].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin]

led_red = Pin(47, Pin.OUT)
led_grn = Pin(48, Pin.OUT)
led_red.value(0)
led_grn.value(0)

def set_buzzer_tone(freq=0):
    """Controls buzzer tone (freq in Hz, 0 = OFF)."""
    try:
        buz = _get_pwm(20, freq=max(100, freq))
        if freq > 0:
            buz.duty_u16(32768)
        else:
            buz.duty_u16(0)
    except Exception:
        pass


# ---------- 1.3" / 0.96" OLED DRIVER WITH U8G2-STYLE PRIMITIVES ----------
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
        self.draw_color = 1
        self.is_sh1106 = True
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
        for c in cmds: self._cmd(c)
        self.fill(0)
        self.show()

    def fill(self, color=0):
        self.fb.fill(color)

    def set_draw_color(self, color):
        self.draw_color = color

    def pixel(self, x, y, col=None):
        if col is None: col = self.draw_color
        if 0 <= x < self.width and 0 <= y < self.height:
            self.fb.pixel(x, y, col)

    def line(self, x1, y1, x2, y2, col=None):
        if col is None: col = self.draw_color
        self.fb.line(x1, y1, x2, y2, col)

    def rect(self, x, y, w, h, col=None):
        if col is None: col = self.draw_color
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=None):
        if col is None: col = self.draw_color
        self.fb.fill_rect(x, y, w, h, col)

    def draw_r_box(self, x, y, w, h, r, col=None):
        """Draw filled rounded box (u8g2 drawRBox)."""
        if col is None: col = self.draw_color
        r = min(r, w // 2, h // 2)
        # Center rectangles
        self.fill_rect(x + r, y, w - 2 * r, h, col)
        self.fill_rect(x, y + r, w, h - 2 * r, col)
        # 4 corner discs
        self.draw_disc(x + r, y + r, r, col)
        self.draw_disc(x + w - r - 1, y + r, r, col)
        self.draw_disc(x + r, y + h - r - 1, r, col)
        self.draw_disc(x + w - r - 1, y + h - r - 1, r, col)

    def draw_disc(self, cx, cy, r, col=None):
        """Draw filled circle / disc."""
        if col is None: col = self.draw_color
        if r <= 0:
            self.pixel(cx, cy, col)
            return
        for dy in range(-r, r + 1):
            dx = int(math.sqrt(r * r - dy * dy))
            self.line(cx - dx, cy + dy, cx + dx, cy + dy, col)

    def draw_triangle(self, x0, y0, x1, y1, x2, y2, col=None):
        """Draw filled triangle."""
        if col is None: col = self.draw_color
        # Sort by Y coordinates
        pts = sorted([(x0, y0), (x1, y1), (x2, y2)], key=lambda p: p[1])
        (x0, y0), (x1, y1), (x2, y2) = pts
        
        def interpolate_x(ya, yb, xa, xb, y):
            if ya == yb: return xa
            return xa + (xb - xa) * (y - ya) // (yb - ya)

        for y in range(y0, y2 + 1):
            if y < y1:
                xa = interpolate_x(y0, y2, x0, x2, y)
                xb = interpolate_x(y0, y1, x0, x1, y)
            else:
                xa = interpolate_x(y0, y2, x0, x2, y)
                xb = interpolate_x(y1, y2, x1, x2, y)
            if xa > xb: xa, xb = xb, xa
            self.line(xa, y, xb, y, col)

    def show(self):
        if not self.i2c: return
        try:
            if self.is_sh1106:
                for page in range(8):
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + page, 0x80, 0x02, 0x80, 0x10]))
                    self.i2c.writeto(self.addr, b'\x40' + self.buffer[128 * page : 128 * (page + 1)])
            else:
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\x40' + self.buffer)
        except Exception:
            pass


# ---------- AKNO FACE RENDERER (TRANSMITTER) ----------
class AknoFaceRenderer:
    """Exact AKNO-style animated eyes matching cosmic_pulsetracker_transmittercode.ino."""
    LEFT_EYE_X   = 2
    RIGHT_EYE_X  = 66
    EYE_Y        = 5
    EYE_W        = 60
    EYE_H        = 54
    EYE_RADIUS   = 16

    LEFT_EYE_CX  = LEFT_EYE_X + EYE_W // 2   # 32
    RIGHT_EYE_CX = RIGHT_EYE_X + EYE_W // 2  # 96
    EYE_CY       = EYE_Y + EYE_H // 2        # 32

    def __init__(self, display):
        self.d = display

    def draw_base_eyes(self):
        self.d.draw_r_box(self.LEFT_EYE_X, self.EYE_Y, self.EYE_W, self.EYE_H, self.EYE_RADIUS, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, self.EYE_Y, self.EYE_W, self.EYE_H, self.EYE_RADIUS, 1)

    def draw_pupils(self, left_x, left_y, right_x, right_y, pupil_r):
        self.d.set_draw_color(0)
        self.d.draw_disc(self.LEFT_EYE_CX + left_x, self.EYE_CY + left_y, pupil_r, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + right_x, self.EYE_CY + right_y, pupil_r, 0)
        self.d.set_draw_color(1)

    def draw_closed_eyes(self):
        self.d.draw_r_box(self.LEFT_EYE_X, 28, self.EYE_W, 8, 4, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, 28, self.EYE_W, 8, 4, 1)

    def draw_tear(self, x, y):
        self.d.draw_disc(x, y, 2, 1)
        self.d.draw_disc(x, y + 4, 2, 1)
        self.d.draw_disc(x, y + 8, 1, 1)
        self.d.pixel(x, y + 10, 1)

    def draw_smile(self):
        """Draw wide dark smile arc."""
        for offset in range(3):
            self.d.line(34, 45 + offset, 40, 51 + offset, 1)
            self.d.line(40, 51 + offset, 50, 57 + offset, 1)
            self.d.line(50, 57 + offset, 64, 61 + offset, 1)
            self.d.line(64, 61 + offset, 78, 57 + offset, 1)
            self.d.line(78, 57 + offset, 88, 51 + offset, 1)
            self.d.line(88, 51 + offset, 94, 45 + offset, 1)
        self.d.line(32, 43, 34, 45, 1)
        self.d.line(94, 45, 96, 43, 1)

    # 1. SEARCHING: MOVING WANDERING EYES
    def draw_searching(self, now_ms):
        self.d.fill(0)
        movement = [
            (0, 0), (-12, 0), (-8, -8), (0, -10), (10, -7),
            (12, 0), (8, 8), (0, 10), (-10, 7), (0, 0)
        ]
        frame = (now_ms // 110) % 10
        ox, oy = movement[frame]
        self.draw_base_eyes()
        self.draw_pupils(ox, oy, ox, oy, 6)

    # 2. FAR: CRYING EYES WITH DROPPING TEARS
    def draw_far_crying(self, now_ms):
        self.d.fill(0)
        frame = (now_ms // 90) % 18
        sad_drop = 8 + (frame % 5)

        self.d.draw_r_box(self.LEFT_EYE_X, 11, self.EYE_W, 44, 14, 1)
        self.d.draw_r_box(self.RIGHT_EYE_X, 11, self.EYE_W, 44, 14, 1)

        # Cutout inverted sad eyebrow slants and cheek discs
        self.d.set_draw_color(0)
        self.d.draw_triangle(0, 2, 64, 2, 0, 24 + sad_drop, 0)
        self.d.draw_triangle(64, 2, 128, 24 + sad_drop, 128, 2, 0)

        self.d.draw_disc(self.LEFT_EYE_CX - 28, 64, 20, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + 28, 64, 20, 0)

        self.d.draw_disc(self.LEFT_EYE_CX - 4, self.EYE_CY + 11, 5, 0)
        self.d.draw_disc(self.RIGHT_EYE_CX + 4, self.EYE_CY + 11, 5, 0)

        self.d.set_draw_color(1)

        tear1 = frame % 9
        tear2 = (frame + 4) % 9
        self.draw_tear(self.LEFT_EYE_CX - 17, 39 + tear1)
        self.draw_tear(self.RIGHT_EYE_CX - 17, 39 + tear2)

        if frame > 8:
            self.draw_tear(self.LEFT_EYE_CX + 7, 37 + (frame - 9))

    # 3. NEAR: FAST SCANNING EYES
    def draw_near_scanning(self, now_ms):
        self.d.fill(0)
        movement = [
            (-13, 0), (-8, -8), (0, -11), (10, -7), (13, 0),
            (10, 7), (0, 11), (-10, 7), (-13, 0), (13, 0)
        ]
        frame = (now_ms // 60) % 10
        ox, oy = movement[frame]
        self.draw_base_eyes()
        self.draw_pupils(ox, oy, ox, oy, 6)

    # 4. HERE: HAPPY BLINKING EYES + WIDE SMILE
    def draw_here_happy(self, now_ms):
        self.d.fill(0)
        frame = (now_ms // 100) % 24
        blink = (frame in (7, 8, 18))

        if blink:
            self.draw_closed_eyes()
            self.draw_smile()
        else:
            self.d.draw_r_box(self.LEFT_EYE_X, 7, self.EYE_W, 50, 16, 1)
            self.d.draw_r_box(self.RIGHT_EYE_X, 7, self.EYE_W, 50, 16, 1)

            self.d.set_draw_color(0)
            self.d.draw_disc(self.LEFT_EYE_CX, 68, 42, 0)
            self.d.draw_disc(self.RIGHT_EYE_CX, 68, 42, 0)

            self.d.draw_disc(self.LEFT_EYE_CX, 27, 4, 0)
            self.d.draw_disc(self.RIGHT_EYE_CX, 27, 4, 0)

            self.d.set_draw_color(1)
            self.draw_smile()

    def render_zone(self, zone, now_ms):
        if zone == ZONE_SEARCHING:
            self.draw_searching(now_ms)
        elif zone == ZONE_FAR:
            self.draw_far_crying(now_ms)
        elif zone == ZONE_NEAR:
            self.draw_near_scanning(now_ms)
        elif zone == ZONE_HERE:
            self.draw_here_happy(now_ms)
        self.d.show()


# ---------- WIRELESS ESP-NOW BEACON SUBSYSTEM ----------
class TransmitterWireless:
    def __init__(self):
        self.sta = network.WLAN(network.STA_IF)
        self.sta.active(True)
        self.sta.disconnect()
        
        self.esp = None
        self.broadcast_peer = b'\xff\xff\xff\xff\xff\xff'
        
        if HAS_ESPNOW:
            try:
                self.esp = espnow.ESPNow()
                self.esp.active(True)
                try:
                    self.esp.add_peer(self.broadcast_peer)
                except Exception:
                    pass
                print("[ESP-NOW] Transmitter ready on STA_IF")
            except Exception as e:
                print(f"[WARN] ESP-NOW init failed: {e}")
                self.esp = None

        self.beacon_counter = 0

    def send_beacon(self):
        self.beacon_counter = (self.beacon_counter + 1) & 0xFFFFFFFF
        if self.esp:
            try:
                # Pack BeaconPacket struct: uint32_t counter
                packet = struct.pack("<I", self.beacon_counter)
                self.esp.send(self.broadcast_peer, packet, False)
            except Exception:
                pass

    def check_feedback(self):
        """Reads non-blocking incoming feedback packets from receiver."""
        if not self.esp:
            return None
        
        latest_zone = None
        try:
            while True:
                msg_data = self.esp.recv(0) # Non-blocking (0ms)
                if not msg_data or msg_data[0] is None:
                    break
                
                mac, data = msg_data[0], msg_data[1]
                if data and len(data) >= 1:
                    val = data[0]
                    if val in (ZONE_SEARCHING, ZONE_FAR, ZONE_NEAR, ZONE_HERE):
                        latest_zone = val
                    elif 48 <= val <= 51: # ASCII '0'..'3'
                        latest_zone = val - 48
        except Exception:
            pass
        
        return latest_zone


# ---------- MAIN PROGRAM ----------
def main():
    print("==================================================")
    print("ESP32-S3 TRANSMITTER (AKNO-STYLE EYES)")
    print("LOF TITAN Cosmic Pulse Tracker")
    print("==================================================")

    # 1. Initialize I2C & OLED
    i2c = None
    try:
        i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=50000)
    except Exception:
        try:
            i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
        except Exception:
            print("[WARN] Could not initialize I2C bus.")

    oled = TitanOLED(i2c, width=128, height=64)
    renderer = AknoFaceRenderer(oled)

    # 2. Initialize Wireless
    wireless = TransmitterWireless()

    current_zone = ZONE_SEARCHING
    last_send_time = 0
    last_feedback_time = 0
    last_display_time = 0

    print("Transmitter ready. Hiding mode engaged.")

    while True:
        now = time.ticks_ms()

        # 1. Broadcast Beacon Packet (Every 200ms)
        if time.ticks_diff(now, last_send_time) >= SEND_INTERVAL_MS:
            last_send_time = now
            wireless.send_beacon()

        # 2. Receive Feedback from Receiver
        fb_zone = wireless.check_feedback()
        if fb_zone is not None:
            current_zone = fb_zone
            last_feedback_time = now

        # 3. Feedback Timeout (If no packet for 1800ms -> ZONE_SEARCHING)
        if time.ticks_diff(now, last_feedback_time) > FEEDBACK_TIMEOUT_MS:
            current_zone = ZONE_SEARCHING

        # 4. Buzzer Feedback (Continuous long BEEEEEEP tone ONLY when HERE)
        if current_zone == ZONE_HERE:
            set_buzzer_tone(2200) # Continuous 2.2 kHz tone
        else:
            set_buzzer_tone(0)    # Silent during Searching, Far, Near

        # 5. Display Animation Update (Every 55ms)
        if time.ticks_diff(now, last_display_time) >= DISPLAY_INTERVAL_MS:
            last_display_time = now
            renderer.render_zone(current_zone, now)

        # Safety Sleep
        time.sleep_ms(10)


if __name__ == '__main__':
    main()
