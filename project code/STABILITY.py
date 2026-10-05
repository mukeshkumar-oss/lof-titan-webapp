# ============================================================
# LOF TITAN ESP32-S3
# MicroPython
#
# STABILITY + FRONT IR OBSTACLE AVOIDANCE ROVER
#
# MPU6050 + FRONT IR + 4 MOTORS
#
# FEATURES:
# - Universal I2C search
# - No manual MPU address required
# - Detects MPU at 0x68 / 0x69
# - Gyro calibration
# - Flat calibration
# - Complementary filter
# - Tilt speed reduction
# - Strong tilt safety stop
# - IR obstacle detection
# - STOP -> BACKWARD -> STOP -> TURN -> FORWARD
# - Only 4 PWM objects used
# - No external MPU library required
# ============================================================

from machine import Pin, PWM, I2C
import time
import math
import gc


# ============================================================
# SETTINGS
# ============================================================

NORMAL_SPEED = 150
SLOW_SPEED = 75
BACKWARD_SPEED = 115
TURN_SPEED = 105

NORMAL_TILT = 6.0
SLOW_TILT = 10.0
STOP_TILT = 22.0
RESTART_TILT = 15.0

REVERSE_DELAY = 70
BACKWARD_TIME = 650
TURN_PAUSE = 120
TURN_TIME = 600
AFTER_TURN_PAUSE = 120


# ============================================================
# IR SENSOR
# ============================================================

FRONT_IR_PIN = 2

# Most IR obstacle modules:
# 0 = obstacle
# 1 = clear

IR_ACTIVE = 0

front_ir = Pin(
    FRONT_IR_PIN,
    Pin.IN
)


# ============================================================
# MOTOR PINS
# ============================================================

# LEFT
M1_A = 15
M1_B = 16

M2_A = 13
M2_B = 14

# RIGHT
M3_A = 11
M3_B = 12

M4_A = 9
M4_B = 10


# ============================================================
# MOTOR CLASS
#
# IMPORTANT:
# Only ONE PWM object is used per motor.
#
# This means:
# 4 motors = 4 PWM channels
#
# This avoids:
# RuntimeError: out of PWM channels:8
# ============================================================

class Motor:

    def __init__(self, pin_a, pin_b, reversed=False):

        self.pin_a_num = pin_a
        self.pin_b_num = pin_b

        self.reversed = reversed

        self.pin_a = Pin(
            pin_a,
            Pin.OUT,
            value=0
        )

        self.pin_b = Pin(
            pin_b,
            Pin.OUT,
            value=0
        )

        self.pwm = None

        self.pwm_pin = None

        self.stop()


    # --------------------------------------------------------
    # Completely release current PWM
    # --------------------------------------------------------

    def _release_pwm(self):

        if self.pwm is not None:

            try:
                self.pwm.duty_u16(0)
            except:
                pass

            try:
                self.pwm.deinit()
            except:
                pass

            self.pwm = None

            self.pwm_pin = None


    # --------------------------------------------------------
    # Start PWM on selected pin
    # --------------------------------------------------------

    def _start_pwm(self, pin_number, duty):

        # Reuse if PWM is already on correct pin

        if (
            self.pwm is None or
            self.pwm_pin != pin_number
        ):

            self._release_pwm()

            # Make both pins normal LOW first

            self.pin_a = Pin(
                self.pin_a_num,
                Pin.OUT,
                value=0
            )

            self.pin_b = Pin(
                self.pin_b_num,
                Pin.OUT,
                value=0
            )

            time.sleep_ms(1)

            pwm_pin = Pin(
                pin_number,
                Pin.OUT
            )

            self.pwm = PWM(pwm_pin)

            self.pwm.freq(5000)

            self.pwm_pin = pin_number


        self.pwm.duty_u16(duty)


    # --------------------------------------------------------
    # Motor speed
    #
    # -255 = full backward
    #    0 = stop
    # +255 = full forward
    # --------------------------------------------------------

    def set_speed(self, speed):

        speed = int(
            max(
                -255,
                min(255, speed)
            )
        )


        if self.reversed:
            speed = -speed


        # STOP
        if speed == 0:

            self.stop()

            return


        duty = int(
            abs(speed) *
            65535 /
            255
        )


        # FORWARD
        if speed > 0:

            # PWM on A
            # B LOW

            self.pin_b = Pin(
                self.pin_b_num,
                Pin.OUT,
                value=0
            )

            self._start_pwm(
                self.pin_a_num,
                duty
            )


        # BACKWARD
        else:

            # A LOW
            # PWM on B

            self.pin_a = Pin(
                self.pin_a_num,
                Pin.OUT,
                value=0
            )

            self._start_pwm(
                self.pin_b_num,
                duty
            )


    def stop(self):

        self._release_pwm()

        self.pin_a = Pin(
            self.pin_a_num,
            Pin.OUT,
            value=0
        )

        self.pin_b = Pin(
            self.pin_b_num,
            Pin.OUT,
            value=0
        )


# ============================================================
# CREATE MOTORS
# ============================================================

motor1 = Motor(
    M1_A,
    M1_B,
    False
)

motor2 = Motor(
    M2_A,
    M2_B,
    False
)

# Right motors reversed because of mirrored mounting

motor3 = Motor(
    M3_A,
    M3_B,
    True
)

motor4 = Motor(
    M4_A,
    M4_B,
    True
)


# ============================================================
# DRIVE FUNCTIONS
# ============================================================

def drive_rover(left_speed, right_speed):

    motor1.set_speed(left_speed)
    motor2.set_speed(left_speed)

    motor3.set_speed(right_speed)
    motor4.set_speed(right_speed)


def move_forward(speed):

    drive_rover(
        speed,
        speed
    )


def move_backward(speed):

    drive_rover(
        -speed,
        -speed
    )


def turn_left(speed):

    drive_rover(
        -speed,
        speed
    )


def turn_right(speed):

    drive_rover(
        speed,
        -speed
    )


def stop_rover():

    motor1.stop()
    motor2.stop()
    motor3.stop()
    motor4.stop()


# ============================================================
# UNIVERSAL I2C SEARCH
# ============================================================

# LOF TITAN supported I2C combinations

I2C_BUSES = [

    ("MAIN I2C", 7, 8),

    ("S1-S2", 1, 2),

    ("S3-S4", 3, 4),

    ("S5-S6", 5, 6)
]


i2c = None

MPU_ADDR = None

active_sda = None
active_scl = None
active_bus_name = None


# ============================================================
# FIND MPU AUTOMATICALLY
# ============================================================

def find_mpu():

    global i2c
    global MPU_ADDR
    global active_sda
    global active_scl
    global active_bus_name


    print()
    print("================================")
    print("UNIVERSAL I2C MPU SEARCH")
    print("================================")


    for name, sda, scl in I2C_BUSES:

        print()
        print(
            "Checking {} SDA={} SCL={}".format(
                name,
                sda,
                scl
            )
        )


        try:

            # Remove previous bus reference

            i2c = None

            gc.collect()

            time.sleep_ms(50)


            # ESP32-S3 hardware I2C

            try:

                bus = I2C(
                    0,
                    sda=Pin(sda),
                    scl=Pin(scl),
                    freq=100000
                )

            except Exception:

                bus = I2C(
                    1,
                    sda=Pin(sda),
                    scl=Pin(scl),
                    freq=100000
                )


            time.sleep_ms(50)


            devices = bus.scan()


            if devices:

                print(
                    "Found:",
                    [
                        hex(x)
                        for x in devices
                    ]
                )

            else:

                print(
                    "No I2C devices"
                )


            # MPU default addresses

            if 0x68 in devices:

                i2c = bus

                MPU_ADDR = 0x68

                active_sda = sda
                active_scl = scl
                active_bus_name = name

                print()
                print(">>> MPU FOUND <<<")
                print("BUS:", name)
                print("SDA: GPIO{}".format(sda))
                print("SCL: GPIO{}".format(scl))
                print("ADDRESS: 0x68")

                return True


            if 0x69 in devices:

                i2c = bus

                MPU_ADDR = 0x69

                active_sda = sda
                active_scl = scl
                active_bus_name = name

                print()
                print(">>> MPU FOUND <<<")
                print("BUS:", name)
                print("SDA: GPIO{}".format(sda))
                print("SCL: GPIO{}".format(scl))
                print("ADDRESS: 0x69")

                return True


        except Exception as e:

            print(
                "I2C error:",
                e
            )


    print()
    print("MPU6050 NOT FOUND")

    return False


# ============================================================
# MPU REGISTER WRITE
# ============================================================

def write_mpu(register, value):

    try:

        i2c.writeto_mem(
            MPU_ADDR,
            register,
            bytes([value])
        )

        return True

    except Exception as e:

        print(
            "MPU write error:",
            e
        )

        return False


# ============================================================
# SIGNED 16 BIT
# ============================================================

def signed16(high, low):

    value = (
        (high << 8) |
        low
    )

    if value & 0x8000:
        value -= 65536

    return value


# ============================================================
# READ MPU6050
# ============================================================

def read_mpu():

    try:

        data = i2c.readfrom_mem(
            MPU_ADDR,
            0x3B,
            14
        )


        ax_raw = signed16(
            data[0],
            data[1]
        )

        ay_raw = signed16(
            data[2],
            data[3]
        )

        az_raw = signed16(
            data[4],
            data[5]
        )


        gx_raw = signed16(
            data[8],
            data[9]
        )

        gy_raw = signed16(
            data[10],
            data[11]
        )

        gz_raw = signed16(
            data[12],
            data[13]
        )


        ax = ax_raw / 16384.0
        ay = ay_raw / 16384.0
        az = az_raw / 16384.0


        gx = gx_raw / 131.0
        gy = gy_raw / 131.0
        gz = gz_raw / 131.0


        return (
            ax,
            ay,
            az,
            gx,
            gy,
            gz
        )


    except Exception:

        return None


# ============================================================
# MPU VARIABLES
# ============================================================

gyro_offset_x = 0.0
gyro_offset_y = 0.0
gyro_offset_z = 0.0

roll = 0.0
pitch = 0.0

base_roll = 0.0
base_pitch = 0.0

filtered_tilt = 0.0

previous_us = 0

tilt_stop = False


# ============================================================
# GYRO CALIBRATION
# ============================================================

def calibrate_gyro():

    global gyro_offset_x
    global gyro_offset_y
    global gyro_offset_z


    print()
    print("GYRO CALIBRATION")
    print("DO NOT MOVE ROVER")


    total_x = 0.0
    total_y = 0.0
    total_z = 0.0

    good_samples = 0


    for _ in range(1000):

        data = read_mpu()


        if data is not None:

            _, _, _, gx, gy, gz = data

            total_x += gx
            total_y += gy
            total_z += gz

            good_samples += 1


        time.sleep_ms(2)


    if good_samples > 0:

        gyro_offset_x = (
            total_x /
            good_samples
        )

        gyro_offset_y = (
            total_y /
            good_samples
        )

        gyro_offset_z = (
            total_z /
            good_samples
        )


    print(
        "Samples:",
        good_samples
    )

    print(
        "Gyro Offset X:",
        gyro_offset_x
    )

    print(
        "Gyro Offset Y:",
        gyro_offset_y
    )

    print(
        "Gyro Offset Z:",
        gyro_offset_z
    )

    print(
        "Gyro calibration completed"
    )


# ============================================================
# FLAT CALIBRATION
# ============================================================

def calibrate_flat():

    global base_roll
    global base_pitch
    global roll
    global pitch
    global filtered_tilt


    print()
    print("KEEP ROVER FLAT")


    total_roll = 0.0
    total_pitch = 0.0

    good_samples = 0


    for _ in range(400):

        data = read_mpu()


        if data is not None:

            ax, ay, az, _, _, _ = data


            accel_roll = math.atan2(
                ay,
                az
            ) * 180.0 / math.pi


            accel_pitch = math.atan2(
                -ax,
                math.sqrt(
                    ay * ay +
                    az * az
                )
            ) * 180.0 / math.pi


            total_roll += accel_roll

            total_pitch += accel_pitch

            good_samples += 1


        time.sleep_ms(4)


    if good_samples > 0:

        base_roll = (
            total_roll /
            good_samples
        )

        base_pitch = (
            total_pitch /
            good_samples
        )


    roll = base_roll
    pitch = base_pitch

    filtered_tilt = 0.0


    print(
        "Base Roll = {:.2f}".format(
            base_roll
        )
    )

    print(
        "Base Pitch = {:.2f}".format(
            base_pitch
        )
    )


# ============================================================
# UPDATE TILT
# ============================================================

def update_tilt():

    global roll
    global pitch
    global filtered_tilt
    global previous_us
    global tilt_stop


    data = read_mpu()


    if data is None:
        return


    ax, ay, az, gx, gy, gz = data


    now = time.ticks_us()


    dt = (
        time.ticks_diff(
            now,
            previous_us
        )
        / 1000000.0
    )


    previous_us = now


    if (
        dt <= 0 or
        dt > 0.05
    ):
        dt = 0.01


    corrected_gx = (
        gx -
        gyro_offset_x
    )


    corrected_gy = (
        gy -
        gyro_offset_y
    )


    # Accelerometer angles

    accel_roll = math.atan2(
        ay,
        az
    ) * 180.0 / math.pi


    accel_pitch = math.atan2(
        -ax,
        math.sqrt(
            ay * ay +
            az * az
        )
    ) * 180.0 / math.pi


    # Gyroscope integration

    roll += (
        corrected_gx *
        dt
    )


    pitch += (
        corrected_gy *
        dt
    )


    # Acceleration magnitude

    acceleration = math.sqrt(
        ax * ax +
        ay * ay +
        az * az
    )


    # Complementary filter

    if (
        acceleration > 0.88 and
        acceleration < 1.12
    ):

        roll = (
            0.985 * roll +
            0.015 * accel_roll
        )


        pitch = (
            0.985 * pitch +
            0.015 * accel_pitch
        )


    relative_roll = (
        roll -
        base_roll
    )


    relative_pitch = (
        pitch -
        base_pitch
    )


    tilt = math.sqrt(
        relative_roll *
        relative_roll
        +
        relative_pitch *
        relative_pitch
    )


    # Smooth tilt

    filtered_tilt = (
        0.94 *
        filtered_tilt
        +
        0.06 *
        tilt
    )


    # Strong tilt safety

    if (
        not tilt_stop and
        filtered_tilt >= STOP_TILT
    ):
        tilt_stop = True


    if (
        tilt_stop and
        filtered_tilt <= RESTART_TILT
    ):
        tilt_stop = False


# ============================================================
# GET STABILITY SPEED
# ============================================================

def get_stability_speed():

    if filtered_tilt <= NORMAL_TILT:

        return NORMAL_SPEED


    if filtered_tilt >= SLOW_TILT:

        return SLOW_SPEED


    ratio = (
        (
            filtered_tilt -
            NORMAL_TILT
        )
        /
        (
            SLOW_TILT -
            NORMAL_TILT
        )
    )


    speed = (
        NORMAL_SPEED -
        ratio *
        (
            NORMAL_SPEED -
            SLOW_SPEED
        )
    )


    speed = int(speed)


    return max(
        SLOW_SPEED,
        min(
            NORMAL_SPEED,
            speed
        )
    )


# ============================================================
# IR FILTER
# ============================================================

ir_count = 0

obstacle_detected = False


def update_ir():

    global ir_count
    global obstacle_detected


    raw_obstacle = (
        front_ir.value()
        ==
        IR_ACTIVE
    )


    if raw_obstacle:

        if ir_count < 3:
            ir_count += 1

    else:

        ir_count = 0


    obstacle_detected = (
        ir_count >= 2
    )


# ============================================================
# ROVER STATES
# ============================================================

FORWARD_MODE = 0

REVERSE_WAIT = 1

BACKWARD_MODE = 2

STOP_BEFORE_TURN = 3

LEFT_TURN = 4

RIGHT_TURN = 5

STOP_AFTER_TURN = 6


rover_state = FORWARD_MODE

state_timer = 0

turn_left_next = True


# ============================================================
# START OBSTACLE AVOIDANCE
# ============================================================

def start_obstacle_avoidance():

    global rover_state
    global state_timer


    stop_rover()


    rover_state = REVERSE_WAIT

    state_timer = time.ticks_ms()


    print(
        "OBSTACLE -> REVERSE"
    )


# ============================================================
# OBSTACLE AVOIDANCE
# ============================================================

def obstacle_avoidance():

    global rover_state
    global state_timer
    global turn_left_next
    global ir_count
    global obstacle_detected


    now = time.ticks_ms()


    # --------------------------------------------------------
    # FORWARD
    # --------------------------------------------------------

    if rover_state == FORWARD_MODE:

        if obstacle_detected:

            start_obstacle_avoidance()

            return


        move_forward(
            get_stability_speed()
        )

        return


    # --------------------------------------------------------
    # REVERSE WAIT
    # --------------------------------------------------------

    if rover_state == REVERSE_WAIT:

        stop_rover()


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            REVERSE_DELAY
        ):

            rover_state = BACKWARD_MODE

            state_timer = now


            move_backward(
                BACKWARD_SPEED
            )


        return


    # --------------------------------------------------------
    # BACKWARD
    # --------------------------------------------------------

    if rover_state == BACKWARD_MODE:

        move_backward(
            BACKWARD_SPEED
        )


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            BACKWARD_TIME
        ):

            stop_rover()

            rover_state = STOP_BEFORE_TURN

            state_timer = now


        return


    # --------------------------------------------------------
    # STOP BEFORE TURN
    # --------------------------------------------------------

    if rover_state == STOP_BEFORE_TURN:

        stop_rover()


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            TURN_PAUSE
        ):

            if turn_left_next:

                rover_state = LEFT_TURN

            else:

                rover_state = RIGHT_TURN


            state_timer = now


        return


    # --------------------------------------------------------
    # LEFT TURN
    # --------------------------------------------------------

    if rover_state == LEFT_TURN:

        turn_left(
            TURN_SPEED
        )


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            TURN_TIME
        ):

            stop_rover()

            turn_left_next = False

            rover_state = STOP_AFTER_TURN

            state_timer = now


        return


    # --------------------------------------------------------
    # RIGHT TURN
    # --------------------------------------------------------

    if rover_state == RIGHT_TURN:

        turn_right(
            TURN_SPEED
        )


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            TURN_TIME
        ):

            stop_rover()

            turn_left_next = True

            rover_state = STOP_AFTER_TURN

            state_timer = now


        return


    # --------------------------------------------------------
    # STOP AFTER TURN
    # --------------------------------------------------------

    if rover_state == STOP_AFTER_TURN:

        stop_rover()


        if (
            time.ticks_diff(
                now,
                state_timer
            )
            >=
            AFTER_TURN_PAUSE
        ):

            ir_count = 0

            obstacle_detected = False

            rover_state = FORWARD_MODE


        return


# ============================================================
# STATE NAME
# ============================================================

def state_name():

    if rover_state == FORWARD_MODE:
        return "FORWARD"

    if rover_state == REVERSE_WAIT:
        return "OBSTACLE -> STOP"

    if rover_state == BACKWARD_MODE:
        return "BACKWARD"

    if rover_state == STOP_BEFORE_TURN:
        return "STOP BEFORE TURN"

    if rover_state == LEFT_TURN:
        return "TURN LEFT"

    if rover_state == RIGHT_TURN:
        return "TURN RIGHT"

    if rover_state == STOP_AFTER_TURN:
        return "TURN COMPLETE"

    return "UNKNOWN"


# ============================================================
# INITIALISATION
# ============================================================

def setup():

    global previous_us


    print()
    print("================================")
    print("LOF TITAN ESP32-S3")
    print("MICROPYTHON UNIVERSAL ROVER")
    print("================================")


    # Safety
    stop_rover()


    # --------------------------------------------------------
    # AUTOMATIC I2C / MPU SEARCH
    # --------------------------------------------------------

    if not find_mpu():

        print()
        print(
            "ERROR: MPU6050 NOT DETECTED"
        )

        print(
            "ROVER STOPPED FOR SAFETY"
        )


        while True:

            stop_rover()

            time.sleep_ms(500)


    # --------------------------------------------------------
    # MPU CONFIGURATION
    # --------------------------------------------------------

    print()
    print(
        "Configuring MPU..."
    )


    # Wake MPU
    write_mpu(
        0x6B,
        0x01
    )


    # Sample rate
    write_mpu(
        0x19,
        9
    )


    # DLPF
    write_mpu(
        0x1A,
        0x05
    )


    # Gyro ±250 degrees/sec
    write_mpu(
        0x1B,
        0x00
    )


    # Accelerometer ±2g
    write_mpu(
        0x1C,
        0x00
    )


    time.sleep_ms(500)


    print()
    print("================================")
    print("STABILITY + OBSTACLE ROVER")
    print("================================")

    print(
        "I2C BUS:",
        active_bus_name
    )

    print(
        "I2C SDA: GPIO{}".format(
            active_sda
        )
    )

    print(
        "I2C SCL: GPIO{}".format(
            active_scl
        )
    )

    print(
        "MPU ADDRESS:",
        hex(MPU_ADDR)
    )


    # --------------------------------------------------------
    # CALIBRATION
    # --------------------------------------------------------

    calibrate_gyro()


    time.sleep_ms(300)


    calibrate_flat()


    previous_us = (
        time.ticks_us()
    )


    print()
    print("================================")
    print("ROVER READY")
    print("================================")
    print()


# ============================================================
# MAIN LOOP
# ============================================================

def main():

    global rover_state


    setup()


    last_print = 0

    last_tilt_warning = 0


    try:

        while True:

            # --------------------------------------------
            # MPU STABILITY
            # --------------------------------------------

            update_tilt()


            # --------------------------------------------
            # IR SENSOR
            # --------------------------------------------

            update_ir()


            # --------------------------------------------
            # STRONG TILT
            # Highest priority
            # --------------------------------------------

            if tilt_stop:

                stop_rover()

                rover_state = FORWARD_MODE


                now = time.ticks_ms()


                if (
                    time.ticks_diff(
                        now,
                        last_tilt_warning
                    )
                    >=
                    500
                ):

                    last_tilt_warning = now

                    print(
                        "STRONG TILT -> STOP"
                    )


                time.sleep_ms(5)

                continue


            # --------------------------------------------
            # OBSTACLE AVOIDANCE
            # --------------------------------------------

            obstacle_avoidance()


            # --------------------------------------------
            # SERIAL OUTPUT
            # --------------------------------------------

            now = time.ticks_ms()


            if (
                time.ticks_diff(
                    now,
                    last_print
                )
                >=
                150
            ):

                last_print = now


                print(
                    "Tilt:{:.1f} | IR:{} | {}".format(
                        filtered_tilt,

                        "OBSTACLE"
                        if obstacle_detected
                        else "CLEAR",

                        state_name()
                    )
                )


            # Keep supervisor/watchdog-friendly
            time.sleep_ms(5)


    except KeyboardInterrupt:

        print()
        print(
            "PROGRAM STOPPED"
        )


    except Exception as e:

        print()
        print(
            "PROGRAM ERROR:",
            e
        )


    finally:

        stop_rover()

        print(
            "MOTORS STOPPED"
        )


# ============================================================
# START
# ============================================================

main()