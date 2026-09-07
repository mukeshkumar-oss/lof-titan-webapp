# ==============================================================================
# LOF TITAN - HEARTBEAT DJ BOT WITH MAX30102, SH1106 OLED & DFPLAYER MINI
# ==============================================================================
# Hardware Pinout (ESP32-S3):
#   - I2C OLED (1.3" SH1106 / SSD1306): SDA = GPIO 7, SCL = GPIO 8 (Addr: 0x3C)
#   - Pulse Sensor (MAX30102 / MAX30100): SDA = GPIO 7, SCL = GPIO 8 (Addr: 0x57)
#   - DFPlayer Mini MP3 Player: TX = GPIO 17, RX = GPIO 18 (Baud: 9600 8N1)
#   - Onboard Buzzer / Status LED: GPIO 20 / GPIO 48
#
# Audio Tracks:
#   - Track 1: Calm Track (Plays once for 20s upon Calm Mode trigger, then silent)
#   - Track 2: Normal Track A (Alternates with Track 3 every 20s)
#   - Track 3: Normal Track B (Alternates with Track 2 every 20s)
#
# State Logic:
#   1. Startup: OLED "DJ BOT - SYSTEM STARTING", init DFPlayer & MAX30102 (up to 5 retries).
#   2. Normal Mode: Animated robot eyes change every 2.5s. Tracks 2 & 3 alternate every 20s.
#   3. Finger Detected: Instant priority ECG-style live PPG waveform + real-time BPM readout.
#   4. Calm Mode: 2 consecutive valid BPM > 85 activates 60s Calm Mode.
#      Track 1 plays for 20s once. Live ECG has priority if finger present, else Serene Calm Face.
#   5. Tired Mode: 60s continuous absence of finger triggers Tired Eyes + "Zzz" animation.
# ==============================================================================

import time
import math
import random
import framebuf
from machine import Pin, SoftI2C, I2C, UART

# ================= 1. SH1106 / SSD1306 OLED DRIVER =================
class TitanOLED(framebuf.FrameBuffer):
    def __init__(self, sda_pin=7, scl_pin=8, is_sh1106=True, col_offset=2):
        self.is_sh1106 = is_sh1106
        self.col_offset = col_offset
        self.width = 128
        self.height = 64
        self.addr = 0x3C
        self.buf = bytearray(1024)
        super().__init__(self.buf, self.width, self.height, framebuf.MONO_VLSB)
        
        try:
            self.i2c = SoftI2C(sda=Pin(sda_pin, Pin.OUT), scl=Pin(scl_pin, Pin.OUT), freq=400000, timeout=2000)
            devs = self.i2c.scan()
            if 0x3C in devs:
                self.addr = 0x3C
            elif 0x3D in devs:
                self.addr = 0x3D
            elif devs:
                self.addr = devs[0]
        except Exception:
            self.i2c = None

        if self.i2c:
            init_seq = (
                0xAE, 0x20, 0x00, 0x40, 0xA1, 0xC8, 0x81, 0xCF,
                0xA6, 0xA8, 0x3F, 0xD3, 0x00, 0xD5, 0x80, 0xD9,
                0xF1, 0xDA, 0x12, 0xDB, 0x40, 0x8D, 0x14, 0xAF
            )
            for cmd in init_seq:
                try:
                    self.i2c.writeto(self.addr, bytearray([0x80, cmd]))
                except Exception:
                    pass
        self.fill(0)
        self.show()

    def print_text(self, s, x, y, size=1, col=1):
        s = str(s)
        if size <= 1:
            super().text(s, x, y, col)
        else:
            w = len(s) * 8
            tmp_buf = bytearray((w * 8 + 7) // 8)
            fb = framebuf.FrameBuffer(tmp_buf, w, 8, framebuf.MONO_VLSB)
            fb.fill(0)
            fb.text(s, 0, 0, 1)
            for px in range(w):
                for py in range(8):
                    if fb.pixel(px, py):
                        for dx in range(size):
                            for dy in range(size):
                                nx = x + px * size + dx
                                ny = y + py * size + dy
                                if 0 <= nx < 128 and 0 <= ny < 64:
                                    self.pixel(nx, ny, col)

    def show(self):
        if not self.i2c:
            return
        try:
            if self.is_sh1106:
                for page in range(8):
                    # SH1106 column addressing (default offset +2)
                    low_col = self.col_offset & 0x0F
                    high_col = 0x10 | ((self.col_offset >> 4) & 0x0F)
                    self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + page, 0x80, low_col, 0x80, high_col]))
                    self.i2c.writeto(self.addr, b'\x40' + self.buf[128 * page : 128 * (page + 1)])
            else:
                # SSD1306 column & page range addressing
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\x40' + self.buf)
        except Exception:
            pass


# ================= 2. DFPLAYER MINI UART DRIVER =================
class TitanDFPlayer:
    def __init__(self, uart_id=1, tx=17, rx=18):
        self.uart_id = uart_id
        self.tx = tx
        self.rx = rx
        self.current_track = 0
        try:
            self.uart = UART(uart_id, baudrate=9600, tx=tx, rx=rx)
        except Exception:
            try:
                self.uart = UART(uart_id, baudrate=9600)
            except Exception:
                self.uart = None
        time.sleep_ms(150)

    def _send_cmd(self, cmd, param1=0, param2=0):
        if not self.uart:
            return
        buf = bytearray(10)
        buf[0] = 0x7E  # Start
        buf[1] = 0xFF  # Version
        buf[2] = 0x06  # Length
        buf[3] = cmd   # Command
        buf[4] = 0x00  # Feedback disabled
        buf[5] = param1 & 0xFF
        buf[6] = param2 & 0xFF
        # 16-bit Checksum
        chk = 0 - (0xFF + 0x06 + cmd + 0x00 + param1 + param2)
        buf[7] = (chk >> 8) & 0xFF
        buf[8] = chk & 0xFF
        buf[9] = 0xEF  # End
        try:
            self.uart.write(buf)
            time.sleep_ms(35)
        except Exception:
            pass

    def play_track(self, track_num):
        t = int(track_num)
        self.current_track = t
        self._send_cmd(0x03, (t >> 8) & 0xFF, t & 0xFF)

    def play(self):
        self._send_cmd(0x0D, 0, 0)

    def pause(self):
        self._send_cmd(0x0E, 0, 0)

    def stop(self):
        self.current_track = 0
        self._send_cmd(0x16, 0, 0)

    def set_volume(self, vol):
        v = max(0, min(30, int(vol)))
        self._send_cmd(0x06, 0, v)

    def set_eq(self, eq=0):
        # 0:Normal, 1:Pop, 2:Rock, 3:Jazz, 4:Classic, 5:Bass
        self._send_cmd(0x07, 0, eq & 0x07)


# ================= 3. MAX30102 / MAX30100 PPG BEAT DETECTOR =================
class SparkFunHeartRate:
    def __init__(self):
        self.ir_avg_reg = 0
        self.ac_filtered = 0
        self.peak_val = 0
        self.is_rising = False
        self.last_beat_ms = 0
        self.threshold = 120
        self.ir_ac_signal_current = 0

    def check_for_beat(self, sample, now):
        # 1. DC Removal / High-Pass Baseline Tracking
        if self.ir_avg_reg == 0:
            self.ir_avg_reg = sample
        self.ir_avg_reg = int((self.ir_avg_reg * 31 + sample) / 32)
        raw_ac = sample - self.ir_avg_reg
        self.ir_ac_signal_current = raw_ac

        # 2. Low-Pass Smoothing Filter to reject optical & AC flicker noise
        self.ac_filtered = int((self.ac_filtered * 3 + raw_ac) / 4)

        # 3. Dynamic Peak & Refractory Detection (Max 175 BPM = 340ms min interval)
        time_since_last = time.ticks_diff(now, self.last_beat_ms)
        beat_detected = False

        if self.ac_filtered > self.threshold and time_since_last >= 340:
            if not self.is_rising:
                self.is_rising = True
            if self.ac_filtered > self.peak_val:
                self.peak_val = self.ac_filtered
        elif self.is_rising and self.ac_filtered < (self.peak_val * 0.70):
            # Confirmed systolic wave peak on downward slope
            self.is_rising = False
            # Adapt dynamic threshold to pulse amplitude
            self.threshold = max(60, min(1500, int(self.peak_val * 0.45)))
            self.peak_val = 0
            self.last_beat_ms = now
            beat_detected = True

        # Gradual threshold decay if no beat seen
        if time_since_last > 1400:
            self.threshold = max(60, int(self.threshold * 0.95))

        return beat_detected


class TitanPulseSensor:
    def __init__(self, sda_pin=7, scl_pin=8, addr=0x57):
        self.addr = addr
        self.i2c = SoftI2C(sda=Pin(sda_pin, Pin.OUT), scl=Pin(scl_pin, Pin.OUT), freq=400000, timeout=2000)
        self.detector = SparkFunHeartRate()
        self.chip_type = "UNKNOWN"
        self.is_connected = False
        
        # Debounced finger states
        self.finger_detected = False
        self.finger_high_counter = 0   # Must sustain >= 10,000 for 100 ms (10 samples @ 100Hz)
        self.finger_low_counter = 0    # Must sustain <= 4,000 for 400 ms (40 samples @ 100Hz)
        self.finger_detected_at = 0
        
        # Beat & BPM metrics
        self.last_beat_anchor = 0
        self.current_bpm = 0.0
        self.average_bpm = 0
        self.bpm_history = []
        self.consecutive_high_bpm = 0
        self.new_beat_ready = False
        
        # Signal buffers for visualization
        self.latest_ir = 0
        self.latest_red = 0
        self.beat_event = False
        self.wave_buf = [32] * 128
        self.last_sample_ms = 0

    def _w(self, reg, val):
        try:
            self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
        except Exception:
            pass

    def _r(self, reg, n=1):
        try:
            return self.i2c.readfrom_mem(self.addr, reg, n)
        except Exception:
            return bytearray(n)

    def init_sensor(self):
        """Attempts connection up to 5 times."""
        for attempt in range(1, 6):
            try:
                devs = self.i2c.scan()
                if self.addr in devs:
                    part_id = self._r(0xFF, 1)[0]
                    if part_id in (0x15, 0x25):
                        self.chip_type = "MAX30102"
                        self._w(0x09, 0x40)  # Reset
                        time.sleep_ms(80)
                        self._w(0x08, 0x30)  # FIFO config: 4-sample averaging
                        self._w(0x09, 0x03)  # Mode: SpO2 (Red + IR)
                        self._w(0x0A, 0x27)  # SpO2 config: 100Hz, 411us
                        self._w(0x0C, 0x24)  # LED1 (Red) ~7.2mA
                        self._w(0x0D, 0x24)  # LED2 (IR) ~7.2mA
                        self._w(0x04, 0x00)  # FIFO WR PTR
                        self._w(0x05, 0x00)  # OVF PTR
                        self._w(0x06, 0x00)  # FIFO RD PTR
                        self.is_connected = True
                        return True
                    else:
                        self.chip_type = "MAX30100"
                        self._w(0x06, 0x40)  # Reset
                        time.sleep_ms(80)
                        self._w(0x07, 0x03)  # Mode: SpO2
                        self._w(0x09, 0x33)  # Current: 11mA
                        self._w(0x06, 0x03)  # High res SpO2
                        self.is_connected = True
                        return True
            except Exception:
                pass
            time.sleep_ms(100)
        return False

    def process_sample(self, ir, red, now):
        self.latest_ir = ir
        self.latest_red = red

        # 1. Debounce Finger Placement (>= 10,000 for 100 ms -> 10 samples)
        if ir >= 10000:
            self.finger_high_counter += 1
            self.finger_low_counter = 0
            if self.finger_high_counter >= 10 and not self.finger_detected:
                self.finger_detected = True
                self.finger_detected_at = now
                self.last_beat_anchor = 0
                self.current_bpm = 0.0
                self.average_bpm = 0
                self.bpm_history = []
                self.new_beat_ready = False
        # 2. Debounce Finger Removal (<= 4,000 for 400 ms -> 40 samples)
        elif ir <= 4000:
            self.finger_low_counter += 1
            self.finger_high_counter = 0
            if self.finger_low_counter >= 40 and self.finger_detected:
                self.finger_detected = False
                self.last_beat_anchor = 0
                self.current_bpm = 0.0
                self.average_bpm = 0
                self.bpm_history = []
                self.new_beat_ready = False
        else:
            self.finger_high_counter = 0
            self.finger_low_counter = 0

        # 3. Cardiac Beat Detection (When finger confirmed)
        self.beat_event = False
        if self.finger_detected:
            if self.detector.check_for_beat(ir, now):
                self.beat_event = True
                # Allow 800ms settling time after finger placement
                if time.ticks_diff(now, self.finger_detected_at) >= 800:
                    if self.last_beat_anchor == 0:
                        self.last_beat_anchor = now
                    else:
                        interval = time.ticks_diff(now, self.last_beat_anchor)
                        self.last_beat_anchor = now
                        # Valid human physiological range: 45 to 160 BPM (375ms to 1333ms)
                        if 375 <= interval <= 1333:
                            inst_bpm = 60000.0 / interval
                            if self.average_bpm == 0:
                                self.average_bpm = int(inst_bpm + 0.5)
                            else:
                                # Smooth moving average (65% history, 35% new reading) to eliminate jumpiness
                                self.average_bpm = int(self.average_bpm * 0.65 + inst_bpm * 0.35 + 0.5)
                            
                            self.current_bpm = inst_bpm
                            self.bpm_history.append(self.average_bpm)
                            if len(self.bpm_history) > 4:
                                self.bpm_history.pop(0)
                            self.new_beat_ready = True
                            print(f"[HEART] Beat! Inst: {int(inst_bpm)} BPM | Smooth Avg: {self.average_bpm} BPM")

        # 4. Update 128-pixel Waveform Buffer for OLED
        if self.finger_detected:
            ac = getattr(self.detector, 'ir_ac_signal_current', 0)
            # Map AC amplitude to screen range (Y: 14 to 48, center at 32)
            y_point = 32 - int(ac * 0.055)
            if y_point < 14: y_point = 14
            if y_point > 48: y_point = 48
            self.wave_buf.pop(0)
            self.wave_buf.append(y_point)
        else:
            self.wave_buf.pop(0)
            self.wave_buf.append(32)

    def update_100hz(self):
        """Reads latest sample from FIFO at 100 Hz (every 10 ms)."""
        now = time.ticks_ms()
        if time.ticks_diff(now, self.last_sample_ms) < 10:
            return
        self.last_sample_ms = now

        try:
            if self.chip_type == "MAX30102":
                wr = self._r(0x04, 1)[0]
                rd = self._r(0x06, 1)[0]
                num_samples = (wr - rd) & 0x1F
                if num_samples > 0:
                    raw = self._r(0x07, num_samples * 6)
                    # Process the latest sample from FIFO
                    last_idx = (num_samples - 1) * 6
                    ir = (raw[last_idx + 3] << 16 | raw[last_idx + 4] << 8 | raw[last_idx + 5]) & 0x03FFFF
                    red = (raw[last_idx + 0] << 16 | raw[last_idx + 1] << 8 | raw[last_idx + 2]) & 0x03FFFF
                    if ir > 0:
                        self.process_sample(ir, red, now)
            elif self.chip_type == "MAX30100":
                wr = self._r(0x02, 1)[0]
                rd = self._r(0x04, 1)[0]
                num_samples = (wr - rd) & 0x0F
                if num_samples > 0:
                    raw = self._r(0x05, num_samples * 4)
                    last_idx = (num_samples - 1) * 4
                    ir = (raw[last_idx + 0] << 8) | raw[last_idx + 1]
                    red = (raw[last_idx + 2] << 8) | raw[last_idx + 3]
                    if ir > 0:
                        self.process_sample(ir, red, now)
        except Exception:
            pass
        except Exception:
            pass


# ================= 4. OLED ANIMATION GRAPHICS RENDERER =================
class RobotFaceRenderer:
    def __init__(self, oled):
        self.oled = oled
        self.current_style = 0
        self.last_style_change = 0
        self.blink_state = 0
        self.last_blink_time = 0

    def draw_eye(self, cx, cy, rx, ry, pupil_dx=0, pupil_dy=0, is_blink=False, style=0):
        oled = self.oled
        if is_blink:
            # Closed horizontal eye line
            oled.hline(cx - rx, cy, rx * 2 + 1, 1)
            oled.hline(cx - rx + 1, cy - 1, rx * 2 - 1, 1)
            return

        if style == 0:
            # Rounded Rectangle Futuristic Visor Eyes
            oled.fill_rect(cx - rx, cy - ry, rx * 2, ry * 2, 1)
            oled.fill_rect(cx - rx + 2, cy - ry + 2, rx * 2 - 4, ry * 2 - 4, 0)
            # Center Glowing Pupil
            oled.fill_rect(cx + pupil_dx - 3, cy + pupil_dy - 3, 6, 6, 1)

        elif style == 1:
            # Happy Curved Arc Eyes (Kawaii ^_^)
            for offset_x in range(-rx, rx + 1):
                dy = int((offset_x * offset_x) / (rx * 1.6)) - ry
                oled.pixel(cx + offset_x, cy + dy, 1)
                oled.pixel(cx + offset_x, cy + dy + 1, 1)
                oled.pixel(cx + offset_x, cy + dy + 2, 1)

        elif style == 2:
            # Solid Robotic Neon Eyes with Corner Notch
            oled.fill_rect(cx - rx, cy - ry, rx * 2, ry * 2, 1)
            # Inner Cutout
            oled.fill_rect(cx - rx + 3, cy - ry + 3, rx * 2 - 6, ry * 2 - 6, 0)
            oled.fill_rect(cx + pupil_dx - 2, cy + pupil_dy - 2, 5, 5, 1)

        elif style == 3:
            # Heart Eyes (Loving DJ Robot)
            # Left bump, right bump, triangle down
            oled.fill_rect(cx - 8, cy - 8, 7, 7, 1)
            oled.fill_rect(cx + 1, cy - 8, 7, 7, 1)
            oled.fill_rect(cx - 8, cy - 3, 16, 7, 1)
            oled.fill_rect(cx - 5, cy + 4, 10, 4, 1)
            oled.fill_rect(cx - 2, cy + 8, 4, 3, 1)

    def render_normal_face(self, now, track_num):
        oled = self.oled
        oled.fill(0)

        # Style change every 2.5 seconds
        if time.ticks_diff(now, self.last_style_change) > 2500:
            self.last_style_change = now
            self.current_style = random.randint(0, 3)

        # Periodic natural blinking
        is_blinking = False
        if time.ticks_diff(now, self.last_blink_time) > 2800:
            self.last_blink_time = now
        elif time.ticks_diff(now, self.last_blink_time) < 180:
            is_blinking = True

        # Header status bar (Fits inside 128px)
        oled.print_text(f"DJ BOT T{track_num}", 2, 2, 1)
        oled.print_text("♪ NORMAL", 56, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Animated Left & Right Eyes (Centered at X=34 and X=94, Y=34)
        self.draw_eye(34, 34, 16, 12, pupil_dx=0, pupil_dy=0, is_blink=is_blinking, style=self.current_style)
        self.draw_eye(94, 34, 16, 12, pupil_dx=0, pupil_dy=0, is_blink=is_blinking, style=self.current_style)

        # Small rhythmic mouth beat indicator
        mouth_w = 12 if (now // 250) % 2 == 0 else 24
        oled.hline(64 - mouth_w // 2, 56, mouth_w, 1)

        oled.show()

    def render_calm_face(self, now, remaining_sec):
        """Serene, gentle, relaxed breathing face shown when finger is lifted during Calm Mode."""
        oled = self.oled
        oled.fill(0)

        # Top Bar (Fits inside 128px)
        oled.print_text(f"CALM {remaining_sec}s", 2, 2, 1)
        oled.print_text("ZEN ♪", 84, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Gentle closed curved serene eyes
        for dx in range(-14, 15):
            dy = int((dx * dx) / 18)
            oled.pixel(34 + dx, 32 + dy, 1)
            oled.pixel(34 + dx, 33 + dy, 1)

        for dx in range(-14, 15):
            dy = int((dx * dx) / 18)
            oled.pixel(94 + dx, 32 + dy, 1)
            oled.pixel(94 + dx, 33 + dy, 1)

        # Peaceful smile
        oled.print_text("RELAX & BREATHE", 4, 52, 1)
        oled.show()

    def render_tired_face(self, now):
        """Tired drowsy face shown when no finger is detected for >= 60 seconds."""
        oled = self.oled
        oled.fill(0)

        oled.print_text("TIRED MODE", 2, 2, 1)
        z_step = (now // 400) % 3
        z_str = "Z" * (z_step + 1)
        oled.print_text(z_str, 102, 2, 1)
        oled.hline(0, 11, 128, 1)

        # Droopy half-closed eyelids
        oled.fill_rect(18, 22, 32, 18, 1)
        oled.fill_rect(20, 24, 28, 14, 0)
        oled.fill_rect(18, 22, 32, 9, 1)
        oled.fill_rect(30, 31, 8, 4, 1)

        oled.fill_rect(78, 22, 32, 18, 1)
        oled.fill_rect(80, 24, 28, 14, 0)
        oled.fill_rect(78, 22, 32, 9, 1)
        oled.fill_rect(90, 31, 8, 4, 1)

        # Yawning / resting prompt
        oled.print_text("TOUCH SENSOR", 16, 52, 1)
        oled.show()

    def render_heartbeat_display(self, pulse_sensor, is_calm_active=False, calm_remaining=0):
        """Visual ECG-style real-time cardiac waveform and BPM telemetry display."""
        oled = self.oled
        oled.fill(0)

        # 1. Header Information Bar (Top Y=1)
        if is_calm_active:
            oled.print_text(f"CALM {calm_remaining}s", 2, 1, 1)
        else:
            oled.print_text("HEART SIGNAL", 2, 1, 1) # 12 chars = 96 px (X=2..98)

        # Heart Icon (Beats/Pumps when beat is triggered) placed at X=112..122
        if pulse_sensor.beat_event:
            # Solid Large Heart (X=112 to 122)
            oled.fill_rect(112, 1, 11, 8, 1)
            oled.pixel(112, 1, 0); oled.pixel(117, 1, 0); oled.pixel(122, 1, 0)
            oled.pixel(112, 8, 0); oled.pixel(113, 8, 0); oled.pixel(121, 8, 0); oled.pixel(122, 8, 0)
        else:
            # Regular Heart Icon Outline (X=112 to 122)
            oled.pixel(114, 1, 1); oled.pixel(120, 1, 1)
            oled.pixel(113, 2, 1); oled.pixel(115, 2, 1); oled.pixel(119, 2, 1); oled.pixel(121, 2, 1)
            oled.pixel(112, 3, 1); oled.pixel(122, 3, 1)
            oled.pixel(113, 4, 1); oled.pixel(121, 4, 1)
            oled.pixel(114, 5, 1); oled.pixel(120, 5, 1)
            oled.pixel(115, 6, 1); oled.pixel(119, 6, 1)
            oled.pixel(116, 7, 1); oled.pixel(118, 7, 1)
            oled.pixel(117, 8, 1)

        oled.hline(0, 11, 128, 1)

        # 2. Continuous Scrolling ECG / PPG Waveform Vector Plot (Y: 14 to 48)
        for x in range(127):
            y1 = pulse_sensor.wave_buf[x]
            y2 = pulse_sensor.wave_buf[x + 1]
            oled.line(x, y1, x + 1, y2, 1)

        oled.hline(0, 51, 128, 1)

        # 3. Bottom Information Bar (Y=54, Fits perfectly within 128px)
        if pulse_sensor.average_bpm > 0:
            bpm_txt = f"HEART RATE: {pulse_sensor.average_bpm} BPM" if len(f"HEART RATE: {pulse_sensor.average_bpm} BPM") <= 16 else f"BPM: {pulse_sensor.average_bpm}"
            oled.print_text(bpm_txt, 4, 54, 1)
        else:
            oled.print_text("MEASURING BPM...", 4, 54, 1)

        oled.show()


# ================= 5. MAIN CONTROLLER & STATE MACHINE =================
def main():
    print("==================================================")
    print("LOF TITAN: HEARTBEAT DJ BOT INITIALIZING...")
    print("==================================================")

    # 1. Initialize OLED
    oled = TitanOLED(sda_pin=7, scl_pin=8, is_sh1106=True)
    face_renderer = RobotFaceRenderer(oled)

    # Display Startup Screen
    oled.fill(0)
    oled.print_text("================", 0, 4, 1)
    oled.print_text("DJ BOT", 16, 18, 2)
    oled.print_text("SYSTEM STARTING", 4, 38, 1)
    oled.print_text("================", 0, 52, 1)
    oled.show()

    # 2. Initialize DFPlayer Mini MP3 Player
    dfplayer = TitanDFPlayer(uart_id=1, tx=17, rx=18)
    dfplayer.set_volume(22)
    dfplayer.set_eq(0)
    dfplayer.stop()

    # 3. Initialize MAX30102 Pulse Sensor (Check up to 5 times)
    pulse = TitanPulseSensor(sda_pin=7, scl_pin=8, addr=0x57)
    sensor_ready = pulse.init_sensor()

    oled.fill(0)
    oled.print_text("HARDWARE CHECK:", 4, 6, 1)
    if sensor_ready:
        oled.print_text(f"PULSE: {pulse.chip_type}", 4, 22, 1)
        print(f"[OK] Pulse Sensor Detected: {pulse.chip_type}")
    else:
        oled.print_text("PULSE: NOT DETECTED", 4, 22, 1)
        print("[WARN] MAX30102 Sensor not detected after 5 retries")
    oled.print_text("DFPLAYER: READY", 4, 38, 1)
    oled.print_text("STARTING DJ MODE", 4, 52, 1)
    oled.show()
    time.sleep(1.5)

    # State Machine Variables
    # Music State
    current_music_track = 2
    last_music_switch = time.ticks_ms()
    dfplayer.play_track(current_music_track)
    print(f"[MUSIC] Playing Initial Normal Track {current_music_track}")

    # Timers & Modes
    last_finger_seen_time = time.ticks_ms()
    is_tired_mode = False

    # Calm Mode State Machine
    calm_mode_active = False
    calm_mode_start_time = 0
    calm_track_stopped = False
    last_calm_mode_end_time = 0  # 10s rearm cooldown anchor

    # BPM Trigger tracking
    last_processed_bpm_len = 0

    # Display update throttling
    last_display_render_time = 0

    # Main Super-Loop
    while True:
        now = time.ticks_ms()

        # ================= A. 100 Hz PULSE SENSOR SAMPLING =================
        pulse.update_100hz()

        # ================= B. FINGER TIMING & TIRED MODE =================
        if pulse.finger_detected:
            last_finger_seen_time = now
            if is_tired_mode:
                is_tired_mode = False
                print("[STATE] Finger Detected -> Tired Mode Deactivated")
        else:
            # If no finger continuously for >= 60 seconds (60,000 ms)
            if not is_tired_mode and not calm_mode_active:
                if time.ticks_diff(now, last_finger_seen_time) >= 60000:
                    is_tired_mode = True
                    print("[STATE] No finger for 60s -> Entering Tired Mode")

        # ================= C. CALM MODE TRIGGER CHECK =================
        # Check for 2 consecutive valid BPM readings > 85 BPM (when not in calm mode and rearmed)
        rearmed = (last_calm_mode_end_time == 0) or (time.ticks_diff(now, last_calm_mode_end_time) >= 10000)

        if not calm_mode_active and rearmed and pulse.finger_detected:
            if pulse.new_beat_ready:
                pulse.new_beat_ready = False
                bpm_val = pulse.average_bpm
                if bpm_val > 85:
                    pulse.consecutive_high_bpm += 1
                    print(f"--> [HIGH BPM TRIGGER] Reading: {bpm_val} BPM (Consecutive: {pulse.consecutive_high_bpm}/2)")
                    if pulse.consecutive_high_bpm >= 2:
                        # TRIGGER CALM MODE!
                        calm_mode_active = True
                        calm_mode_start_time = now
                        calm_track_stopped = False
                        pulse.consecutive_high_bpm = 0
                        print("==================================================")
                        print(f"[CALM MODE ACTIVATED] Triggered by 2 high BPM readings ({bpm_val} BPM)!")
                        print("[MUSIC] Playing Calm Track 1 for 20 seconds...")
                        print("==================================================")
                        dfplayer.play_track(1)
                else:
                    if pulse.consecutive_high_bpm > 0:
                        print(f"[PULSE] BPM under 85 ({bpm_val} BPM) -> Resetting consecutive high count")
                    pulse.consecutive_high_bpm = 0
        elif not pulse.finger_detected:
            pulse.consecutive_high_bpm = 0
            pulse.new_beat_ready = False

        # ================= D. CALM MODE EXECUTION & TIMING =================
        calm_remaining_sec = 0
        if calm_mode_active:
            calm_elapsed_ms = time.ticks_diff(now, calm_mode_start_time)
            calm_remaining_sec = max(0, 60 - (calm_elapsed_ms // 1000))

            # Track 1 stops after exactly 20 seconds (20,000 ms) and remains silent
            if not calm_track_stopped and calm_elapsed_ms >= 20000:
                dfplayer.stop()
                calm_track_stopped = True
                print("[MUSIC] Calm Track 1 stopped after 20s. Continuing silent calm mode...")

            # Calm Mode ends after 60 seconds (60,000 ms)
            if calm_elapsed_ms >= 60000:
                calm_mode_active = False
                last_calm_mode_end_time = now  # Start 10s rearm period
                pulse.bpm_history.clear()
                pulse.average_bpm = 0
                pulse.consecutive_high_bpm = 0
                last_processed_bpm_len = 0
                
                # Resume normal music rotation (Track 2 or 3)
                last_music_switch = now
                dfplayer.play_track(current_music_track)
                print("==================================================")
                print("[CALM MODE COMPLETED] Returning to Normal DJ Mode")
                print(f"[MUSIC] Resuming Track {current_music_track}")
                print("==================================================")

        # ================= E. NORMAL MUSIC ROTATION (TRACK 2 <-> 3) =================
        if not calm_mode_active:
            if time.ticks_diff(now, last_music_switch) >= 20000:
                last_music_switch = now
                # Alternate Track 2 and Track 3 every 20 seconds
                current_music_track = 3 if current_music_track == 2 else 2
                dfplayer.play_track(current_music_track)
                print(f"[MUSIC] 20s Interval -> Alternating to Track {current_music_track}")

        # ================= F. OLED DISPLAY RENDERER (30 FPS) =================
        if time.ticks_diff(now, last_display_render_time) >= 33:
            last_display_render_time = now

            # Priority 1: Finger Placed -> ECG-style Live Heartbeat Visualisation (ALWAYS HIGHEST PRIORITY)
            if pulse.finger_detected:
                face_renderer.render_heartbeat_display(pulse, is_calm_active=calm_mode_active, calm_remaining=calm_remaining_sec)

            # Priority 2: Calm Mode Active with Finger Lifted -> Serene Calm Face
            elif calm_mode_active:
                face_renderer.render_calm_face(now, calm_remaining_sec)

            # Priority 3: Tired Mode (No finger for >= 1 min) -> Tired / Drowsy Eyes
            elif is_tired_mode:
                face_renderer.render_tired_face(now)

            # Priority 4: Normal Operation -> Animated Eyes Changing Every 2.5s
            else:
                face_renderer.render_normal_face(now, current_music_track)

        # FreeRTOS watchdog & task safety yield
        time.sleep_ms(3)


if __name__ == '__main__':
    main()
