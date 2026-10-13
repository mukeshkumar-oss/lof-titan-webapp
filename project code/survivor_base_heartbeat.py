from machine import Pin, SoftI2C, WDT, PWM
import network
import espnow
import framebuf
import time
import gc

ROLE = "SURVIVOR"
PEER_ROLE = "MILITARY"

SW1_PIN = 39
SW2_PIN = 40
SW3_PIN = 41
SW4_PIN = 42
BUZZER_PIN = 20
STATUS_LED_PIN = 47
SDA_PIN = 7
SCL_PIN = 8
OLED_ADDR = 0x3C

DEBOUNCE_MS = 60
HEARTBEAT_INTERVAL_MS = 1000
LINK_TIMEOUT_MS = 4000
DISCONNECT_BEEP_INTERVAL_MS = 3000
MESSAGE_TONE_FREQ = 2200
MESSAGE_TONE_MS = 800
DISCONNECT_TONE_FREQ = 650
DISCONNECT_TONE_MS = 350
BUZZER_DUTY = 28000
LED_ON = 1
LED_OFF = 0

PRESETS = (
    "HELP REQUIRED",
    "I AM SAFE",
    "NEED MEDIC",
    "LOW FOOD",
    "LOW WATER",
    "SEND RESCUE",
    "CANT MOVE",
    "NEED EVAC"
)
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ "

try:
    wdt = WDT(0, timeout=8000)
    wdt.feed()
    print("[WDT] READY")
except Exception as e:
    wdt = None
    print("[WDT] ERROR:", e)

def feed_wdt():
    if wdt is not None:
        try:
            wdt.feed()
        except:
            pass

# Status LED: ON = peer link missing, OFF = peer link healthy.
try:
    status_led = Pin(STATUS_LED_PIN, Pin.OUT)
    status_led.value(LED_ON)
    print("[STATUS LED] READY GPIO47")
except Exception as e:
    status_led = None
    print("[STATUS LED] ERROR:", e)

def set_disconnect_led(disconnected):
    if status_led is None:
        return
    try:
        status_led.value(LED_ON if disconnected else LED_OFF)
    except:
        pass

# Buzzer supports a normal message tone and a lower disconnect tone.
try:
    buzzer = PWM(Pin(BUZZER_PIN))
    buzzer.freq(MESSAGE_TONE_FREQ)
    buzzer.duty_u16(0)
    print("[BUZZER] READY GPIO20")
except Exception as e:
    buzzer = None
    print("[BUZZER] ERROR:", e)

buzzer_active = False
buzzer_started = 0
buzzer_duration = 0

def start_tone(freq, duration_ms):
    global buzzer_active, buzzer_started, buzzer_duration
    if buzzer is None:
        return
    try:
        buzzer.freq(freq)
        buzzer.duty_u16(BUZZER_DUTY)
        buzzer_started = time.ticks_ms()
        buzzer_duration = duration_ms
        buzzer_active = True
    except Exception as e:
        print("[BUZZER ERROR]", e)

def buzzer_off():
    global buzzer_active
    if buzzer is not None:
        try:
            buzzer.duty_u16(0)
        except:
            pass
    buzzer_active = False

def message_tone():
    start_tone(MESSAGE_TONE_FREQ, MESSAGE_TONE_MS)

def disconnect_tone():
    # Lower tone, clearly different from the received-message alert.
    start_tone(DISCONNECT_TONE_FREQ, DISCONNECT_TONE_MS)

def update_buzzer():
    if not buzzer_active:
        return
    if time.ticks_diff(time.ticks_ms(), buzzer_started) >= buzzer_duration:
        buzzer_off()

def safe_wait(ms):
    start = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), start) < ms:
        feed_wdt()
        update_buzzer()
        time.sleep_ms(20)

class Button:
    def __init__(self, gpio):
        self.pin = Pin(gpio, Pin.IN, Pin.PULL_UP)
        value = self.pin.value()
        self.raw_state = value
        self.stable_state = value
        self.last_change = time.ticks_ms()
        self.press_event = False

    def update(self):
        now = time.ticks_ms()
        raw = self.pin.value()
        self.press_event = False
        if raw != self.raw_state:
            self.raw_state = raw
            self.last_change = now
        if raw != self.stable_state and time.ticks_diff(now, self.last_change) >= DEBOUNCE_MS:
            previous = self.stable_state
            self.stable_state = raw
            if previous == 1 and raw == 0:
                self.press_event = True

    def pressed(self):
        return self.press_event

sw1 = Button(SW1_PIN)
sw2 = Button(SW2_PIN)
sw3 = Button(SW3_PIN)
sw4 = Button(SW4_PIN)

class SH1106(framebuf.FrameBuffer):
    def __init__(self, i2c, width=128, height=64, addr=0x3C):
        self.i2c = i2c
        self.width = width
        self.height = height
        self.addr = addr
        self.pages = height // 8
        self.buffer = bytearray(width * self.pages)
        super().__init__(self.buffer, width, height, framebuf.MONO_VLSB)
        self.init_display()

    def command(self, cmd):
        feed_wdt()
        self.i2c.writeto(self.addr, bytes((0x00, cmd)))

    def init_display(self):
        commands = (
            0xAE, 0xD5, 0x80, 0xA8, 0x3F, 0xD3, 0x00, 0x40,
            0xAD, 0x8B, 0xA1, 0xC8, 0xDA, 0x12, 0x81, 0x7F,
            0xD9, 0x22, 0xDB, 0x40, 0xA4, 0xA6, 0xAF
        )
        for cmd in commands:
            self.command(cmd)
        self.fill(0)
        self.show()

    def show(self):
        for page_number in range(self.pages):
            feed_wdt()
            self.command(0xB0 + page_number)
            self.command(0x02)
            self.command(0x10)
            start = page_number * self.width
            end = start + self.width
            self.i2c.writeto(self.addr, b'\x40' + self.buffer[start:end])

OLED_OK = False
oled = None
print()
print("==============================")
print("SURVIVOR BASE")
print("==============================")
try:
    i2c = SoftI2C(scl=Pin(SCL_PIN), sda=Pin(SDA_PIN), freq=100000, timeout=5000)
    feed_wdt()
    i2c.writeto(OLED_ADDR, b'\x00\xAE')
    oled = SH1106(i2c, 128, 64, OLED_ADDR)
    OLED_OK = True
    print("[OLED] READY")
except Exception as e:
    OLED_OK = False
    oled = None
    print("[OLED] ERROR:", e)

PAGE_MENU = 0
PAGE_PRESET = 1
PAGE_MANUAL = 2
page = PAGE_MENU
menu_index = 0
preset_index = 0
selected_preset = -1
manual_index = 0
typed_message = ""
peer_message = ""
popup_active = False
popup_title = ""
popup_message = ""
display_dirty = True

BIG_FONT = {
    "A":["01110","10001","10001","11111","10001","10001","10001"],
    "B":["11110","10001","10001","11110","10001","10001","11110"],
    "C":["01111","10000","10000","10000","10000","10000","01111"],
    "D":["11110","10001","10001","10001","10001","10001","11110"],
    "E":["11111","10000","10000","11110","10000","10000","11111"],
    "F":["11111","10000","10000","11110","10000","10000","10000"],
    "G":["01111","10000","10000","10111","10001","10001","01111"],
    "H":["10001","10001","10001","11111","10001","10001","10001"],
    "I":["11111","00100","00100","00100","00100","00100","11111"],
    "J":["00111","00010","00010","00010","10010","10010","01100"],
    "K":["10001","10010","10100","11000","10100","10010","10001"],
    "L":["10000","10000","10000","10000","10000","10000","11111"],
    "M":["10001","11011","10101","10101","10001","10001","10001"],
    "N":["10001","11001","10101","10011","10001","10001","10001"],
    "O":["01110","10001","10001","10001","10001","10001","01110"],
    "P":["11110","10001","10001","11110","10000","10000","10000"],
    "Q":["01110","10001","10001","10001","10101","10010","01101"],
    "R":["11110","10001","10001","11110","10100","10010","10001"],
    "S":["01111","10000","10000","01110","00001","00001","11110"],
    "T":["11111","00100","00100","00100","00100","00100","00100"],
    "U":["10001","10001","10001","10001","10001","10001","01110"],
    "V":["10001","10001","10001","10001","10001","01010","00100"],
    "W":["10001","10001","10001","10101","10101","11011","10001"],
    "X":["10001","10001","01010","00100","01010","10001","10001"],
    "Y":["10001","10001","01010","00100","00100","00100","00100"],
    "Z":["11111","00001","00010","00100","01000","10000","11111"]
}

def center_text(text, y, colour=1):
    if not OLED_OK:
        return
    x = (128 - len(text) * 8) // 2
    if x < 0:
        x = 0
    oled.text(text, x, y, colour)

def tail(text, count):
    return text if len(text) <= count else text[-count:]

def wrap_text(text, maximum=15):
    if not text:
        return []
    words = text.split(" ")
    lines = []
    current = ""
    for word in words:
        if word == "":
            if current:
                current += " "
            continue
        while len(word) > maximum:
            if current:
                lines.append(current)
                current = ""
            lines.append(word[:maximum])
            word = word[maximum:]
        if not word:
            continue
        if current == "":
            current = word
        elif len(current) + 1 + len(word) <= maximum:
            current += " " + word
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]

def draw_big_char(character, x, y, scale=4):
    pattern = BIG_FONT.get(character)
    if pattern is None:
        return
    for row in range(7):
        for column in range(5):
            if pattern[row][column] == "1":
                oled.fill_rect(x + column * scale, y + row * scale, scale, scale, 1)

def show_startup():
    if not OLED_OK:
        return
    oled.fill(0)
    oled.rect(0, 0, 128, 64, 1)
    center_text("SURVIVOR", 7)
    center_text("BASE", 20)
    center_text("COMMUNICATION", 36)
    center_text("READY", 50)
    oled.show()

def draw_menu():
    oled.fill(0)
    center_text("SELECT MODE", 0)
    oled.hline(0, 11, 128, 1)
    if menu_index == 0:
        oled.fill_rect(14, 18, 100, 17, 1)
        center_text("PRESET", 23, 0)
    else:
        oled.rect(14, 18, 100, 17, 1)
        center_text("PRESET", 23)
    if menu_index == 1:
        oled.fill_rect(14, 42, 100, 17, 1)
        center_text("MANUAL", 47, 0)
    else:
        oled.rect(14, 42, 100, 17, 1)
        center_text("MANUAL", 47)

def draw_preset():
    oled.fill(0)
    center_text("PRESET MODE", 0)
    oled.hline(0, 10, 128, 1)
    center_text(str(preset_index + 1) + "/" + str(len(PRESETS)), 13)
    lines = wrap_text(PRESETS[preset_index], 15)
    if len(lines) == 1:
        center_text(lines[0], 33)
    elif len(lines) == 2:
        center_text(lines[0], 27)
        center_text(lines[1], 39)
    elif len(lines) >= 3:
        center_text(lines[0], 22)
        center_text(lines[1], 34)
        center_text(lines[2], 46)
    center_text("SELECTED" if selected_preset == preset_index else "SW3 SELECT", 54)

def draw_manual():
    oled.fill(0)
    center_text("MANUAL MODE", 0)
    oled.hline(0, 10, 128, 1)
    character = LETTERS[manual_index]
    if character == " ":
        center_text("SPACE", 22)
    else:
        draw_big_char(character, 54, 14, 4)
    oled.hline(0, 46, 128, 1)
    oled.text("MSG:", 0, 54, 1)
    oled.text(tail(typed_message, 12), 32, 54, 1)

def draw_popup():
    oled.fill(0)
    center_text(popup_title, 0)
    oled.hline(0, 11, 128, 1)
    text = popup_message[-45:] if len(popup_message) > 45 else popup_message
    lines = wrap_text(text, 15)
    if len(lines) == 0:
        center_text("EMPTY", 30)
    elif len(lines) == 1:
        center_text(lines[0], 30)
    elif len(lines) == 2:
        center_text(lines[0], 25)
        center_text(lines[1], 38)
    else:
        center_text(lines[0], 20)
        center_text(lines[1], 32)
        center_text(lines[2], 44)
    center_text("PRESS ANY KEY", 55)

def show_popup(title, message):
    global popup_active, popup_title, popup_message, display_dirty
    popup_title = title
    popup_message = message
    popup_active = True
    display_dirty = True

def close_popup():
    global popup_active, display_dirty
    popup_active = False
    buzzer_off()
    display_dirty = True

def draw_display():
    global display_dirty
    if not OLED_OK:
        display_dirty = False
        return
    try:
        feed_wdt()
        if popup_active:
            draw_popup()
        elif page == PAGE_MENU:
            draw_menu()
        elif page == PAGE_PRESET:
            draw_preset()
        elif page == PAGE_MANUAL:
            draw_manual()
        oled.show()
    except Exception as e:
        print("[OLED ERROR]", e)
    display_dirty = False

show_startup()
safe_wait(2000)

wlan = network.WLAN(network.STA_IF)
wlan.active(True)
feed_wdt()
try:
    mac = wlan.config("mac")
    print("[SURVIVOR MAC]", ":".join("{:02X}".format(x) for x in mac))
except Exception as e:
    print("[MAC ERROR]", e)

esp = espnow.ESPNow()
esp.active(True)
BROADCAST = b'\xff\xff\xff\xff\xff\xff'
try:
    esp.add_peer(BROADCAST)
except:
    pass
print("[ESP-NOW] READY")

# Link supervision. ESP-NOW itself is connectionless, so the two boards
# exchange heartbeat packets and infer link loss from heartbeat timeout.
boot_time = time.ticks_ms()
last_heartbeat_sent = time.ticks_add(boot_time, -HEARTBEAT_INTERVAL_MS)
last_peer_seen = boot_time
peer_seen_once = False
link_connected = False
next_disconnect_beep = time.ticks_add(boot_time, LINK_TIMEOUT_MS)

def send_packet(msg_type, message, quiet=False):
    packet = msg_type + "|" + ROLE + "|" + message
    try:
        feed_wdt()
        esp.send(BROADCAST, packet.encode(), False)
        if not quiet:
            print("TX:", packet)
        return True
    except Exception as e:
        if not quiet:
            print("[TX ERROR]", e)
        return False

def send_heartbeat(now):
    global last_heartbeat_sent
    if time.ticks_diff(now, last_heartbeat_sent) >= HEARTBEAT_INTERVAL_MS:
        send_packet("H", "PING", True)
        last_heartbeat_sent = now

def mark_peer_seen(now):
    global last_peer_seen, peer_seen_once, link_connected, next_disconnect_beep
    last_peer_seen = now
    peer_seen_once = True
    if not link_connected:
        link_connected = True
        set_disconnect_led(False)
        buzzer_off()
        next_disconnect_beep = time.ticks_add(now, DISCONNECT_BEEP_INTERVAL_MS)
        print("[LINK] CONNECTED TO", PEER_ROLE)

def update_link_status(now):
    global link_connected, next_disconnect_beep
    healthy = peer_seen_once and time.ticks_diff(now, last_peer_seen) <= LINK_TIMEOUT_MS
    if healthy:
        if not link_connected:
            link_connected = True
            print("[LINK] CONNECTED TO", PEER_ROLE)
        set_disconnect_led(False)
        return

    if link_connected:
        link_connected = False
        set_disconnect_led(True)
        next_disconnect_beep = now
        print("[LINK] DISCONNECTED FROM", PEER_ROLE)
    else:
        set_disconnect_led(True)

    # During initial startup, wait LINK_TIMEOUT_MS before warning by buzzer.
    if not peer_seen_once and time.ticks_diff(now, boot_time) < LINK_TIMEOUT_MS:
        return

    if time.ticks_diff(now, next_disconnect_beep) >= 0:
        disconnect_tone()
        next_disconnect_beep = time.ticks_add(now, DISCONNECT_BEEP_INTERVAL_MS)

def receive_packets():
    global peer_message
    for _ in range(5):
        feed_wdt()
        try:
            host, message = esp.irecv(0)
        except:
            return
        if message is None:
            return
        try:
            text = message.decode()
        except:
            continue
        parts = text.split("|", 2)
        if len(parts) != 3:
            continue
        msg_type, sender, data = parts
        if sender != PEER_ROLE:
            continue

        now = time.ticks_ms()
        mark_peer_seen(now)

        if msg_type == "H":
            continue

        if msg_type == "P" or msg_type == "M":
            peer_message = data
            print("RX FROM", sender + ":", data)
            message_tone()
            show_popup("FROM MILITARY", data)

def menu_previous():
    global menu_index, display_dirty
    menu_index = 1 if menu_index == 0 else 0
    display_dirty = True

def menu_next():
    global menu_index, display_dirty
    menu_index = 0 if menu_index == 1 else 1
    display_dirty = True

def select_mode():
    global page, preset_index, selected_preset, manual_index, typed_message, display_dirty
    if menu_index == 0:
        page = PAGE_PRESET
        preset_index = 0
        selected_preset = -1
    else:
        page = PAGE_MANUAL
        manual_index = 0
        typed_message = ""
    display_dirty = True

def preset_previous():
    global preset_index, selected_preset, display_dirty
    preset_index -= 1
    if preset_index < 0:
        preset_index = len(PRESETS) - 1
    selected_preset = -1
    display_dirty = True

def preset_next():
    global preset_index, selected_preset, display_dirty
    preset_index += 1
    if preset_index >= len(PRESETS):
        preset_index = 0
    selected_preset = -1
    display_dirty = True

def select_preset():
    global selected_preset, display_dirty
    selected_preset = preset_index
    print("SELECTED:", PRESETS[selected_preset])
    display_dirty = True

def send_selected_preset():
    global page, menu_index, selected_preset, display_dirty
    if selected_preset != preset_index:
        show_popup("NOT SELECTED", "PRESS SW3")
        return
    message = PRESETS[selected_preset]
    if send_packet("P", message):
        page = PAGE_MENU
        menu_index = 0
        selected_preset = -1
        show_popup("MESSAGE SENT", message)
    display_dirty = True

def manual_previous():
    global manual_index, display_dirty
    manual_index -= 1
    if manual_index < 0:
        manual_index = len(LETTERS) - 1
    display_dirty = True

def manual_next():
    global manual_index, display_dirty
    manual_index += 1
    if manual_index >= len(LETTERS):
        manual_index = 0
    display_dirty = True

def add_manual_letter():
    global typed_message, display_dirty
    typed_message += LETTERS[manual_index]
    if len(typed_message) > 60:
        typed_message = typed_message[-60:]
    print("MESSAGE:", typed_message)
    display_dirty = True

def send_manual_message():
    global typed_message, manual_index, page, menu_index, display_dirty
    if len(typed_message) == 0:
        show_popup("NO MESSAGE", "PRESS SW3")
        return
    message = typed_message
    if send_packet("M", message):
        typed_message = ""
        manual_index = 0
        page = PAGE_MENU
        menu_index = 0
        show_popup("MESSAGE SENT", message)
    display_dirty = True

page = PAGE_MENU
display_dirty = True
draw_display()

print()
print("==============================")
print("SURVIVOR BASE READY")
print("SW1 = PREVIOUS")
print("SW2 = NEXT")
print("SW3 = SELECT")
print("SW4 = SEND")
print("GPIO47 LED = DISCONNECTED")
print("GPIO20 HIGH TONE = MESSAGE")
print("GPIO20 LOW TONE = DISCONNECTED")
print("==============================")

last_gc = time.ticks_ms()

while True:
    feed_wdt()
    now = time.ticks_ms()

    send_heartbeat(now)
    receive_packets()
    update_link_status(now)
    update_buzzer()

    sw1.update()
    sw2.update()
    sw3.update()
    sw4.update()

    any_button = sw1.pressed() or sw2.pressed() or sw3.pressed() or sw4.pressed()

    if popup_active:
        if any_button:
            close_popup()
    else:
        if page == PAGE_MENU:
            if sw1.pressed():
                menu_previous()
            if sw2.pressed():
                menu_next()
            if sw3.pressed():
                select_mode()
        elif page == PAGE_PRESET:
            if sw1.pressed():
                preset_previous()
            if sw2.pressed():
                preset_next()
            if sw3.pressed():
                select_preset()
            if sw4.pressed():
                send_selected_preset()
        elif page == PAGE_MANUAL:
            if sw1.pressed():
                manual_previous()
            if sw2.pressed():
                manual_next()
            if sw3.pressed():
                add_manual_letter()
            if sw4.pressed():
                send_manual_message()

    if display_dirty:
        draw_display()

    if time.ticks_diff(now, last_gc) >= 5000:
        gc.collect()
        last_gc = now

    feed_wdt()
    update_buzzer()
    time.sleep_ms(5)
