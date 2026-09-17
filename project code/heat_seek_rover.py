from machine import Pin, PWM, ADC
import machine
import time

# =====================================================
# HEAT SEEK ROVER - LOF TITAN ESP32-S3
# MicroPython conversion
# =====================================================

# ---------------- MOTOR PINS ----------------
LEFT_IN1 = 15
LEFT_IN2 = 16
RIGHT_IN1 = 13
RIGHT_IN2 = 14

# ---------------- SENSOR PINS ----------------
FIRE_PIN = 2
TRIG_PIN = 6
ECHO_PIN = 19

# ---------------- BUZZER ----------------
BUZZER_PIN = 20

# ---------------- PWM SETTINGS ----------------
PWM_FREQ = 5000

# ---------------- ROBOT SETTINGS ----------------
MOTOR_SPEED = 150
TURN_SPEED = 130
OBSTACLE_CM = 30

# ---------------- FLAME SENSOR ----------------
# 12-bit equivalent range: 0...4095
FIRE_FOUND_TH = 1500

# ---------------- MOVEMENT TIMINGS (ms) ----------------
AVOID_BACK_TIME = 450
AVOID_TURN_TIME = 500

FIRE_STOP_TIME = 5000
FIRE_BACK_TIME = 900
FIRE_TURN_TIME = 900

# ---------------- BUZZER TIMING (ms) ----------------
BUZZER_ON_TIME = 1000
BUZZER_OFF_TIME = 1000

# ---------------- SENSOR SAMPLE TIMINGS (ms) ----------------
FIRE_SAMPLE_MS = 50
DIST_SAMPLE_MS = 120
SERIAL_PRINT_MS = 300

# =====================================================
# STATES
# =====================================================
RUN_FORWARD = 0
AVOID_BACKWARD = 1
AVOID_TURNLEFT = 2
FIRE_WAIT = 3
FIRE_BACKWARD = 4
FIRE_TURN_LEFT = 5
FIRE_TURN_RIGHT = 6

STATE_NAMES = {
    RUN_FORWARD: "RUN",
    AVOID_BACKWARD: "AVOID BACK",
    AVOID_TURNLEFT: "AVOID LEFT",
    FIRE_WAIT: "FIRE WAIT",
    FIRE_BACKWARD: "FIRE BACK",
    FIRE_TURN_LEFT: "FIRE LEFT",
    FIRE_TURN_RIGHT: "FIRE RIGHT",
}

# =====================================================
# PIN SETUP
# =====================================================
trig = Pin(TRIG_PIN, Pin.OUT, value=0)
echo = Pin(ECHO_PIN, Pin.IN)
buzzer = Pin(BUZZER_PIN, Pin.OUT, value=0)

fire_adc = ADC(Pin(FIRE_PIN))

try:
    fire_adc.atten(ADC.ATTN_11DB)
except Exception:
    pass

# =====================================================
# PWM SETUP
# =====================================================
left_in1_pwm = PWM(Pin(LEFT_IN1), freq=PWM_FREQ, duty_u16=0)
left_in2_pwm = PWM(Pin(LEFT_IN2), freq=PWM_FREQ, duty_u16=0)
right_in1_pwm = PWM(Pin(RIGHT_IN1), freq=PWM_FREQ, duty_u16=0)
right_in2_pwm = PWM(Pin(RIGHT_IN2), freq=PWM_FREQ, duty_u16=0)

# =====================================================
# PWM FUNCTIONS
# =====================================================
def pwm_write(pwm, value):
    value = max(0, min(255, int(value)))
    duty = (value * 65535) // 255
    pwm.duty_u16(duty)


def stop_motors():
    pwm_write(left_in1_pwm, 0)
    pwm_write(left_in2_pwm, 0)
    pwm_write(right_in1_pwm, 0)
    pwm_write(right_in2_pwm, 0)


def left_motor_forward(speed):
    pwm_write(left_in1_pwm, speed)
    pwm_write(left_in2_pwm, 0)


def left_motor_backward(speed):
    pwm_write(left_in1_pwm, 0)
    pwm_write(left_in2_pwm, speed)


def right_motor_forward(speed):
    pwm_write(right_in1_pwm, speed)
    pwm_write(right_in2_pwm, 0)


def right_motor_backward(speed):
    pwm_write(right_in1_pwm, 0)
    pwm_write(right_in2_pwm, speed)


def drive_forward(speed):
    left_motor_forward(speed)
    right_motor_forward(speed)


def drive_backward(speed):
    left_motor_backward(speed)
    right_motor_backward(speed)


def turn_left(speed):
    left_motor_backward(speed)
    right_motor_forward(speed)


def turn_right(speed):
    left_motor_forward(speed)
    right_motor_backward(speed)


# =====================================================
# ULTRASONIC SENSOR
# =====================================================
def get_distance_cm():
    trig.value(0)
    time.sleep_us(2)

    trig.value(1)
    time.sleep_us(10)
    trig.value(0)

    try:
        duration = machine.time_pulse_us(echo, 1, 30000)
    except Exception:
        return -1

    if duration <= 0:
        return -1

    distance = (duration * 0.0343) / 2.0

    if distance < 2 or distance > 400:
        return -1

    return int(distance)


# =====================================================
# FLAME SENSOR
# =====================================================
def read_fire_raw():
    # MicroPython ADC returns 0...65535.
    # Convert to Arduino-style 12-bit range 0...4095.
    return fire_adc.read_u16() >> 4


def get_fire_strength(raw_value):
    return 4095 - raw_value


def fire_detected(raw_value):
    return raw_value <= FIRE_FOUND_TH


def obstacle_detected(distance_cm):
    return distance_cm > 0 and distance_cm < OBSTACLE_CM


# =====================================================
# BUZZER
# =====================================================
buzzer_state = False
last_buzzer_ms = time.ticks_ms()


def buzzer_off():
    global buzzer_state
    buzzer_state = False
    buzzer.value(0)


def update_emergency_buzzer(alarm_active):
    global buzzer_state, last_buzzer_ms

    now = time.ticks_ms()

    if not alarm_active:
        buzzer_off()
        last_buzzer_ms = now
        return

    elapsed = time.ticks_diff(now, last_buzzer_ms)

    if buzzer_state:
        if elapsed >= BUZZER_ON_TIME:
            buzzer_state = False
            last_buzzer_ms = now
            buzzer.value(0)
    else:
        if elapsed >= BUZZER_OFF_TIME:
            buzzer_state = True
            last_buzzer_ms = now
            buzzer.value(1)


# =====================================================
# STARTUP
# =====================================================
stop_motors()
buzzer_off()

state = RUN_FORWARD
state_start_ms = time.ticks_ms()

last_fire_sample_ms = time.ticks_ms()
last_dist_sample_ms = time.ticks_ms()
last_serial_ms = time.ticks_ms()

distance_cm = -1
fire_value = 4095
fire_strength = 0

escape_turn_left = True

print()
print("=================================")
print(" CAN-BOT - LOF TITAN PCB")
print(" MicroPython")
print("=================================")
print()
print("TITAN PCB PINOUT")
print("Flame Sensor: S1 -> GPIO2")
print("Ultrasonic: TRIG -> GPIO6 | ECHO -> GPIO19")
print("Motors: LEFT -> M1 GPIO15/16 | RIGHT -> M2 GPIO13/14")
print("Buzzer -> GPIO20")
print("Obstacle threshold = {} cm".format(OBSTACLE_CM))
print("Fire threshold = {}".format(FIRE_FOUND_TH))
print("System Started...")

# =====================================================
# MAIN LOOP
# =====================================================
while True:
    now = time.ticks_ms()

    # ---------------- ULTRASONIC SAMPLE ----------------
    if time.ticks_diff(now, last_dist_sample_ms) >= DIST_SAMPLE_MS:
        last_dist_sample_ms = now
        distance_cm = get_distance_cm()

    # ---------------- FLAME SENSOR SAMPLE ----------------
    if time.ticks_diff(now, last_fire_sample_ms) >= FIRE_SAMPLE_MS:
        last_fire_sample_ms = now
        fire_value = read_fire_raw()
        fire_strength = get_fire_strength(fire_value)

    fire_now = fire_detected(fire_value)
    obstacle_now = obstacle_detected(distance_cm)

    # ---------------- FIRE ALARM MODE ----------------
    fire_mode = (
        fire_now
        or state == FIRE_WAIT
        or state == FIRE_BACKWARD
        or state == FIRE_TURN_LEFT
        or state == FIRE_TURN_RIGHT
    )

    update_emergency_buzzer(fire_mode)

    # ---------------- SERIAL / REPL MONITOR ----------------
    if time.ticks_diff(now, last_serial_ms) >= SERIAL_PRINT_MS:
        last_serial_ms = now

        if distance_cm == -1:
            distance_text = "NO READING"
        else:
            distance_text = "{} cm".format(distance_cm)

        print(
            "STATE: {} | DIST: {} | FIRE RAW: {} | "
            "FIRE STRENGTH: {} | FIRE: {} | OBSTACLE: {}".format(
                STATE_NAMES.get(state, "UNKNOWN"),
                distance_text,
                fire_value,
                fire_strength,
                "YES" if fire_now else "NO",
                "YES" if obstacle_now else "NO",
            )
        )

    # ---------------- FIRE PRIORITY ----------------
    if (
        fire_now
        and state != FIRE_WAIT
        and state != FIRE_BACKWARD
        and state != FIRE_TURN_LEFT
        and state != FIRE_TURN_RIGHT
    ):
        stop_motors()

        print()
        print("!!! FIRE DETECTED !!!")
        print("STOP FOR 5 SECONDS + ALARM")

        state = FIRE_WAIT
        state_start_ms = now

        time.sleep_ms(1)
        continue

    # =================================================
    # STATE MACHINE
    # =================================================

    # ---------------- NORMAL FORWARD ----------------
    if state == RUN_FORWARD:
        if obstacle_now:
            stop_motors()

            print("OBSTACLE DETECTED -> BACKWARD")

            state = AVOID_BACKWARD
            state_start_ms = now
        else:
            drive_forward(MOTOR_SPEED)

    # ---------------- OBSTACLE BACKWARD ----------------
    elif state == AVOID_BACKWARD:
        drive_backward(MOTOR_SPEED)

        if time.ticks_diff(now, state_start_ms) >= AVOID_BACK_TIME:
            stop_motors()

            print("BACKWARD DONE -> TURN LEFT")

            state = AVOID_TURNLEFT
            state_start_ms = now

    # ---------------- OBSTACLE TURN LEFT ----------------
    elif state == AVOID_TURNLEFT:
        turn_left(TURN_SPEED)

        if time.ticks_diff(now, state_start_ms) >= AVOID_TURN_TIME:
            stop_motors()

            print("TURN COMPLETE -> FORWARD")

            state = RUN_FORWARD
            state_start_ms = now

    # ---------------- FIRE WAIT ----------------
    elif state == FIRE_WAIT:
        stop_motors()

        if time.ticks_diff(now, state_start_ms) >= FIRE_STOP_TIME:
            print("5 SEC COMPLETE -> FIRE ESCAPE")

            state = FIRE_BACKWARD
            state_start_ms = now

    # ---------------- FIRE BACKWARD ----------------
    elif state == FIRE_BACKWARD:
        drive_backward(MOTOR_SPEED)

        if time.ticks_diff(now, state_start_ms) >= FIRE_BACK_TIME:
            stop_motors()

            if escape_turn_left:
                print("FIRE ESCAPE -> TURN LEFT")
                state = FIRE_TURN_LEFT
            else:
                print("FIRE ESCAPE -> TURN RIGHT")
                state = FIRE_TURN_RIGHT

            state_start_ms = now

    # ---------------- FIRE TURN LEFT ----------------
    elif state == FIRE_TURN_LEFT:
        turn_left(TURN_SPEED)

        if time.ticks_diff(now, state_start_ms) >= FIRE_TURN_TIME:
            stop_motors()

            escape_turn_left = False

            if fire_detected(fire_value):
                print("FIRE STILL DETECTED -> WAIT AGAIN")
                state = FIRE_WAIT
            else:
                print("FIRE CLEARED -> FORWARD")
                state = RUN_FORWARD

            state_start_ms = now

    # ---------------- FIRE TURN RIGHT ----------------
    elif state == FIRE_TURN_RIGHT:
        turn_right(TURN_SPEED)

        if time.ticks_diff(now, state_start_ms) >= FIRE_TURN_TIME:
            stop_motors()

            escape_turn_left = True

            if fire_detected(fire_value):
                print("FIRE STILL DETECTED -> WAIT AGAIN")
                state = FIRE_WAIT
            else:
                print("FIRE CLEARED -> FORWARD")
                state = RUN_FORWARD

            state_start_ms = now

    time.sleep_ms(1)
