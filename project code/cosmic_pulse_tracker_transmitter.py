from machine import Pin, I2C, PWM
import network
import espnow
import framebuf
import struct
import time


# =========================================================
# ESP32-S3 TRANSMITTER
#
# OLED:
# SEARCHING -> Moving eyes
# FAR       -> Crying eyes
# NEAR      -> Fast scanning eyes
# HERE      -> Happy blinking eyes + smile
#
# NO TEXT ON OLED
#
# BUZZER:
# ON ONLY WHEN HERE
#
# PINOUT:
# OLED SDA -> GPIO 7
# OLED SCL -> GPIO 8
# BUZZER   -> GPIO 20
# =========================================================


# =========================================================
# PINS
# =========================================================

OLED_SDA = 7
OLED_SCL = 8
BUZZER_PIN = 20


# =========================================================
# ZONES
# =========================================================

ZONE_SEARCHING = 0
ZONE_FAR = 1
ZONE_NEAR = 2
ZONE_HERE = 3


# =========================================================
# TIMING
# =========================================================

SEND_INTERVAL_MS = 200

FEEDBACK_TIMEOUT_MS = 1800

DISPLAY_INTERVAL_MS = 55


# =========================================================
# BROADCAST ADDRESS
# =========================================================

BROADCAST = b'\xFF\xFF\xFF\xFF\xFF\xFF'


# =========================================================
# SH1106 INTERNAL DRIVER
# NO EXTERNAL sh1106.py NEEDED
# =========================================================

class SH1106(framebuf.FrameBuffer):

    def __init__(self, width, height, i2c, addr=0x3C):

        self.width = width
        self.height = height
        self.i2c = i2c
        self.addr = addr

        self.pages = height // 8

        self.buffer = bytearray(
            width * self.pages
        )

        super().__init__(
            self.buffer,
            width,
            height,
            framebuf.MONO_VLSB
        )

        self.init_display()


    def write_cmd(self, cmd):

        self.i2c.writeto(
            self.addr,
            bytes((0x80, cmd))
        )


    def init_display(self):

        commands = [

            0xAE,

            0xD5,
            0x80,

            0xA8,
            0x3F,

            0xD3,
            0x00,

            0x40,

            0xAD,
            0x8B,

            0xA1,

            0xC8,

            0xDA,
            0x12,

            0x81,
            0x7F,

            0xD9,
            0x22,

            0xDB,
            0x35,

            0xA4,

            0xA6,

            0xAF
        ]

        for command in commands:
            self.write_cmd(command)

        self.fill(0)
        self.show()


    def show(self):

        for page in range(self.pages):

            self.write_cmd(
                0xB0 + page
            )

            # SH1106 column offset
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
# I2C
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
# BUZZER
# =========================================================

buzzer = PWM(
    Pin(BUZZER_PIN),
    freq=2200,
    duty_u16=0
)


# =========================================================
# GLOBAL VARIABLES
# =========================================================

beacon_counter = 0

last_send_time = 0

last_feedback_time = 0

last_display_time = 0

current_zone = ZONE_SEARCHING

buzzer_active = False


# =========================================================
# AKNO EYE DIMENSIONS
# =========================================================

LEFT_EYE_X = 2

RIGHT_EYE_X = 66

EYE_Y = 5


EYE_W = 60

EYE_H = 54

EYE_RADIUS = 16


LEFT_EYE_CX = LEFT_EYE_X + EYE_W // 2

RIGHT_EYE_CX = RIGHT_EYE_X + EYE_W // 2

EYE_CY = EYE_Y + EYE_H // 2


# =========================================================
# SAFE HORIZONTAL LINE
# =========================================================

def safe_hline(x, y, width, colour):

    if y < 0 or y >= 64:
        return

    if width <= 0:
        return

    if x < 0:

        width += x
        x = 0

    if x >= 128:
        return

    if x + width > 128:

        width = 128 - x

    if width > 0:

        display.hline(
            x,
            y,
            width,
            colour
        )


# =========================================================
# FILLED CIRCLE
# =========================================================

def draw_disc(cx, cy, radius, colour=1):

    x = 0
    y = radius

    d = 1 - radius


    while x <= y:

        safe_hline(
            cx - x,
            cy + y,
            2 * x + 1,
            colour
        )

        safe_hline(
            cx - x,
            cy - y,
            2 * x + 1,
            colour
        )


        safe_hline(
            cx - y,
            cy + x,
            2 * y + 1,
            colour
        )

        safe_hline(
            cx - y,
            cy - x,
            2 * y + 1,
            colour
        )


        x += 1


        if d < 0:

            d += (
                2 * x + 1
            )

        else:

            y -= 1

            d += (
                2 * (x - y) + 1
            )


# =========================================================
# FILLED ROUNDED RECTANGLE
# =========================================================

def draw_rbox(x, y, width, height, radius, colour=1):

    if radius <= 0:

        display.fill_rect(
            x,
            y,
            width,
            height,
            colour
        )

        return


    # Centre
    display.fill_rect(
        x + radius,
        y,
        width - (radius * 2),
        height,
        colour
    )


    # Middle
    display.fill_rect(
        x,
        y + radius,
        width,
        height - (radius * 2),
        colour
    )


    # Rounded corners

    draw_disc(
        x + radius,
        y + radius,
        radius,
        colour
    )

    draw_disc(
        x + width - radius - 1,
        y + radius,
        radius,
        colour
    )

    draw_disc(
        x + radius,
        y + height - radius - 1,
        radius,
        colour
    )

    draw_disc(
        x + width - radius - 1,
        y + height - radius - 1,
        radius,
        colour
    )


# =========================================================
# FILLED TRIANGLE
# =========================================================

def draw_triangle(
    x0, y0,
    x1, y1,
    x2, y2,
    colour=1
):

    # Sort by Y

    if y0 > y1:

        x0, x1 = x1, x0
        y0, y1 = y1, y0

    if y1 > y2:

        x1, x2 = x2, x1
        y1, y2 = y2, y1

    if y0 > y1:

        x0, x1 = x1, x0
        y0, y1 = y1, y0


    if y0 == y2:

        min_x = min(
            x0,
            x1,
            x2
        )

        max_x = max(
            x0,
            x1,
            x2
        )

        safe_hline(
            min_x,
            y0,
            max_x - min_x + 1,
            colour
        )

        return


    for y in range(
        max(0, y0),
        min(63, y2) + 1
    ):

        if y2 != y0:

            xa = x0 + (
                (x2 - x0) *
                (y - y0) //
                (y2 - y0)
            )

        else:

            xa = x0


        if y < y1:

            if y1 != y0:

                xb = x0 + (
                    (x1 - x0) *
                    (y - y0) //
                    (y1 - y0)
                )

            else:

                xb = x1

        else:

            if y2 != y1:

                xb = x1 + (
                    (x2 - x1) *
                    (y - y1) //
                    (y2 - y1)
                )

            else:

                xb = x2


        if xa > xb:

            xa, xb = xb, xa


        safe_hline(
            xa,
            y,
            xb - xa + 1,
            colour
        )


# =========================================================
# BASE AKNO EYES
# =========================================================

def draw_akno_base_eyes():

    draw_rbox(
        LEFT_EYE_X,
        EYE_Y,
        EYE_W,
        EYE_H,
        EYE_RADIUS,
        1
    )


    draw_rbox(
        RIGHT_EYE_X,
        EYE_Y,
        EYE_W,
        EYE_H,
        EYE_RADIUS,
        1
    )


# =========================================================
# PUPILS
# =========================================================

def draw_akno_pupils(
    left_x,
    left_y,
    right_x,
    right_y,
    pupil_radius
):

    draw_disc(
        LEFT_EYE_CX + left_x,
        EYE_CY + left_y,
        pupil_radius,
        0
    )


    draw_disc(
        RIGHT_EYE_CX + right_x,
        EYE_CY + right_y,
        pupil_radius,
        0
    )


# =========================================================
# CLOSED EYES
# =========================================================

def draw_akno_closed_eyes():

    draw_rbox(
        LEFT_EYE_X,
        28,
        EYE_W,
        8,
        4,
        1
    )


    draw_rbox(
        RIGHT_EYE_X,
        28,
        EYE_W,
        8,
        4,
        1
    )


# =========================================================
# TEAR
# =========================================================

def draw_tear(x, y):

    draw_disc(
        x,
        y,
        2,
        1
    )

    draw_disc(
        x,
        y + 4,
        2,
        1
    )

    draw_disc(
        x,
        y + 8,
        1,
        1
    )


    if (
        0 <= x < 128
        and
        0 <= y + 10 < 64
    ):

        display.pixel(
            x,
            y + 10,
            1
        )


# =========================================================
# WIDE BOLD SMILE
# =========================================================

def draw_smile():

    # First smile line

    display.line(
        36, 46,
        42, 52,
        1
    )

    display.line(
        42, 52,
        50, 57,
        1
    )

    display.line(
        50, 57,
        64, 60,
        1
    )

    display.line(
        64, 60,
        78, 57,
        1
    )

    display.line(
        78, 57,
        86, 52,
        1
    )

    display.line(
        86, 52,
        92, 46,
        1
    )


    # Second smile line

    display.line(
        36, 47,
        42, 53,
        1
    )

    display.line(
        42, 53,
        50, 58,
        1
    )

    display.line(
        50, 58,
        64, 61,
        1
    )

    display.line(
        64, 61,
        78, 58,
        1
    )

    display.line(
        78, 58,
        86, 53,
        1
    )

    display.line(
        86, 53,
        92, 47,
        1
    )


    # Third smile line

    display.line(
        36, 48,
        42, 54,
        1
    )

    display.line(
        42, 54,
        50, 59,
        1
    )

    display.line(
        50, 59,
        64, 62,
        1
    )

    display.line(
        64, 62,
        78, 59,
        1
    )

    display.line(
        78, 59,
        86, 54,
        1
    )

    display.line(
        86, 54,
        92, 48,
        1
    )


    # Smile corners

    display.line(
        34, 44,
        36, 46,
        1
    )

    display.line(
        92, 46,
        94, 44,
        1
    )


# =========================================================
# SEARCHING ANIMATION
# =========================================================

SEARCH_MOVEMENT = (

    (0, 0),

    (-12, 0),

    (-8, -8),

    (0, -10),

    (10, -7),

    (12, 0),

    (8, 8),

    (0, 10),

    (-10, 7),

    (0, 0)
)


def draw_searching_animation():

    display.fill(0)


    frame = (
        time.ticks_ms() // 110
    ) % 10


    ox = SEARCH_MOVEMENT[
        frame
    ][0]

    oy = SEARCH_MOVEMENT[
        frame
    ][1]


    draw_akno_base_eyes()


    draw_akno_pupils(
        ox,
        oy,
        ox,
        oy,
        6
    )


    display.show()


# =========================================================
# FAR - CRYING ANIMATION
# =========================================================

def draw_far_crying_animation():

    display.fill(0)


    frame = (
        time.ticks_ms() // 90
    ) % 18


    sad_drop = 8 + (
        frame % 5
    )


    # Eye bases

    draw_rbox(
        LEFT_EYE_X,
        11,
        EYE_W,
        44,
        14,
        1
    )


    draw_rbox(
        RIGHT_EYE_X,
        11,
        EYE_W,
        44,
        14,
        1
    )


    # Slanted crying cuts

    draw_triangle(
        0, 2,
        64, 2,
        0, 24 + sad_drop,
        0
    )


    draw_triangle(
        64, 2,
        128, 24 + sad_drop,
        128, 2,
        0
    )


    # Lower eye squeeze

    draw_disc(
        LEFT_EYE_CX - 28,
        64,
        20,
        0
    )


    draw_disc(
        RIGHT_EYE_CX + 28,
        64,
        20,
        0
    )


    # Sad pupils

    draw_disc(
        LEFT_EYE_CX - 4,
        EYE_CY + 11,
        5,
        0
    )


    draw_disc(
        RIGHT_EYE_CX + 4,
        EYE_CY + 11,
        5,
        0
    )


    # Animated tears

    tear1 = frame % 9

    tear2 = (
        frame + 4
    ) % 9


    draw_tear(
        LEFT_EYE_CX - 17,
        39 + tear1
    )


    draw_tear(
        RIGHT_EYE_CX - 17,
        39 + tear2
    )


    if frame > 8:

        draw_tear(
            LEFT_EYE_CX + 7,
            37 + (frame - 9)
        )


    display.show()


# =========================================================
# NEAR - FAST SCANNING
# =========================================================

NEAR_MOVEMENT = (

    (-13, 0),

    (-8, -8),

    (0, -11),

    (10, -7),

    (13, 0),

    (10, 7),

    (0, 11),

    (-10, 7),

    (-13, 0),

    (13, 0)
)


def draw_near_animation():

    display.fill(0)


    frame = (
        time.ticks_ms() // 60
    ) % 10


    ox = NEAR_MOVEMENT[
        frame
    ][0]

    oy = NEAR_MOVEMENT[
        frame
    ][1]


    draw_akno_base_eyes()


    draw_akno_pupils(
        ox,
        oy,
        ox,
        oy,
        6
    )


    display.show()


# =========================================================
# HERE - HAPPY ANIMATION
# =========================================================

def draw_happy_animation():

    display.fill(0)


    frame = (
        time.ticks_ms() // 100
    ) % 24


    blink = (
        frame == 7
        or
        frame == 8
        or
        frame == 18
    )


    if blink:

        draw_akno_closed_eyes()

        draw_smile()


    else:

        # Happy eye bases

        draw_rbox(
            LEFT_EYE_X,
            7,
            EYE_W,
            50,
            16,
            1
        )


        draw_rbox(
            RIGHT_EYE_X,
            7,
            EYE_W,
            50,
            16,
            1
        )


        # Crescent cuts

        draw_disc(
            LEFT_EYE_CX,
            68,
            42,
            0
        )


        draw_disc(
            RIGHT_EYE_CX,
            68,
            42,
            0
        )


        # Small happy pupils

        draw_disc(
            LEFT_EYE_CX,
            27,
            4,
            0
        )


        draw_disc(
            RIGHT_EYE_CX,
            27,
            4,
            0
        )


        # Wide bold smile

        draw_smile()


    display.show()


# =========================================================
# DISPLAY UPDATE
# =========================================================

def update_display():

    if current_zone == ZONE_SEARCHING:

        draw_searching_animation()


    elif current_zone == ZONE_FAR:

        draw_far_crying_animation()


    elif current_zone == ZONE_NEAR:

        draw_near_animation()


    elif current_zone == ZONE_HERE:

        draw_happy_animation()


# =========================================================
# BUZZER
# ONLY ON WHEN HERE
# =========================================================

def update_transmitter_buzzer():

    global buzzer_active


    if current_zone == ZONE_HERE:

        if not buzzer_active:

            buzzer.freq(
                2200
            )

            buzzer.duty_u16(
                32768
            )

            buzzer_active = True


    else:

        if buzzer_active:

            buzzer.duty_u16(
                0
            )

            buzzer_active = False


# =========================================================
# WIFI
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


# Disable Wi-Fi power saving if supported

try:

    sta.config(
        pm=network.WLAN.PM_NONE
    )

except:

    try:

        sta.config(
            pm=sta.PM_NONE
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
print("ESP32-S3 TRANSMITTER")
print("==============================")

print(
    "Transmitter MAC:",
    mac_text
)


# =========================================================
# ESP-NOW
# =========================================================

esp = espnow.ESPNow()

esp.active(True)


# =========================================================
# ADD BROADCAST PEER
# =========================================================

try:

    esp.add_peer(
        BROADCAST,
        channel=0,
        encrypt=False
    )


except Exception:

    # Compatibility fallback
    try:

        esp.add_peer(
            BROADCAST
        )

    except:

        pass


print(
    "Broadcast peer ready"
)


# =========================================================
# INITIAL DISPLAY
# =========================================================

draw_searching_animation()


print()
print("Transmitter ready")
print("Broadcasting GIBSON beacon...")
print()


# =========================================================
# SEND BEACON
# =========================================================

def send_beacon():

    global last_send_time
    global beacon_counter


    now = time.ticks_ms()


    if time.ticks_diff(
        now,
        last_send_time
    ) < SEND_INTERVAL_MS:

        return


    last_send_time = now


    beacon_counter = (
        beacon_counter + 1
    ) & 0xFFFFFFFF


    # Arduino:
    #
    # typedef struct {
    #     uint32_t counter;
    # } BeaconPacket;
    #
    # Little-endian 4 bytes

    packet = struct.pack(
        "<I",
        beacon_counter
    )


    try:

        esp.send(
            BROADCAST,
            packet,
            False
        )


    except OSError as error:

        print(
            "Beacon TX error:",
            error
        )


# =========================================================
# RECEIVE FEEDBACK
# =========================================================

def receive_feedback():

    global current_zone
    global last_feedback_time


    try:

        # Read every waiting ESP-NOW packet

        while esp.any():

            host, message = esp.recv(0)


            if (
                host is not None
                and
                message is not None
            ):


                # Receiver FeedbackPacket:
                #
                # uint8_t zone
                #
                # Exactly 1 byte

                if len(message) == 1:

                    received_zone = message[0]


                    if (
                        ZONE_SEARCHING
                        <= received_zone
                        <= ZONE_HERE
                    ):

                        current_zone = (
                            received_zone
                        )

                        last_feedback_time = (
                            time.ticks_ms()
                        )


                        if current_zone == ZONE_SEARCHING:

                            zone_name = "SEARCHING"


                        elif current_zone == ZONE_FAR:

                            zone_name = "FAR"


                        elif current_zone == ZONE_NEAR:

                            zone_name = "NEAR"


                        else:

                            zone_name = "HERE"


                        print(
                            "Feedback:",
                            zone_name
                        )


    except Exception as error:

        print(
            "RX error:",
            error
        )


# =========================================================
# MAIN LOOP
# =========================================================

while True:

    now = time.ticks_ms()


    # -----------------------------------------------------
    # SEND BEACON
    # -----------------------------------------------------

    send_beacon()


    # -----------------------------------------------------
    # RECEIVE ZONE FEEDBACK
    # -----------------------------------------------------

    receive_feedback()


    # -----------------------------------------------------
    # FEEDBACK TIMEOUT
    # -----------------------------------------------------

    if time.ticks_diff(
        now,
        last_feedback_time
    ) > FEEDBACK_TIMEOUT_MS:

        current_zone = ZONE_SEARCHING


    # -----------------------------------------------------
    # BUZZER
    # -----------------------------------------------------

    update_transmitter_buzzer()


    # -----------------------------------------------------
    # OLED ANIMATION
    # -----------------------------------------------------

    if time.ticks_diff(
        now,
        last_display_time
    ) >= DISPLAY_INTERVAL_MS:

        last_display_time = now

        update_display()


    # -----------------------------------------------------
    # SMALL LOOP DELAY
    # -----------------------------------------------------

    time.sleep_ms(10)