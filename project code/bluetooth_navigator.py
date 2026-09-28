# ============================================================
# LOF TITAN ESP32-S3 BLE ROVER
# MicroPython RX
#
# FIXED FOR:
# RuntimeError: out of PWM channels:8
#
# Uses only 4 PWM channels:
#
# M1 PWM = GPIO15   DIR = GPIO16
# M2 PWM = GPIO13   DIR = GPIO14
# M3 PWM = GPIO11   DIR = GPIO12
# M4 PWM = GPIO9    DIR = GPIO10
#
# TX JOYSTICK:
# Forward  = +Y
# Backward = -Y
# Right    = +X
# Left     = -X
#
# Joystick range:
# -1000 to +1000
# ============================================================

import time
import struct
import bluetooth

from machine import Pin, PWM
from micropython import const


# ============================================================
# BLE UUID
# ============================================================

SERVICE_UUID = bluetooth.UUID(
    "d60f0001-8bcb-4d5f-9a6b-4d1e6d001001"
)

CHARACTERISTIC_UUID = bluetooth.UUID(
    "d60f0002-8bcb-4d5f-9a6b-4d1e6d001002"
)


# ============================================================
# MOTOR PINS
#
# Only IN1 uses hardware PWM.
# IN2 is normal digital direction control.
# ============================================================

# Motor 1
M1_PWM = 15
M1_DIR = 16

# Motor 2
M2_PWM = 13
M2_DIR = 14

# Motor 3
M3_PWM = 11
M3_DIR = 12

# Motor 4
M4_PWM = 9
M4_DIR = 10


# ============================================================
# BUZZER
# ============================================================

BUZZER_PIN = 20


# ============================================================
# PWM
# ============================================================

PWM_FREQ = 5000


# ============================================================
# SPEED
#
# Same 0-255 scale as Arduino
# ============================================================

MOVE_SPEED = 170
TURN_SPEED = 150


# ============================================================
# JOYSTICK
# ============================================================

JOYSTICK_THRESHOLD = 180


# ============================================================
# SAFETY
# ============================================================

FIRST_CONNECT_WAIT = 3000

# Stop rover if TX data stops for 1 second
DATA_TIMEOUT = 1000


# ============================================================
# BLE IRQ
# ============================================================

_IRQ_CENTRAL_CONNECT = const(1)
_IRQ_CENTRAL_DISCONNECT = const(2)
_IRQ_GATTS_WRITE = const(3)


# ============================================================
# BLE FLAGS
# ============================================================

_FLAG_WRITE_NO_RESPONSE = const(0x0004)
_FLAG_WRITE = const(0x0008)


# ============================================================
# BLE PACKET
#
# Must match ESP32-C3 TX exactly:
#
# bool      joystickMode = 1 byte
# int16_t   joyX         = 2
# int16_t   joyY         = 2
#
# uint16_t flex1         = 2
# uint16_t flex2         = 2
# uint16_t flex3         = 2
# uint16_t flex4         = 2
#
# bool up                = 1
# bool down              = 1
# bool left              = 1
# bool right             = 1
# bool joyButton         = 1
#
# TOTAL = 18 bytes
# ============================================================

PACKET_FORMAT = "<BhhHHHHBBBBB"

PACKET_SIZE = struct.calcsize(
    PACKET_FORMAT
)


# ============================================================
# MOTOR CLASS
#
# IMPORTANT:
#
# We use only ONE hardware PWM channel per motor.
#
# FORWARD electrical:
#
# DIR = 0
# PWM = speed
#
# BACKWARD electrical:
#
# DIR = 1
# PWM is inverted.
#
# This works like:
#
# IN1   IN2
# PWM    0     -> forward
# ~PWM   1     -> backward
#
# ============================================================

class Motor:

    def __init__(self, pwm_pin, dir_pin):

        self.dir = Pin(
            dir_pin,
            Pin.OUT
        )

        self.dir.value(0)

        self.pwm = PWM(
            Pin(pwm_pin),
            freq=PWM_FREQ
        )

        self.pwm.duty_u16(0)


    # --------------------------------------------------------
    # Convert Arduino 0-255 PWM to MicroPython 0-65535
    # --------------------------------------------------------

    def _duty(self, value):

        value = max(
            0,
            min(255, int(value))
        )

        return value * 257


    # --------------------------------------------------------
    # STOP
    # --------------------------------------------------------

    def stop(self):

        self.pwm.duty_u16(0)

        self.dir.value(0)


    # --------------------------------------------------------
    # ELECTRICAL FORWARD
    # --------------------------------------------------------

    def forward(self, speed):

        speed = max(
            0,
            min(255, int(speed))
        )

        # Remove PWM before direction change
        self.pwm.duty_u16(0)

        self.dir.value(0)

        self.pwm.duty_u16(
            self._duty(speed)
        )


    # --------------------------------------------------------
    # ELECTRICAL BACKWARD
    #
    # IN2 stays HIGH.
    #
    # PWM must be inverted because:
    #
    # IN1 LOW  + IN2 HIGH = reverse
    # IN1 HIGH + IN2 HIGH = brake
    # --------------------------------------------------------

    def backward(self, speed):

        speed = max(
            0,
            min(255, int(speed))
        )

        # Stop first
        self.pwm.duty_u16(0)

        self.dir.value(1)

        # Inverted PWM
        inverse = 255 - speed

        self.pwm.duty_u16(
            self._duty(inverse)
        )


# ============================================================
# CREATE 4 MOTORS
#
# ONLY 4 PWM CHANNELS ARE USED
# ============================================================

m1 = Motor(
    M1_PWM,
    M1_DIR
)

m2 = Motor(
    M2_PWM,
    M2_DIR
)

m3 = Motor(
    M3_PWM,
    M3_DIR
)

m4 = Motor(
    M4_PWM,
    M4_DIR
)


# ============================================================
# BUZZER
# ============================================================

buzzer = Pin(
    BUZZER_PIN,
    Pin.OUT
)

buzzer.value(0)


# ============================================================
# STOP ALL
# ============================================================

def stop_motors():

    m1.stop()
    m2.stop()
    m3.stop()
    m4.stop()


# ============================================================
# LEFT SIDE
#
# M1 + M3
# ============================================================

def left_side_forward(speed):

    m1.forward(speed)
    m3.forward(speed)


def left_side_backward(speed):

    m1.backward(speed)
    m3.backward(speed)


# ============================================================
# RIGHT SIDE
#
# M2 + M4
# ============================================================

def right_side_forward(speed):

    m2.forward(speed)
    m4.forward(speed)


def right_side_backward(speed):

    m2.backward(speed)
    m4.backward(speed)


# ============================================================
# FINAL ROVER MOVEMENT
#
# Based on your tested rover motor polarity.
# ============================================================


# ------------------------------------------------------------
# PHYSICAL FORWARD
#
# Electrical backwards on both sides
# ------------------------------------------------------------

def move_forward():

    left_side_backward(
        MOVE_SPEED
    )

    right_side_backward(
        MOVE_SPEED
    )


# ------------------------------------------------------------
# PHYSICAL BACKWARD
# ------------------------------------------------------------

def move_backward():

    left_side_forward(
        MOVE_SPEED
    )

    right_side_forward(
        MOVE_SPEED
    )


# ------------------------------------------------------------
# LEFT
#
# Corrected based on your test
# ------------------------------------------------------------

def turn_left():

    left_side_forward(
        TURN_SPEED
    )

    right_side_backward(
        TURN_SPEED
    )


# ------------------------------------------------------------
# RIGHT
#
# Corrected based on your test
# ------------------------------------------------------------

def turn_right():

    left_side_backward(
        TURN_SPEED
    )

    right_side_forward(
        TURN_SPEED
    )


# ============================================================
# NON-BLOCKING BUZZER
# ============================================================

class Buzzer:

    def __init__(self, pin):

        self.pin = pin

        self.count = 0

        self.state = 0

        self.running = False

        self.next_time = 0


    def beep(self, count):

        self.count = count

        self.state = 1

        self.running = True

        self.pin.value(1)

        self.next_time = time.ticks_add(
            time.ticks_ms(),
            180
        )


    def update(self):

        if not self.running:
            return


        now = time.ticks_ms()


        if time.ticks_diff(
            now,
            self.next_time
        ) < 0:

            return


        # ----------------------------------------------------
        # Buzzer currently ON
        # ----------------------------------------------------

        if self.state == 1:

            self.pin.value(0)

            self.state = 0

            self.next_time = time.ticks_add(
                now,
                180
            )


        # ----------------------------------------------------
        # Buzzer currently OFF
        # ----------------------------------------------------

        else:

            self.count -= 1


            if self.count <= 0:

                self.pin.value(0)

                self.running = False

                return


            self.pin.value(1)

            self.state = 1

            self.next_time = time.ticks_add(
                now,
                180
            )


buzzer_control = Buzzer(
    buzzer
)


# ============================================================
# BLE ADVERTISING
#
# Keep service UUID in advertisement because ESP32-C3
# searches specifically for this service.
#
# Device name goes in scan response.
# ============================================================

_ADV_TYPE_FLAGS = const(0x01)

_ADV_TYPE_NAME = const(0x09)

_ADV_TYPE_UUID16_COMPLETE = const(0x03)
_ADV_TYPE_UUID32_COMPLETE = const(0x05)
_ADV_TYPE_UUID128_COMPLETE = const(0x07)


def add_field(
    payload,
    adv_type,
    value
):

    payload += struct.pack(
        "BB",
        len(value) + 1,
        adv_type
    )

    payload += value

    return payload


def make_adv_payload():

    payload = bytearray()

    # General Discoverable + BLE only
    payload = add_field(
        payload,
        _ADV_TYPE_FLAGS,
        b"\x06"
    )


    uuid_bytes = bytes(
        SERVICE_UUID
    )


    if len(uuid_bytes) == 2:

        payload = add_field(
            payload,
            _ADV_TYPE_UUID16_COMPLETE,
            uuid_bytes
        )


    elif len(uuid_bytes) == 4:

        payload = add_field(
            payload,
            _ADV_TYPE_UUID32_COMPLETE,
            uuid_bytes
        )


    else:

        payload = add_field(
            payload,
            _ADV_TYPE_UUID128_COMPLETE,
            uuid_bytes
        )


    return payload


def make_scan_response():

    payload = bytearray()

    payload = add_field(
        payload,
        _ADV_TYPE_NAME,
        b"LOF_TITAN_ROVER"
    )

    return payload


# ============================================================
# BLE SERVICE
# ============================================================

ROVER_SERVICE = (

    SERVICE_UUID,

    (
        (
            CHARACTERISTIC_UUID,

            _FLAG_WRITE |
            _FLAG_WRITE_NO_RESPONSE
        ),
    ),
)


# ============================================================
# BLE SERVER
# ============================================================

class BLERover:

    def __init__(self):

        self.ble = bluetooth.BLE()

        self.ble.active(True)


        self.connected_flag = False

        self.just_connected = False

        self.just_disconnected = False

        self.write_pending = False

        self.restart_advertising = False


        self.connections = set()


        self.ble.irq(
            self._irq
        )


        handles = (
            self.ble.gatts_register_services(
                (ROVER_SERVICE,)
            )
        )


        ((self.rx_handle,),) = handles


        # More than enough for 18 byte packet
        self.ble.gatts_set_buffer(
            self.rx_handle,
            32,
            False
        )


        self.adv_data = (
            make_adv_payload()
        )


        self.resp_data = (
            make_scan_response()
        )


        self.advertise()


    # ========================================================
    # ADVERTISE
    # ========================================================

    def advertise(self):

        try:

            self.ble.gap_advertise(
                100000,
                adv_data=self.adv_data,
                resp_data=self.resp_data
            )

            print(
                "BLE advertising started"
            )

        except Exception as e:

            print(
                "Advertising error:",
                e
            )


    # ========================================================
    # IRQ
    # ========================================================

    def _irq(self, event, data):

        # ----------------------------------------------------
        # CONTROLLER CONNECTED
        # ----------------------------------------------------

        if event == _IRQ_CENTRAL_CONNECT:

            conn_handle, addr_type, addr = data

            self.connections.add(
                conn_handle
            )

            self.connected_flag = True

            self.just_connected = True


        # ----------------------------------------------------
        # CONTROLLER DISCONNECTED
        # ----------------------------------------------------

        elif event == _IRQ_CENTRAL_DISCONNECT:

            conn_handle, addr_type, addr = data


            if conn_handle in self.connections:

                self.connections.remove(
                    conn_handle
                )


            self.connected_flag = False

            self.just_disconnected = True

            self.restart_advertising = True


        # ----------------------------------------------------
        # CONTROLLER DATA RECEIVED
        # ----------------------------------------------------

        elif event == _IRQ_GATTS_WRITE:

            conn_handle, attr_handle = data


            if attr_handle == self.rx_handle:

                # Don't do heavy work inside BLE IRQ.
                self.write_pending = True


    # ========================================================
    # CONNECTED?
    # ========================================================

    def connected(self):

        return self.connected_flag


    # ========================================================
    # GET LATEST PACKET
    # ========================================================

    def get_packet(self):

        if not self.write_pending:

            return None


        self.write_pending = False


        try:

            return self.ble.gatts_read(
                self.rx_handle
            )

        except Exception as e:

            print(
                "BLE read error:",
                e
            )

            return None


    # ========================================================
    # UPDATE BLE
    # ========================================================

    def update(self):

        if self.restart_advertising:

            self.restart_advertising = False

            self.advertise()


# ============================================================
# START BLE
# ============================================================

ble_rover = BLERover()


# ============================================================
# RECEIVED CONTROLLER STATE
# ============================================================

got_data = False

last_receive_time = 0


joy_x = 0
joy_y = 0


btn_up = False
btn_down = False
btn_left = False
btn_right = False

joy_button = False


# ============================================================
# PROCESS BLE PACKET
# ============================================================

def process_packet(packet):

    global got_data
    global last_receive_time

    global joy_x
    global joy_y

    global btn_up
    global btn_down
    global btn_left
    global btn_right

    global joy_button


    if packet is None:

        return


    # --------------------------------------------------------
    # Packet must be exactly 18 bytes
    # --------------------------------------------------------

    if len(packet) != PACKET_SIZE:

        print(
            "Wrong packet size:",
            len(packet),
            "Expected:",
            PACKET_SIZE
        )

        return


    try:

        (
            joystick_mode,

            joy_x,
            joy_y,

            flex1,
            flex2,
            flex3,
            flex4,

            up,
            down,
            left,
            right,

            joy_btn

        ) = struct.unpack(
            PACKET_FORMAT,
            packet
        )


        # Flex sensors ignored


        btn_up = bool(up)

        btn_down = bool(down)

        btn_left = bool(left)

        btn_right = bool(right)

        joy_button = bool(
            joy_btn
        )


        got_data = True


        last_receive_time = (
            time.ticks_ms()
        )


        print(
            "RX X={:+d} Y={:+d} U={} D={} L={} R={}".format(
                joy_x,
                joy_y,
                int(btn_up),
                int(btn_down),
                int(btn_left),
                int(btn_right)
            )
        )


    except Exception as e:

        print(
            "Packet decode error:",
            e
        )


# ============================================================
# DISPLAY ACTION ONLY WHEN IT CHANGES
# ============================================================

last_action = None


def show_action(action):

    global last_action


    if action == last_action:

        return


    last_action = action


    print(
        "ROVER ->",
        action
    )


# ============================================================
# CONTROL ROVER
# ============================================================

def control_rover():

    # --------------------------------------------------------
    # NO DATA
    # --------------------------------------------------------

    if not got_data:

        stop_motors()

        show_action(
            "STOP"
        )

        return


    # ========================================================
    # BUTTONS HAVE PRIORITY
    # ========================================================

    if btn_up:

        move_forward()

        show_action(
            "FORWARD"
        )

        return


    if btn_down:

        move_backward()

        show_action(
            "BACKWARD"
        )

        return


    if btn_left:

        turn_left()

        show_action(
            "LEFT"
        )

        return


    if btn_right:

        turn_right()

        show_action(
            "RIGHT"
        )

        return


    # ========================================================
    # JOYSTICK CENTER
    # ========================================================

    if (
        abs(joy_x) <= JOYSTICK_THRESHOLD
        and
        abs(joy_y) <= JOYSTICK_THRESHOLD
    ):

        stop_motors()

        show_action(
            "STOP"
        )

        return


    # ========================================================
    # STRONGEST AXIS
    #
    # Prevents small X drift when moving forward/backward.
    # ========================================================

    if abs(joy_y) >= abs(joy_x):


        # ----------------------------------------------------
        # FORWARD
        # ----------------------------------------------------

        if joy_y > JOYSTICK_THRESHOLD:

            move_forward()

            show_action(
                "FORWARD"
            )


        # ----------------------------------------------------
        # BACKWARD
        # ----------------------------------------------------

        elif joy_y < -JOYSTICK_THRESHOLD:

            move_backward()

            show_action(
                "BACKWARD"
            )


        else:

            stop_motors()

            show_action(
                "STOP"
            )


    else:


        # ----------------------------------------------------
        # RIGHT
        # ----------------------------------------------------

        if joy_x > JOYSTICK_THRESHOLD:

            turn_right()

            show_action(
                "RIGHT"
            )


        # ----------------------------------------------------
        # LEFT
        # ----------------------------------------------------

        elif joy_x < -JOYSTICK_THRESHOLD:

            turn_left()

            show_action(
                "LEFT"
            )


        else:

            stop_motors()

            show_action(
                "STOP"
            )


# ============================================================
# START
# ============================================================

stop_motors()


print()
print(
    "================================"
)

print(
    "LOF TITAN BLE ROVER"
)

print(
    "MicroPython RX"
)

print(
    "================================"
)

print(
    "PWM channels used: 4"
)

print(
    "Packet size:",
    PACKET_SIZE
)

print()
print(
    "FORWARD  = +Y"
)

print(
    "BACKWARD = -Y"
)

print(
    "RIGHT    = +X"
)

print(
    "LEFT     = -X"
)

print()
print(
    "Waiting for ESP32-C3 controller..."
)


boot_time = (
    time.ticks_ms()
)

no_connection_beep_done = False

ever_connected = False


# ============================================================
# MAIN LOOP
# ============================================================

while True:

    now = time.ticks_ms()


    # ========================================================
    # BLE HOUSEKEEPING
    # ========================================================

    ble_rover.update()


    # ========================================================
    # BUZZER
    # ========================================================

    buzzer_control.update()


    # ========================================================
    # CONNECTED EVENT
    # ========================================================

    if ble_rover.just_connected:

        ble_rover.just_connected = False

        ever_connected = True

        got_data = False

        stop_motors()


        print()
        print(
            "=============================="
        )

        print(
            "CONTROLLER CONNECTED"
        )

        print(
            "=============================="
        )


        # One beep
        buzzer_control.beep(1)


    # ========================================================
    # DISCONNECTED EVENT
    # ========================================================

    if ble_rover.just_disconnected:

        ble_rover.just_disconnected = False

        got_data = False

        stop_motors()


        print()
        print(
            "=============================="
        )

        print(
            "CONTROLLER DISCONNECTED"
        )

        print(
            "=============================="
        )


        # Three beeps
        buzzer_control.beep(3)


    # ========================================================
    # NO CONNECTION AFTER 3 SECONDS
    # ========================================================

    if (
        not ever_connected
        and
        not ble_rover.connected()
        and
        not no_connection_beep_done
    ):

        if time.ticks_diff(
            now,
            boot_time
        ) >= FIRST_CONNECT_WAIT:

            print(
                "Controller not connected -> 3 beeps"
            )

            buzzer_control.beep(3)

            no_connection_beep_done = True


    # ========================================================
    # GET BLE PACKET
    # ========================================================

    packet = ble_rover.get_packet()


    if packet is not None:

        process_packet(
            packet
        )


    # ========================================================
    # DATA TIMEOUT
    # ========================================================

    if (
        ble_rover.connected()
        and
        got_data
    ):

        if time.ticks_diff(
            now,
            last_receive_time
        ) > DATA_TIMEOUT:

            print(
                "BLE DATA TIMEOUT -> STOP"
            )

            got_data = False

            stop_motors()

            show_action(
                "STOP"
            )


    # ========================================================
    # CONTROL ROVER
    # ========================================================

    if (
        ble_rover.connected()
        and
        got_data
    ):

        control_rover()


    else:

        stop_motors()


    # ========================================================
    # KEEP LOOP FAST + WATCHDOG SAFE
    # ========================================================

    time.sleep_ms(20)
