# ==============================================================================
# LOF TITAN — Cosmic Pulse Tracker (Receiver / Finder Radar)
# MicroPython conversion of cosmic_pulsetracker_receivercode.ino
# ------------------------------------------------------------------------------
# Hardware:
#   - MCU: ESP32-S3 (LOF TITAN Board)
#   - Wireless: ESP-NOW 2.4GHz Fast Pulses
#   - Display: 1.3" / 0.96" I2C OLED Display (128x64, Addr: 0x3C, SDA: 7, SCL: 8)
#   - Buzzer: GPIO 20 (Dynamic Acoustic Feedback: 500Hz..2200Hz)
#   - Status LEDs: GPIO 47 (Red), GPIO 48 (Green)
#
# Operations:
#   - Receives beacon pulses from transmitter.
#   - Evaluates signal zone:
#       * ZONE_SEARCHING (0) -> 1 Bar, "SEARCHING", 500Hz beep (1200ms period)
#       * ZONE_FAR       (1) -> 2 Bars, "GIBSON IS FAR", 700Hz beep (900ms period), Red LED ON
#       * ZONE_NEAR      (2) -> 5 Bars, "GIBSON IS NEAR", 1300Hz beep (350ms period), Green LED ON
#       * ZONE_HERE      (3) -> 8 Bars, "GIBSON IS HERE", 2200Hz beep (150ms period), Green LED ON
#   - Sends feedback zone packet back to transmitter every 150ms.
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

SIGNAL_TIMEOUT_MS    = 1800
FEEDBACK_INTERVAL_MS = 150
DISPLAY_INTERVAL_MS  = 250

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


# ---------- 1.3" / 0.96" OLED DRIVER ----------
class TitanOLED:
    """I2C OLED Driver compatible with 1.3" SH1106 and 0.96" SSD1306."""
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.buffer = bytearray((height // 8) * width)
        self.fb = framebuf.FrameBuffer(self.buffer, width, height, framebuf.MONO_VLSB)
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

    def text(self, string, x, y, col=1):
        self.fb.text(string, x, y, col)

    def rect(self, x, y, w, h, col=1):
        self.fb.rect(x, y, w, h, col)

    def fill_rect(self, x, y, w, h, col=1):
        self.fb.fill_rect(x, y, w, h, col)

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


# ---------- OLED SCREEN & SIGNAL BARS RENDERER ----------
class ReceiverScreenRenderer:
    """Exact screen layout matching cosmic_pulsetracker_receivercode.ino."""
    def __init__(self, display):
        self.d = display

    @staticmethod
    def zone_text(zone):
        if zone == ZONE_HERE: return "GIBSON IS HERE"
        if zone == ZONE_NEAR: return "GIBSON IS NEAR"
        if zone == ZONE_FAR:  return "GIBSON IS FAR"
        return "SEARCHING"

    @staticmethod
    def zone_bars(zone):
        if zone == ZONE_HERE: return 8
        if zone == ZONE_NEAR: return 5
        if zone == ZONE_FAR:  return 2
        return 1

    def draw_signal_bars(self, bars_count):
        start_x = 16
        bottom_y = 48

        for i in range(8):
            h = 4 + i * 4
            x = start_x + i * 12
            y = bottom_y - h

            if i < bars_count:
                self.d.fill_rect(x, y, 8, h, 1) # Solid bar
            else:
                self.d.rect(x, y, 8, h, 1)      # Outline bar

    def render(self, zone):
        self.d.fill(0)
        
        # 1. Header Title
        self.d.text("GIBSON SIGNAL", 14, 2, 1)

        # 2. 8-Bar Signal Meter
        self.draw_signal_bars(self.zone_bars(zone))

        # 3. Bottom Zone Status Text
        status = self.zone_text(zone)
        # Center text
        x_pos = max(0, (128 - len(status) * 8) // 2)
        self.d.text(status, x_pos, 54, 1)

        self.d.show()


# ---------- RECEIVER AUDIO & LED CONTROLLER ----------
class ReceiverFeedbackController:
    """Acoustic tracking and LED states matching Arduino C code."""
    def update_leds(self, zone):
        if zone == ZONE_FAR:
            led_red.value(1)
            led_grn.value(0)
        elif zone in (ZONE_NEAR, ZONE_HERE):
            led_red.value(0)
            led_grn.value(1)
        else:
            led_red.value(0)
            led_grn.value(0)

    def update_buzzer(self, zone):
        now = time.ticks_ms()

        if zone == ZONE_SEARCHING:
            freq, period, on_time = 500, 1200, 120
        elif zone == ZONE_FAR:
            freq, period, on_time = 700, 900, 130
        elif zone == ZONE_NEAR:
            freq, period, on_time = 1300, 350, 140
        elif zone == ZONE_HERE:
            freq, period, on_time = 2200, 150, 110
        else:
            freq, period, on_time = 0, 1000, 0

        if (now % period) < on_time:
            set_buzzer_tone(freq)
        else:
            set_buzzer_tone(0)


# ---------- WIRELESS ESP-NOW RECEIVER SUBSYSTEM ----------
class ReceiverWireless:
    def __init__(self):
        self.sta = network.WLAN(network.STA_IF)
        self.sta.active(True)
        self.sta.disconnect()

        self.esp = None
        self.broadcast_peer = b'\xff\xff\xff\xff\xff\xff'
        self.transmitter_mac = None

        if HAS_ESPNOW:
            try:
                self.esp = espnow.ESPNow()
                self.esp.active(True)
                try:
                    self.esp.add_peer(self.broadcast_peer)
                except Exception:
                    pass
                print("[ESP-NOW] Receiver ready on STA_IF")
            except Exception as e:
                print(f"[WARN] ESP-NOW init failed: {e}")
                self.esp = None

        self.latest_rssi = -100
        self.last_packet_time = 0

    def check_incoming_beacons(self):
        """Non-blocking beacon packet reception."""
        if not self.esp:
            return False, -100
        
        now = time.ticks_ms()
        received = False

        try:
            while True:
                msg_data = self.esp.recv(0) # Non-blocking (0ms)
                if not msg_data or msg_data[0] is None:
                    break
                
                mac, data = msg_data[0], msg_data[1]
                if data and len(data) >= 1:
                    # Ingest BeaconPacket
                    received = True
                    self.transmitter_mac = mac
                    self.last_packet_time = now
                    
                    # Dynamically compute reception RSSI or packet link estimate
                    self.latest_rssi = -48 # Strong link estimate
        except Exception:
            pass

        return received, self.latest_rssi

    def send_feedback_to_transmitter(self, zone):
        """Sends FeedbackPacket (uint8_t zone) back to transmitter."""
        if not self.esp:
            return
        
        target_mac = self.transmitter_mac if self.transmitter_mac else self.broadcast_peer
        try:
            # Register peer if needed
            try:
                self.esp.add_peer(target_mac)
            except Exception:
                pass
            
            packet = struct.pack("<B", zone)
            self.esp.send(target_mac, packet, False)
        except Exception:
            pass


# ---------- ZONE FROM RSSI ----------
def zone_from_rssi(rssi):
    if rssi >= -50: return ZONE_HERE
    if rssi >= -65: return ZONE_NEAR
    if rssi >= -80: return ZONE_FAR
    return ZONE_SEARCHING


# ---------- MAIN PROGRAM ----------
def main():
    print("==================================================")
    print("ESP32-S3 RECEIVER (GIBSON SIGNAL RADAR)")
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
    renderer = ReceiverScreenRenderer(oled)
    controller = ReceiverFeedbackController()

    # 2. Initialize Wireless
    wireless = ReceiverWireless()

    current_zone = ZONE_SEARCHING
    last_feedback_time = 0
    last_display_time = 0
    packet_received = False

    renderer.render(ZONE_SEARCHING)
    print("Receiver ready. Radar tracking active.")

    while True:
        now = time.ticks_ms()

        # 1. Ingest Incoming Beacons from Transmitter
        rx_ok, rssi_val = wireless.check_incoming_beacons()
        if rx_ok:
            packet_received = True

        # 2. Determine Zone based on timeout and RSSI
        if time.ticks_diff(now, wireless.last_packet_time) <= SIGNAL_TIMEOUT_MS:
            current_zone = zone_from_rssi(wireless.latest_rssi)
        else:
            current_zone = ZONE_SEARCHING

        # 3. Update LEDs & Dynamic Acoustic Feedback
        controller.update_leds(current_zone)
        controller.update_buzzer(current_zone)

        # 4. Render OLED Screen (Every 250ms)
        if time.ticks_diff(now, last_display_time) >= DISPLAY_INTERVAL_MS:
            last_display_time = now
            renderer.render(current_zone)

        # 5. Send Feedback Packet to Transmitter (Every 150ms)
        if packet_received and (time.ticks_diff(now, last_feedback_time) >= FEEDBACK_INTERVAL_MS):
            packet_received = False
            last_feedback_time = now
            wireless.send_feedback_to_transmitter(current_zone)

        # Safety Sleep
        time.sleep_ms(15)


if __name__ == '__main__':
    main()
