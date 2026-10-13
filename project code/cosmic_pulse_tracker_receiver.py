from machine import Pin, I2C, PWM
import network
import espnow
import framebuf
import time
import struct


# =========================================================
# PINS - LOF TITAN ESP32-S3
# =========================================================

OLED_SDA = 7
OLED_SCL = 8

BUZZER_PIN = 20

RED_LED_PIN = 47
GREEN_LED_PIN = 48


# =========================================================
# SH1106 OLED DRIVER
# No external sh1106.py required
# =========================================================

class SH1106(framebuf.FrameBuffer):

    def __init__(self, width, height, i2c, addr=0x3C):

        self.width = width
        self.height = height
        self.i2c = i2c
        self.addr = addr

        self.pages = height // 8

        self.buffer = bytearray(
            self.width * self.pages
        )

        super().__init__(
            self.buffer,
            self.width,
            self.height,
            framebuf.MONO_VLSB
        )

        self.init_display()


    def write_cmd(self, cmd):

        self.i2c.writeto(
            self.addr,
            bytes([0x80, cmd])
        )


    def init_display(self):

        cmds = [
            0xAE,       # Display OFF

            0xD5, 0x80, # Clock
            0xA8, 0x3F, # Multiplex 64
            0xD3, 0x00, # Display offset
            0x40,       # Start line

            0xAD, 0x8B, # DC-DC ON

            0xA1,       # Segment remap
            0xC8,       # COM scan direction

            0xDA, 0x12, # COM pins
            0x81, 0x7F, # Contrast

            0xD9, 0x22, # Pre-charge
            0xDB, 0x35, # VCOM

            0xA4,       # Display follows RAM
            0xA6,       # Normal display

            0xAF        # Display ON
        ]

        for cmd in cmds:
            self.write_cmd(cmd)

        self.fill(0)
        self.show()


    def show(self):

        for page in range(self.pages):

            self.write_cmd(
                0xB0 + page
            )

            # SH1106 normally has 2-pixel RAM offset
            self.write_cmd(0x02)
            self.write_cmd(0x10)

            start = page * self.width
            end = start + self.width

            data = bytearray(
                self.width + 1
            )

            data[0] = 0x40

            data[1:] = self.buffer[
                start:end
            ]

            self.i2c.writeto(
                self.addr,
                data
            )


# =========================================================
# ZONES
# =========================================================

ZONE_SEARCHING = 0
ZONE_FAR = 1
ZONE_NEAR = 2
ZONE_HERE = 3


# =========================================================
# TIMINGS
# =========================================================

SIGNAL_TIMEOUT_MS = 1800

FEEDBACK_INTERVAL_MS = 150

DISPLAY_INTERVAL_MS = 250


# =========================================================
# GLOBAL VARIABLES
# =========================================================

latest_rssi = -100

last_packet_time = 0
last_feedback_time = 0
last_display_time = 0

transmitter_mac = None

packet_received = False

current_buzzer_frequency = 0

added_peers = set()


# =========================================================
# LED SETUP
# =========================================================

red_led = Pin(
    RED_LED_PIN,
    Pin.OUT
)

green_led = Pin(
    GREEN_LED_PIN,
    Pin.OUT
)

red_led.value(0)
green_led.value(0)


# =========================================================
# BUZZER SETUP
# =========================================================

buzzer = PWM(
    Pin(BUZZER_PIN)
)

buzzer.freq(500)
buzzer.duty_u16(0)


# =========================================================
# I2C SETUP
# =========================================================

i2c = I2C(
    0,
    sda=Pin(OLED_SDA),
    scl=Pin(OLED_SCL),
    freq=100000
)


print()
print("==============================")
print("I2C SCAN")
print("==============================")

devices = i2c.scan()

print(devices)

if 0x3C in devices:
    print("OLED FOUND AT 0x3C")
else:
    print("WARNING: OLED NOT FOUND")


# =========================================================
# OLED
# =========================================================

display = SH1106(
    128,
    64,
    i2c,
    0x3C
)


# =========================================================
# ZONE FUNCTIONS
# =========================================================

def zone_text(zone):

    if zone == ZONE_HERE:
        return "GIBSON IS HERE"

    if zone == ZONE_NEAR:
        return "GIBSON IS NEAR"

    if zone == ZONE_FAR:
        return "GIBSON IS FAR"

    return "SEARCHING"


def zone_bars(zone):

    if zone == ZONE_HERE:
        return 8

    if zone == ZONE_NEAR:
        return 5

    if zone == ZONE_FAR:
        return 2

    return 1


# =========================================================
# RSSI -> ZONE
# =========================================================

def zone_from_rssi(rssi):

    if rssi >= -50:
        return ZONE_HERE

    elif rssi >= -65:
        return ZONE_NEAR

    elif rssi >= -80:
        return ZONE_FAR

    else:
        return ZONE_SEARCHING


# =========================================================
# OLED CENTRE TEXT
# =========================================================

def centre_text(text, y):

    width = len(text) * 8

    x = (128 - width) // 2

    if x < 0:
        x = 0

    display.text(
        text,
        x,
        y,
        1
    )


# =========================================================
# SIGNAL BARS
# =========================================================

def draw_signal_bars(bars):

    start_x = 16
    bottom_y = 50

    for i in range(8):

        height = 4 + (i * 4)

        x = start_x + (i * 12)

        y = bottom_y - height

        if i < bars:

            display.fill_rect(
                x,
                y,
                8,
                height,
                1
            )

        else:

            display.rect(
                x,
                y,
                8,
                height,
                1
            )


# =========================================================
# OLED SCREEN
# =========================================================

def show_receiver_screen(zone):

    display.fill(0)

    centre_text(
        "GIBSON SIGNAL",
        0
    )

    draw_signal_bars(
        zone_bars(zone)
    )

    centre_text(
        zone_text(zone),
        56
    )

    display.show()


# =========================================================
# LED CONTROL
# =========================================================

def update_leds(zone):

    if zone == ZONE_FAR:

        red_led.value(1)
        green_led.value(0)


    elif zone == ZONE_NEAR or zone == ZONE_HERE:

        red_led.value(0)
        green_led.value(1)


    else:

        red_led.value(0)
        green_led.value(0)


# =========================================================
# BUZZER
# =========================================================

def buzzer_on(frequency):

    global current_buzzer_frequency

    if frequency != current_buzzer_frequency:

        buzzer.freq(
            frequency
        )

        current_buzzer_frequency = frequency

    buzzer.duty_u16(
        32768
    )


def buzzer_off():

    buzzer.duty_u16(0)


# =========================================================
# BUZZER PATTERN
# =========================================================

def update_receiver_buzzer(zone):

    now = time.ticks_ms()


    if zone == ZONE_SEARCHING:

        frequency = 500
        period = 1200
        on_time = 120


    elif zone == ZONE_FAR:

        frequency = 700
        period = 900
        on_time = 130


    elif zone == ZONE_NEAR:

        frequency = 1300
        period = 350
        on_time = 140


    else:

        frequency = 2200
        period = 150
        on_time = 110


    if (now % period) < on_time:

        buzzer_on(
            frequency
        )

    else:

        buzzer_off()


# =========================================================
# WIFI SETUP
# =========================================================

try:

    sta = network.WLAN(
        network.WLAN.IF_STA
    )

except:

    sta = network.WLAN(
        network.STA_IF
    )


sta.active(True)


try:
    sta.disconnect()
except:
    pass


try:

    sta.config(
        pm=network.WLAN.PM_NONE
    )

except:
    pass


# =========================================================
# PRINT MAC
# =========================================================

mac = sta.config("mac")

mac_text = ":".join(
    "{:02X}".format(x)
    for x in mac
)

print()
print("==============================")
print("ESP32-S3 RECEIVER")
print("==============================")

print(
    "Receiver MAC:",
    mac_text
)


# =========================================================
# ESP-NOW
# =========================================================

esp = espnow.ESPNow()

esp.active(True)


# =========================================================
# ADD PEER
# =========================================================

def add_peer_if_needed(mac):

    if mac is None:
        return

    mac = bytes(mac)

    if mac in added_peers:
        return

    try:

        esp.add_peer(
            mac,
            channel=0,
            encrypt=False
        )

        added_peers.add(
            mac
        )

        print(
            "Peer added:",
            ":".join(
                "{:02X}".format(x)
                for x in mac
            )
        )

    except OSError as error:

        # Peer may already exist.
        added_peers.add(mac)


# =========================================================
# GET RSSI
# =========================================================

def get_peer_rssi(mac):

    if mac is None:
        return -100

    try:

        peer_info = esp.peers_table.get(
            bytes(mac)
        )

        if peer_info is not None:

            return peer_info[0]

    except Exception:
        pass

    return -100


# =========================================================
# INITIAL SCREEN
# =========================================================

show_receiver_screen(
    ZONE_SEARCHING
)


print()
print("Receiver ready")
print("Waiting for GIBSON beacon...")
print()


# =========================================================
# MAIN LOOP
# =========================================================

while True:

    now = time.ticks_ms()


    # -----------------------------------------------------
    # RECEIVE ESP-NOW
    # -----------------------------------------------------

    try:

        host, msg = esp.recv(0)


        if host is not None and msg is not None:

            host = bytes(host)


            # Arduino BeaconPacket:
            #
            # uint32_t counter
            #
            # Exactly 4 bytes

            if len(msg) == 4:

                transmitter_mac = host


                counter = struct.unpack(
                    "<I",
                    msg
                )[0]


                latest_rssi = get_peer_rssi(
                    transmitter_mac
                )


                last_packet_time = now

                packet_received = True


                print(
                    "Beacon:",
                    counter,
                    "| RSSI:",
                    latest_rssi,
                    "dBm"
                )


    except Exception as error:

        print(
            "RX ERROR:",
            error
        )


    # -----------------------------------------------------
    # DETERMINE CURRENT ZONE
    # -----------------------------------------------------

    if time.ticks_diff(
        now,
        last_packet_time
    ) <= SIGNAL_TIMEOUT_MS:

        current_zone = zone_from_rssi(
            latest_rssi
        )


    else:

        current_zone = ZONE_SEARCHING


    # -----------------------------------------------------
    # LEDs
    # -----------------------------------------------------

    update_leds(
        current_zone
    )


    # -----------------------------------------------------
    # BUZZER
    # -----------------------------------------------------

    update_receiver_buzzer(
        current_zone
    )


    # -----------------------------------------------------
    # OLED UPDATE
    # -----------------------------------------------------

    if time.ticks_diff(
        now,
        last_display_time
    ) >= DISPLAY_INTERVAL_MS:

        last_display_time = now

        show_receiver_screen(
            current_zone
        )


    # -----------------------------------------------------
    # SEND ZONE BACK TO TRANSMITTER
    # -----------------------------------------------------

    if packet_received:

        if time.ticks_diff(
            now,
            last_feedback_time
        ) >= FEEDBACK_INTERVAL_MS:

            packet_received = False

            last_feedback_time = now


            if transmitter_mac is not None:

                add_peer_if_needed(
                    transmitter_mac
                )


                # Arduino FeedbackPacket:
                #
                # uint8_t zone
                #
                # Exactly 1 byte

                feedback_packet = bytes([
                    current_zone
                ])


                try:

                    esp.send(
                        transmitter_mac,
                        feedback_packet,
                        False
                    )


                    print(
                        "Zone:",
                        zone_text(current_zone)
                    )


                except Exception as error:

                    print(
                        "TX ERROR:",
                        error
                    )


    time.sleep_ms(20)