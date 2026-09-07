# ==============================================================================
# LOF TITAN — LOST BOT COOLING & AIR PURIFICATION SYSTEM
# ==============================================================================
# Target Hardware: ESP32-S3 (LOF TITAN Board)
#
# Hardware Connections:
#   - 1.3" I2C OLED Display (SH1106 / SSD1306): SDA = GPIO 7, SCL = GPIO 8 (0x3C)
#   - DHT22 Digital Temp & Humidity: Port S1 (GPIO 2)
#   - MQ-135 Gas & Air Quality Sensor: Port S2 (GPIO 1)
#   - Motor M1 (Cooling Fan / Exhaust): GPIO 15 (PWM Speed), GPIO 16 (Dir = 0)
#   - Status LEDs: GPIO 47 (Red = Alert/Cooling Active), GPIO 48 (Green = Normal)
#   - Onboard Buzzer: GPIO 20
#   - Push Buttons: Button 1 (GPIO 39 = Fan Override), Button 2 (GPIO 40 = Unit Toggle °C/°F)
#
# Operational Logic:
#   - Continuously monitors Ambient Temperature (°C) & Air Quality / Gas (PPM).
#   - TRIGGER CONDITION:
#       * If Temperature > 30.0 °C  --> COOLING TRIGGERED
#       * If Gas / Air Quality > 300 PPM --> VENTILATION TRIGGERED
#   - When Triggered:
#       * Motor M1 turns ON at full power (cooling fan active).
#       * OLED displays real-time telemetry, warning icons, and animated spinning fan blades.
#       * Red Status LED activates; Buzzer gives confirmation alert.
#   - When Safe (Temp <= 29.5°C AND Gas <= 280 PPM):
#       * Motor M1 turns OFF (Standby mode).
#       * Green Status LED glows solid; OLED shows normal status.
# ==============================================================================

import time
import math
import framebuf
import dht
from machine import Pin, PWM, ADC, SoftI2C

# ================= 1. HARDWARE PIN DEFINITIONS =================
PIN_OLED_SDA   = 7
PIN_OLED_SCL   = 8
PIN_DHT22      = 2   # Port S1
PIN_MQ135      = 1   # Port S2 (ADC)
PIN_MOTOR_PWM  = 15  # Motor M1 PWM
PIN_MOTOR_DIR  = 16  # Motor M1 DIR
PIN_LED_RED    = 47  # Alert / Cooling Active LED
PIN_LED_GREEN  = 48  # Normal / Standby LED
PIN_BUZZER     = 20  # Onboard Buzzer
PIN_BTN_OVERRIDE = 39 # Button 1 (Manual Fan Override)
PIN_BTN_UNIT     = 40 # Button 2 (Toggle Celsius/Fahrenheit)

# ================= 2. THRESHOLD SETTINGS =================
TEMP_THRESHOLD_C   = 30.0  # Trigger fan when Temp > 30.0 °C
TEMP_HYSTERESIS_C  = 0.8   # Turn off fan when Temp < 29.2 °C
GAS_ADC_THRESHOLD  = 300   # Trigger fan when MQ-135 Analog ADC > 300
GAS_ADC_HYSTERESIS = 20    # Turn off fan when MQ-135 Analog ADC < 280
FAN_ACTIVE_SPEED   = 100   # Fan Speed % (1-100)

# ================= 3. SINGLETON PWM POOL MANAGER =================
_pwm_pool = {}

def _get_pwm(pin_num, freq=1000):
    if pin_num not in _pwm_pool:
        _pwm_pool[pin_num] = PWM(Pin(pin_num), freq=freq)
    else:
        try:
            _pwm_pool[pin_num].freq(freq)
        except Exception:
            pass
    return _pwm_pool[pin_num]

def set_motor_m1_speed(speed_pct):
    speed_pct = max(0, min(100, int(speed_pct)))
    duty_val = int(speed_pct * 10.23)
    if speed_pct > 0:
        _get_pwm(PIN_MOTOR_PWM).duty(duty_val)
        _get_pwm(PIN_MOTOR_DIR).duty(0)
    else:
        _get_pwm(PIN_MOTOR_PWM).duty(0)
        _get_pwm(PIN_MOTOR_DIR).duty(0)

# ================= 4. BUZZER & LED CONTROLLERS =================
led_red = Pin(PIN_LED_RED, Pin.OUT)
led_green = Pin(PIN_LED_GREEN, Pin.OUT)
btn_override = Pin(PIN_BTN_OVERRIDE, Pin.IN, Pin.PULL_UP)
btn_unit = Pin(PIN_BTN_UNIT, Pin.IN, Pin.PULL_UP)

def beep(freq=2000, duration_ms=80):
    try:
        bz = _get_pwm(PIN_BUZZER, freq=freq)
        bz.duty(512)
        time.sleep_ms(duration_ms)
        bz.duty(0)
    except Exception:
        pass

def alert_sound():
    beep(2400, 60)
    time.sleep_ms(40)
    beep(3000, 80)

# ================= 5. 1.3" SH1106 / SSD1306 OLED DRIVER =================
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

    def draw_progress_bar(self, x, y, w, h, val, min_val, max_val, label=""):
        self.rect(x, y, w, h, 1)
        clamped = max(min_val, min(max_val, val))
        fill_w = int(((clamped - min_val) / (max_val - min_val)) * (w - 4))
        if fill_w > 0:
            self.fill_rect(x + 2, y + 2, fill_w, h - 4, 1)

    def show(self):
        if not self.i2c:
            return
        try:
            if self.is_sh1106:
                for page in range(8):
                    page_cmd = bytearray([0x80, 0xB0 + page, 0x80, self.col_offset & 0x0F, 0x80, 0x10 | ((self.col_offset >> 4) & 0x0F)])
                    self.i2c.writeto(self.addr, page_cmd)
                    chunk = self.buf[128 * page : 128 * (page + 1)]
                    self.i2c.writeto(self.addr, b'\x40' + chunk)
            else:
                self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
                self.i2c.writeto(self.addr, b'\x40' + self.buf)
        except Exception:
            pass

# ================= 6. SENSOR DRIVERS (DHT22 & MQ-135) =================
class SensorSuite:
    def __init__(self, dht_pin=PIN_DHT22, mq_pin=PIN_MQ135):
        self.dht_pin = dht_pin
        self.mq_pin = mq_pin
        
        # Initialize DHT22
        try:
            self.dht = dht.DHT22(Pin(dht_pin))
        except Exception:
            self.dht = None
            
        # Initialize MQ-135 ADC
        try:
            self.mq_adc = ADC(Pin(mq_pin), atten=ADC.ATTN_11DB)
        except Exception:
            self.mq_adc = None

        self.last_temp_c = 25.0
        self.last_humi = 50.0
        self.last_adc = 200
        self.last_dht_read_ms = 0

    def read_dht(self):
        now = time.ticks_ms()
        # DHT22 hardware should only be sampled once every 1000ms
        if time.ticks_diff(now, self.last_dht_read_ms) >= 1200 or self.last_dht_read_ms == 0:
            if self.dht:
                try:
                    self.dht.measure()
                    t = self.dht.temperature()
                    h = self.dht.humidity()
                    if t is not None and -40 <= t <= 80:
                        self.last_temp_c = round(float(t), 1)
                    if h is not None and 0 <= h <= 100:
                        self.last_humi = round(float(h), 1)
                    self.last_dht_read_ms = now
                except Exception:
                    pass
        return self.last_temp_c, self.last_humi

    def read_mq135_adc(self):
        if not self.mq_adc:
            return 200
        try:
            # 5-sample averaged ADC reading to eliminate noise
            total = 0
            for _ in range(5):
                total += self.mq_adc.read()
                time.sleep_ms(2)
            raw = total // 5
            self.last_adc = max(0, min(4095, raw))
        except Exception:
            pass
        return self.last_adc

# ================= 7. MAIN COOLING CONTROL SYSTEM =================
def main():
    print("==================================================")
    print("  LOF TITAN — LOST BOT COOLING & AIR SYSTEM")
    print("==================================================")
    
    oled = TitanOLED(sda_pin=PIN_OLED_SDA, scl_pin=PIN_OLED_SCL, is_sh1106=True)
    sensors = SensorSuite(dht_pin=PIN_DHT22, mq_pin=PIN_MQ135)
    
    # Startup Sequence & OLED splash
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)
    oled.print_text("LOST BOT", 32, 12, size=1)
    oled.print_text("COOLING SYSTEM", 10, 26, size=1)
    oled.print_text("Initializing...", 14, 44, size=1)
    oled.show()
    
    led_red.value(1); led_green.value(1)
    beep(1800, 100); time.sleep_ms(80); beep(2400, 120)
    time.sleep_ms(1000)
    led_red.value(0); led_green.value(1)
    
    fan_running = False
    manual_override = False
    use_fahrenheit = False
    last_beep_alert = 0
    fan_anim_frame = 0
    fan_icons = ["|", "/", "-", "\\"]
    
    btn_override_prev = 1
    btn_unit_prev = 1
    
    print(f"[CONFIG] Temp Threshold : > {TEMP_THRESHOLD_C} °C")
    print(f"[CONFIG] Gas ADC Limit  : > {GAS_ADC_THRESHOLD} (0-4095 12-bit ADC)")
    print(f"[CONFIG] Fan Pinout     : M1 (GPIO {PIN_MOTOR_PWM}, {PIN_MOTOR_DIR})")
    
    while True:
        now = time.ticks_ms()
        
        # 1. Read Button Inputs
        btn_ovr_val = btn_override.value()
        btn_unit_val = btn_unit.value()
        
        # Button 1 Press: Toggle Manual Override
        if btn_override_prev == 1 and btn_ovr_val == 0:
            manual_override = not manual_override
            beep(2600 if manual_override else 1600, 80)
            print(f"[BUTTON 1] Manual Fan Override: {'ON' if manual_override else 'AUTO'}")
            time.sleep_ms(50)
            
        # Button 2 Press: Toggle Temperature Unit (°C / °F)
        if btn_unit_prev == 1 and btn_unit_val == 0:
            use_fahrenheit = not use_fahrenheit
            beep(2200, 60)
            print(f"[BUTTON 2] Temperature Unit: {'°F' if use_fahrenheit else '°C'}")
            time.sleep_ms(50)
            
        btn_override_prev = btn_ovr_val
        btn_unit_prev = btn_unit_val
        
        # 2. Acquire Sensor Readings (DHT22 Temp & MQ-135 Raw Analog ADC)
        temp_c, humi = sensors.read_dht()
        gas_adc = sensors.read_mq135_adc()
        
        temp_display = (temp_c * 1.8 + 32.0) if use_fahrenheit else temp_c
        unit_str = "F" if use_fahrenheit else "C"
        
        # 3. Evaluate Trigger Conditions
        temp_alert = temp_c > TEMP_THRESHOLD_C
        gas_alert = gas_adc > GAS_ADC_THRESHOLD
        
        should_fan_run = False
        if manual_override:
            should_fan_run = True
            trigger_reason = "MANUAL OVERRIDE"
        elif temp_alert and gas_alert:
            should_fan_run = True
            trigger_reason = "HOT & HIGH GAS!"
        elif temp_alert:
            should_fan_run = True
            trigger_reason = f"TEMP > {TEMP_THRESHOLD_C}C"
        elif gas_alert:
            should_fan_run = True
            trigger_reason = f"GAS ADC > {GAS_ADC_THRESHOLD}"
        elif fan_running:
            # Hysteresis keep-alive to prevent rapid relay/motor toggling
            if temp_c > (TEMP_THRESHOLD_C - TEMP_HYSTERESIS_C) or gas_adc > (GAS_ADC_THRESHOLD - GAS_ADC_HYSTERESIS):
                should_fan_run = True
                trigger_reason = "COOLING CYCLE"
            else:
                should_fan_run = False
                trigger_reason = "STANDBY"
        else:
            should_fan_run = False
            trigger_reason = "NORMAL / STANDBY"

        # 4. Control Fan Motor & Status LEDs
        if should_fan_run:
            if not fan_running:
                print(f"\n[ALERT] Triggered: {trigger_reason} | Temp: {temp_c:.1f}°C, Gas ADC: {gas_adc} -> FAN M1 ON")
                alert_sound()
                fan_running = True
                
            set_motor_m1_speed(FAN_ACTIVE_SPEED)
            led_red.value(1)
            led_green.value(0)
            
            # Periodic alert chirp every 4 seconds if critical
            if (temp_c > 35.0 or gas_adc > 800) and time.ticks_diff(now, last_beep_alert) > 4000:
                beep(2800, 50)
                last_beep_alert = now
        else:
            if fan_running:
                print(f"[STATUS] Normalized: Temp {temp_c:.1f}°C, Gas ADC {gas_adc} -> FAN M1 OFF")
                beep(1500, 80)
                fan_running = False
                
            set_motor_m1_speed(0)
            led_red.value(0)
            led_green.value(1)
            
        # 5. Render 1.3" OLED Dashboard (SH1106 128x64)
        oled.fill(0)
        
        # Header Banner
        fan_icon = fan_icons[fan_anim_frame % len(fan_icons)] if fan_running else "o"
        fan_anim_frame += 1
        
        oled.fill_rect(0, 0, 128, 12, 1)
        oled.print_text("LOST BOT COOLING", 4, 2, size=1, col=0)
        oled.print_text(f"[{fan_icon}]", 108, 2, size=1, col=0)
        
        # Line 1: Temperature Readout & Tag
        temp_tag = "HOT!" if temp_alert else "OK "
        oled.print_text(f"T:{temp_display:4.1f}{unit_str}", 2, 16, size=1)
        if temp_alert:
            oled.fill_rect(58, 15, 68, 10, 1)
            oled.print_text(f"[{temp_tag}] >30C", 60, 16, size=1, col=0)
        else:
            oled.print_text(f"[{temp_tag}] Max30", 60, 16, size=1, col=1)
            
        # Line 2: Humidity Readout
        oled.print_text(f"H:{humi:4.1f}% RH", 2, 28, size=1)
        # Small humidity bar
        oled.rect(80, 29, 46, 7, 1)
        fill_h = int((max(0, min(100, humi)) / 100.0) * 42)
        if fill_h > 0:
            oled.fill_rect(82, 31, fill_h, 3, 1)
            
        # Line 3: MQ-135 Analog ADC Value
        gas_tag = "GAS!" if gas_alert else "OK "
        oled.print_text(f"G:{gas_adc:4d} ADC", 2, 39, size=1)
        if gas_alert:
            oled.fill_rect(76, 38, 50, 10, 1)
            oled.print_text(f"[{gas_tag}]>300", 78, 39, size=1, col=0)
        else:
            oled.print_text(f"[{gas_tag}] Max300", 76, 39, size=1, col=1)

        # Line 4: Bottom Fan & System Status Bar
        oled.rect(0, 50, 128, 14, 1)
        if fan_running:
            oled.fill_rect(1, 51, 126, 12, 1)
            oled.print_text(f"FAN M1: ON (100%)", 8, 53, size=1, col=0)
        else:
            oled.print_text("FAN M1: STANDBY", 12, 53, size=1, col=1)
            
        oled.show()
        
        # Telemetry Serial Output
        if fan_anim_frame % 5 == 0:
            print(f"[TELEMETRY] Temp: {temp_c:.1f}°C | Humi: {humi:.1f}% | MQ-135 ADC: {gas_adc} (Limit >{GAS_ADC_THRESHOLD}) | Fan M1: {'ACTIVE (100%)' if fan_running else 'OFF'} | {trigger_reason}")
            
        time.sleep_ms(80)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n[STOP] Program stopped by user.")
        set_motor_m1_speed(0)
        led_red.value(0)
        led_green.value(0)
