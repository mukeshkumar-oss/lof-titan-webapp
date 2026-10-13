# ================================================================
# LOF TITAN ESP32-S3
# 6 AXIS ROBOTIC ARM WEB CONTROLLER
# PCA9685 + MicroPython
#
# SERVO MAP
# ------------------------------------------------
# CH0 / Servo 1 = Gripper
# CH1 / Servo 2 = Wrist
# CH2 / Servo 3 = Elbow
# CH3 / Servo 4 = Shoulder
# CH4 / Servo 5 = Base Shoulder
# CH5 / Servo 6 = Base
#
# WIFI
# ------------------------------------------------
# SSID     : ARM_6AXIS
# Password : 12345678
# IP       : 192.168.4.1
#
# I2C
# ------------------------------------------------
# SDA = GPIO 7
# SCL = GPIO 8
# ================================================================

from machine import Pin, I2C, WDT
import network
import socket
import select
import time
import gc


# ================================================================
# WATCHDOG
# ================================================================

wdt = WDT(timeout=8000)
wdt.feed()


# ================================================================
# I2C SETTINGS
# ================================================================

SDA_PIN = 7
SCL_PIN = 8

PCA_ADDR = 0x40


# ================================================================
# WIFI SETTINGS
# ================================================================

SSID = "ARM_6AXIS"
PASSWORD = "12345678"


# ================================================================
# SERVO SETTINGS
# ================================================================

NUM_SERVOS = 6

SERVO_FREQ = 50

SERVO_MIN_US = 500
SERVO_MAX_US = 2500


# ================================================================
# JOINT NAMES
# ================================================================

JOINT_NAMES = [
    "Gripper",        # Servo 1
    "Wrist",          # Servo 2
    "Elbow",          # Servo 3
    "Shoulder",       # Servo 4
    "Base Shoulder",  # Servo 5
    "Base"            # Servo 6
]


# ================================================================
# MINIMUM ANGLES
# ================================================================

MIN_ANGLES = [
    25,    # Servo 1 - Gripper
    40,    # Servo 2 - Wrist
    0,     # Servo 3 - Elbow
    0,     # Servo 4 - Shoulder
    0,     # Servo 5 - Base Shoulder
    0      # Servo 6 - Base
]


# ================================================================
# MAXIMUM ANGLES
# ================================================================

MAX_ANGLES = [
    180,   # Servo 1
    170,   # Servo 2
    180,   # Servo 3
    125,   # Servo 4  <<< NEW LIMIT
    180,   # Servo 5
    180    # Servo 6
]


# ================================================================
# HOME POSITIONS
# ================================================================

HOME_ANGLES = [
    180,   # Servo 1 - Gripper
    90,    # Servo 2 - Wrist
    45,    # Servo 3 - Elbow
    90,    # Servo 4 - Shoulder
    90,    # Servo 5 - Base Shoulder
    90     # Servo 6 - Base
]


current_angles = HOME_ANGLES[:]


# ================================================================
# PCA9685 DRIVER
# ================================================================

class PCA9685:

    MODE1 = 0x00
    PRESCALE = 0xFE
    LED0_ON_L = 0x06


    def __init__(self, i2c, address=0x40):

        self.i2c = i2c
        self.address = address

        self.write_reg(
            self.MODE1,
            0x00
        )

        time.sleep_ms(10)

        wdt.feed()


    def write_reg(self, reg, value):

        self.i2c.writeto_mem(
            self.address,
            reg,
            bytes([value])
        )


    def read_reg(self, reg):

        return self.i2c.readfrom_mem(
            self.address,
            reg,
            1
        )[0]


    def set_frequency(self, freq):

        prescale_value = 25000000.0

        prescale_value /= 4096.0
        prescale_value /= float(freq)
        prescale_value -= 1.0

        prescale = int(
            prescale_value + 0.5
        )

        old_mode = self.read_reg(
            self.MODE1
        )

        sleep_mode = (
            old_mode & 0x7F
        ) | 0x10


        self.write_reg(
            self.MODE1,
            sleep_mode
        )


        self.write_reg(
            self.PRESCALE,
            prescale
        )


        self.write_reg(
            self.MODE1,
            old_mode
        )


        time.sleep_ms(5)


        self.write_reg(
            self.MODE1,
            old_mode | 0xA1
        )

        wdt.feed()


    def set_pwm(
        self,
        channel,
        on_value,
        off_value
    ):

        register = (
            self.LED0_ON_L
            +
            (4 * channel)
        )

        data = bytes([
            on_value & 0xFF,
            (on_value >> 8) & 0xFF,
            off_value & 0xFF,
            (off_value >> 8) & 0xFF
        ])

        self.i2c.writeto_mem(
            self.address,
            register,
            data
        )


# ================================================================
# START I2C
# ================================================================

print()
print("========================================")
print("       6 AXIS ROBOTIC ARM")
print("     LOF TITAN ESP32-S3")
print("========================================")


i2c = I2C(
    0,
    sda=Pin(SDA_PIN),
    scl=Pin(SCL_PIN),
    freq=400000
)


wdt.feed()


devices = i2c.scan()


print()
print("I2C DEVICES:")


for device in devices:

    print(
        "Found:",
        hex(device)
    )


if PCA_ADDR not in devices:

    print()
    print("ERROR: PCA9685 NOT FOUND!")

    while True:

        wdt.feed()

        time.sleep_ms(
            500
        )


print()
print("PCA9685 FOUND AT 0x40")


if 0x70 in devices:

    print(
        "0x70 PCA9685 ALLCALL - NORMAL"
    )


# ================================================================
# INITIALISE PCA9685
# ================================================================

pca = PCA9685(
    i2c,
    PCA_ADDR
)

pca.set_frequency(
    SERVO_FREQ
)


# ================================================================
# ANGLE TO PWM
# ================================================================

def angle_to_pwm(angle):

    pulse_us = (
        SERVO_MIN_US
        +
        (
            (
                SERVO_MAX_US
                -
                SERVO_MIN_US
            )
            *
            angle
            /
            180
        )
    )


    period_us = (
        1000000
        /
        SERVO_FREQ
    )


    pwm_value = int(
        pulse_us
        *
        4096
        /
        period_us
    )


    return pwm_value


# ================================================================
# SET SERVO
# ================================================================

def set_servo(
    channel,
    angle
):

    global current_angles


    if channel < 0:
        return


    if channel >= NUM_SERVOS:
        return


    angle = int(angle)


    # ------------------------------------------------
    # Safety limits
    # ------------------------------------------------

    if angle < MIN_ANGLES[channel]:

        angle = MIN_ANGLES[channel]


    if angle > MAX_ANGLES[channel]:

        angle = MAX_ANGLES[channel]


    pwm_value = angle_to_pwm(
        angle
    )


    pca.set_pwm(
        channel,
        0,
        pwm_value
    )


    current_angles[channel] = angle


    print(
        "S",
        channel + 1,
        JOINT_NAMES[channel],
        "=",
        angle
    )


    wdt.feed()


# ================================================================
# SMOOTH SINGLE SERVO MOVEMENT
# ================================================================

def smooth_move(
    channel,
    target,
    delay_ms=10
):

    target = int(target)


    if target < MIN_ANGLES[channel]:

        target = MIN_ANGLES[channel]


    if target > MAX_ANGLES[channel]:

        target = MAX_ANGLES[channel]


    start = current_angles[channel]


    if start == target:

        return


    if target > start:

        direction = 1

    else:

        direction = -1


    angle = start


    while angle != target:

        angle += direction


        set_servo(
            channel,
            angle
        )


        wdt.feed()


        time.sleep_ms(
            delay_ms
        )


# ================================================================
# MOVE ONE DEGREE
# ================================================================

def move_one_degree(
    channel,
    delta
):

    new_angle = (
        current_angles[channel]
        +
        delta
    )


    if new_angle < MIN_ANGLES[channel]:

        new_angle = MIN_ANGLES[channel]


    if new_angle > MAX_ANGLES[channel]:

        new_angle = MAX_ANGLES[channel]


    set_servo(
        channel,
        new_angle
    )


    return current_angles[channel]


# ================================================================
# SMOOTH HOME ALL
# All joints move together gradually
# ================================================================

def home_all():

    print()
    print("SMOOTH HOME START")


    finished = False


    while not finished:

        finished = True


        for channel in range(
            NUM_SERVOS
        ):

            current = current_angles[channel]

            target = HOME_ANGLES[channel]


            if current < target:

                current += 1

                finished = False


            elif current > target:

                current -= 1

                finished = False


            if current != current_angles[channel]:

                set_servo(
                    channel,
                    current
                )


        wdt.feed()

        time.sleep_ms(
            12
        )


    print("HOME COMPLETE")


# ================================================================
# RELEASE SERVOS
# ================================================================

def release_servos():

    print()
    print("SERVOS RELEASED")


    for channel in range(
        NUM_SERVOS
    ):

        pca.set_pwm(
            channel,
            0,
            0
        )

        wdt.feed()


# ================================================================
# WEB PAGE
# ================================================================

def web_page():

    html = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,
initial-scale=1.0,
maximum-scale=1.0,
user-scalable=no,
viewport-fit=cover"
>

<meta
name="theme-color"
content="#050816"
>

<title>
LOF Robotic Arm
</title>


<style>

:root{

    --bg:#050816;

    --panel:rgba(
        15,
        23,
        42,
        0.82
    );

    --border:rgba(
        94,
        234,
        212,
        0.20
    );

    --cyan:#5eead4;

    --blue:#38bdf8;

    --purple:#818cf8;

    --red:#fb7185;

    --green:#4ade80;

    --text:#f8fafc;

    --muted:#94a3b8;

}


*{

    box-sizing:border-box;

    margin:0;

    padding:0;

    -webkit-tap-highlight-color:
    transparent;

    touch-action:
    manipulation;

}


html,
body{

    width:100%;

    height:100%;

    overflow:hidden;

    overscroll-behavior:none;

}


body{

    font-family:
    Arial,
    Helvetica,
    sans-serif;

    background:
    #050816;

    color:
    var(--text);

}


/* =========================================================
   ANIMATED BACKGROUND
   ========================================================= */

.background{

    position:fixed;

    inset:0;

    overflow:hidden;

    z-index:-5;

    background:

    radial-gradient(
        circle at 15% 20%,
        rgba(56,189,248,.18),
        transparent 30%
    ),

    radial-gradient(
        circle at 80% 25%,
        rgba(129,140,248,.18),
        transparent 32%
    ),

    radial-gradient(
        circle at 50% 90%,
        rgba(94,234,212,.12),
        transparent 40%
    ),

    linear-gradient(
        135deg,
        #020617,
        #071127,
        #050816
    );

}


.orb{

    position:absolute;

    border-radius:50%;

    filter:blur(10px);

    opacity:.28;

    animation:
    floatOrb 10s
    ease-in-out
    infinite;

}


.orb1{

    width:230px;

    height:230px;

    background:#0ea5e9;

    left:-80px;

    top:-60px;

}


.orb2{

    width:300px;

    height:300px;

    background:#6366f1;

    right:-100px;

    top:25%;

    animation-delay:
    -4s;

}


.orb3{

    width:230px;

    height:230px;

    background:#14b8a6;

    left:40%;

    bottom:-130px;

    animation-delay:
    -7s;

}


@keyframes floatOrb{

    0%,
    100%{

        transform:
        translate3d(
            0,
            0,
            0
        )
        scale(1);

    }

    50%{

        transform:
        translate3d(
            30px,
            -24px,
            0
        )
        scale(1.08);

    }

}


/* =========================================================
   MAIN LAYOUT
   ========================================================= */

.app{

    width:100%;

    height:100dvh;

    display:grid;

    grid-template-rows:
    auto
    1fr
    auto;

    gap:7px;

    padding:

    max(
        6px,
        env(safe-area-inset-top)
    )

    max(
        7px,
        env(safe-area-inset-right)
    )

    max(
        6px,
        env(safe-area-inset-bottom)
    )

    max(
        7px,
        env(safe-area-inset-left)
    );

}


/* =========================================================
   HEADER
   ========================================================= */

.header{

    height:46px;

    display:flex;

    align-items:center;

    justify-content:
    space-between;

    padding:
    0 12px;

    border:
    1px solid
    var(--border);

    border-radius:
    14px;

    background:
    rgba(
        8,
        15,
        32,
        .78
    );

    backdrop-filter:
    blur(14px);

    box-shadow:
    0 8px 30px
    rgba(
        0,
        0,
        0,
        .25
    );

}


.brand{

    display:flex;

    align-items:center;

    gap:10px;

    min-width:0;

}


.logo{

    width:30px;

    height:30px;

    border-radius:9px;

    display:grid;

    place-items:center;

    font-size:13px;

    font-weight:900;

    color:#020617;

    background:
    linear-gradient(
        135deg,
        var(--cyan),
        var(--blue)
    );

    box-shadow:
    0 0 18px
    rgba(
        94,
        234,
        212,
        .35
    );

}


.brandText{

    text-align:left;

    line-height:1.05;

}


.title{

    font-size:
    clamp(
        13px,
        2vw,
        18px
    );

    font-weight:800;

    letter-spacing:
    .5px;

}


.subtitle{

    margin-top:3px;

    color:
    var(--muted);

    font-size:
    clamp(
        8px,
        1vw,
        10px
    );

}


.headerRight{

    display:flex;

    gap:7px;

    align-items:center;

}


.status{

    display:flex;

    align-items:center;

    gap:6px;

    padding:
    6px 9px;

    border-radius:
    999px;

    background:
    rgba(
        74,
        222,
        128,
        .08
    );

    border:
    1px solid
    rgba(
        74,
        222,
        128,
        .22
    );

    color:
    #86efac;

    font-size:
    9px;

    font-weight:700;

}


.statusDot{

    width:7px;

    height:7px;

    border-radius:50%;

    background:
    #4ade80;

    box-shadow:
    0 0 10px
    #4ade80;

    animation:
    pulse 1.4s infinite;

}


@keyframes pulse{

    50%{

        opacity:.35;

    }

}


.iconButton{

    height:31px;

    padding:
    0 10px;

    border:none;

    border-radius:
    9px;

    cursor:pointer;

    background:
    rgba(
        56,
        189,
        248,
        .12
    );

    border:
    1px solid
    rgba(
        56,
        189,
        248,
        .25
    );

    color:
    #bae6fd;

    font-size:
    9px;

    font-weight:800;

}


/* =========================================================
   SERVO GRID
   ========================================================= */

.grid{

    min-height:0;

    display:grid;

    grid-template-columns:
    repeat(
        3,
        1fr
    );

    grid-template-rows:
    repeat(
        2,
        minmax(
            0,
            1fr
        )
    );

    gap:7px;

}


.card{

    min-width:0;

    min-height:0;

    display:grid;

    grid-template-rows:
    auto
    1fr
    auto;

    padding:
    clamp(
        7px,
        1.4vh,
        12px
    );

    border:
    1px solid
    var(--border);

    border-radius:
    15px;

    background:
    linear-gradient(
        145deg,
        rgba(
            15,
            23,
            42,
            .88
        ),
        rgba(
            8,
            15,
            32,
            .72
        )
    );

    backdrop-filter:
    blur(13px);

    box-shadow:
    inset
    0 1px 0
    rgba(
        255,
        255,
        255,
        .04
    ),
    0 8px 28px
    rgba(
        0,
        0,
        0,
        .18
    );

    overflow:hidden;

    position:relative;

}


.card:before{

    content:"";

    position:absolute;

    left:0;

    top:0;

    width:3px;

    height:100%;

    background:
    linear-gradient(
        to bottom,
        var(--cyan),
        transparent
    );

}


.cardTop{

    display:flex;

    align-items:flex-start;

    justify-content:
    space-between;

    gap:6px;

}


.servoID{

    color:
    var(--cyan);

    font-size:
    clamp(
        8px,
        .9vw,
        10px
    );

    font-weight:800;

    letter-spacing:
    1px;

}


.jointName{

    margin-top:2px;

    font-size:
    clamp(
        11px,
        1.45vw,
        15px
    );

    font-weight:800;

    white-space:nowrap;

    overflow:hidden;

    text-overflow:
    ellipsis;

}


.angleBox{

    display:flex;

    align-items:
    baseline;

    gap:2px;

    color:
    var(--blue);

}


.angleValue{

    font-size:
    clamp(
        22px,
        4vh,
        38px
    );

    line-height:1;

    font-weight:900;

    font-variant-numeric:
    tabular-nums;

    text-shadow:
    0 0 20px
    rgba(
        56,
        189,
        248,
        .25
    );

}


.degree{

    font-size:
    12px;

    color:
    var(--muted);

}


/* =========================================================
   ANGLE RANGE
   ========================================================= */

.middle{

    display:flex;

    flex-direction:column;

    justify-content:center;

}


.rangeLine{

    width:100%;

    height:5px;

    margin-top:7px;

    border-radius:
    999px;

    background:
    rgba(
        148,
        163,
        184,
        .12
    );

    overflow:hidden;

}


.rangeFill{

    height:100%;

    border-radius:
    999px;

    background:
    linear-gradient(
        90deg,
        var(--cyan),
        var(--blue),
        var(--purple)
    );

    transition:
    width .14s ease;

}


.rangeInfo{

    display:flex;

    justify-content:
    space-between;

    margin-top:5px;

    color:
    var(--muted);

    font-size:
    clamp(
        7px,
        .85vw,
        9px
    );

}


/* =========================================================
   SERVO BUTTONS
   ========================================================= */

.controls{

    display:grid;

    grid-template-columns:
    1fr
    .7fr
    1fr;

    gap:6px;

}


.jog{

    min-height:
    clamp(
        30px,
        6vh,
        44px
    );

    border:none;

    border-radius:
    10px;

    cursor:pointer;

    color:white;

    font-size:
    clamp(
        15px,
        2.2vw,
        22px
    );

    font-weight:900;

    background:
    linear-gradient(
        145deg,
        rgba(
            30,
            41,
            59,
            .95
        ),
        rgba(
            15,
            23,
            42,
            .95
        )
    );

    border:
    1px solid
    rgba(
        148,
        163,
        184,
        .18
    );

    user-select:none;

    -webkit-user-select:none;

}


.jog:active{

    transform:
    scale(.96);

    background:
    rgba(
        56,
        189,
        248,
        .22
    );

}


.minus{

    color:
    #fda4af;

}


.plus{

    color:
    #67e8f9;

}


.homeJoint{

    border:none;

    border-radius:
    10px;

    cursor:pointer;

    color:
    #c7d2fe;

    font-size:
    clamp(
        7px,
        1vw,
        10px
    );

    font-weight:900;

    background:
    rgba(
        99,
        102,
        241,
        .13
    );

    border:
    1px solid
    rgba(
        129,
        140,
        248,
        .22
    );

}


/* =========================================================
   BOTTOM CONTROLS
   ========================================================= */

.bottomBar{

    display:grid;

    grid-template-columns:
    1fr
    1fr
    1fr;

    gap:7px;

    height:42px;

}


.mainButton{

    border:none;

    border-radius:
    12px;

    cursor:pointer;

    color:white;

    font-size:
    clamp(
        9px,
        1.2vw,
        12px
    );

    font-weight:900;

    letter-spacing:
    .5px;

}


.homeAll{

    background:
    linear-gradient(
        135deg,
        #2563eb,
        #4f46e5
    );

}


.release{

    background:
    linear-gradient(
        135deg,
        #be123c,
        #e11d48
    );

}


.fullscreen{

    background:
    linear-gradient(
        135deg,
        #0f766e,
        #0891b2
    );

}


.mainButton:active{

    transform:
    scale(.98);

}


/* =========================================================
   PORTRAIT
   Still no scrolling
   ========================================================= */

@media(
    orientation:portrait
){

    .grid{

        grid-template-columns:
        repeat(
            2,
            1fr
        );

        grid-template-rows:
        repeat(
            3,
            minmax(
                0,
                1fr
            )
        );

    }


    .header{

        height:
        42px;

    }


    .card{

        padding:
        6px;

        border-radius:
        11px;

    }


    .angleValue{

        font-size:
        clamp(
            19px,
            3.2vh,
            28px
        );

    }


    .status{

        display:none;

    }


    .bottomBar{

        height:
        38px;

    }

}


/* =========================================================
   VERY SMALL SCREENS
   ========================================================= */

@media(
    max-height:500px
){

    .header{

        height:
        40px;

    }

    .subtitle{

        display:none;

    }

    .card{

        padding:
        6px 8px;

    }

    .rangeInfo{

        margin-top:
        2px;

    }

    .rangeLine{

        margin-top:
        3px;

    }

    .bottomBar{

        height:
        36px;

    }

}

</style>

</head>


<body>

<div class="background">

<div class="orb orb1"></div>

<div class="orb orb2"></div>

<div class="orb orb3"></div>

</div>


<div class="app">


<!-- =========================================================
     HEADER
     ========================================================= -->

<div class="header">

<div class="brand">

<div class="logo">
6X
</div>

<div class="brandText">

<div class="title">
ROBOTIC ARM CONTROL
</div>

<div class="subtitle">
LOF TITAN • PCA9685 • 6 AXIS
</div>

</div>

</div>


<div class="headerRight">

<div class="status">

<span class="statusDot"></span>

CONNECTED

</div>


<button
class="iconButton"
onclick="enterFullScreen()"
>
FULLSCREEN
</button>

</div>

</div>


<!-- =========================================================
     SERVO GRID
     ========================================================= -->

<div class="grid">
"""


    # ============================================================
    # GENERATE 6 SERVO CARDS
    # ============================================================

    for i in range(
        NUM_SERVOS
    ):

        minimum = MIN_ANGLES[i]

        maximum = MAX_ANGLES[i]

        current = current_angles[i]

        home = HOME_ANGLES[i]


        percent = int(
            (
                current
                -
                minimum
            )
            *
            100
            /
            (
                maximum
                -
                minimum
            )
        )


        html += """

<div class="card">

<div class="cardTop">

<div>

<div class="servoID">
SERVO %d • CH%d
</div>

<div class="jointName">
%s
</div>

</div>


<div class="angleBox">

<span
class="angleValue"
id="angle%d"
>
%d
</span>

<span class="degree">
°
</span>

</div>

</div>


<div class="middle">

<div class="rangeLine">

<div
class="rangeFill"
id="fill%d"
style="width:%d%%"
>
</div>

</div>


<div class="rangeInfo">

<span>
MIN %d°
</span>

<span>
HOME %d°
</span>

<span>
MAX %d°
</span>

</div>

</div>


<div class="controls">


<button
class="jog minus"
onpointerdown="startJog(%d,-1)"
onpointerup="stopJog()"
onpointercancel="stopJog()"
onpointerleave="stopJog()"
>
−1
</button>


<button
class="homeJoint"
onclick="jointHome(%d,%d)"
>
HOME
</button>


<button
class="jog plus"
onpointerdown="startJog(%d,1)"
onpointerup="stopJog()"
onpointercancel="stopJog()"
onpointerleave="stopJog()"
>
+1
</button>


</div>

</div>

""" % (

            i + 1,
            i,
            JOINT_NAMES[i],

            i,
            current,

            i,
            percent,

            minimum,
            home,
            maximum,

            i,

            i,
            home,

            i
        )


    html += """

</div>


<!-- =========================================================
     BOTTOM CONTROL BAR
     ========================================================= -->

<div class="bottomBar">


<button
class="mainButton homeAll"
onclick="homeAll()"
>
HOME ALL
</button>


<button
class="mainButton release"
onclick="releaseAll()"
>
RELEASE
</button>


<button
class="mainButton fullscreen"
onclick="enterFullScreen()"
>
FULL SCREEN
</button>


</div>

</div>


<script>

/* ============================================================
   SERVO LIMITS
   ============================================================ */

const minAngles = [
    25,
    40,
    0,
    0,
    0,
    0
];


const maxAngles = [
    180,
    170,
    180,
    125,
    180,
    180
];


const homeAngles = [
    180,
    90,
    45,
    90,
    90,
    90
];


let angles = [
    180,
    90,
    45,
    90,
    90,
    90
];


let jogTimer = null;

let jogBusy = false;


/* ============================================================
   UPDATE DISPLAY
   ============================================================ */

function updateDisplay(
    channel,
    angle
){

    angle =
    parseInt(
        angle
    );


    angles[channel] =
    angle;


    document.getElementById(
        "angle" + channel
    ).textContent =
    angle;


    let min =
    minAngles[channel];


    let max =
    maxAngles[channel];


    let percent =
    (
        (
            angle
            -
            min
        )
        /
        (
            max
            -
            min
        )
    )
    *
    100;


    if(
        percent < 0
    ){

        percent = 0;

    }


    if(
        percent > 100
    ){

        percent = 100;

    }


    document.getElementById(
        "fill" + channel
    ).style.width =
    percent + "%";

}


/* ============================================================
   MOVE ONE DEGREE
   ============================================================ */

async function jogOnce(
    channel,
    delta
){

    if(
        jogBusy
    ){

        return;

    }


    jogBusy =
    true;


    try{

        const response =
        await fetch(
            "/move?ch="
            +
            channel
            +
            "&delta="
            +
            delta
        );


        const value =
        await response.text();


        const angle =
        parseInt(
            value
        );


        if(
            !isNaN(
                angle
            )
        ){

            updateDisplay(
                channel,
                angle
            );

        }

    }

    catch(error){

    }


    jogBusy =
    false;

}


/* ============================================================
   PRESS + HOLD
   First press = 1 degree
   Continue holding = one degree steps
   ============================================================ */

function startJog(
    channel,
    delta
){

    stopJog();


    jogOnce(
        channel,
        delta
    );


    jogTimer =
    setInterval(
        function(){

            jogOnce(
                channel,
                delta
            );

        },
        110
    );

}


function stopJog(){

    if(
        jogTimer
    ){

        clearInterval(
            jogTimer
        );

        jogTimer =
        null;

    }

}


/* ============================================================
   INDIVIDUAL HOME
   ============================================================ */

async function jointHome(
    channel,
    angle
){

    stopJog();


    try{

        const response =
        await fetch(
            "/servo?ch="
            +
            channel
            +
            "&angle="
            +
            angle
            +
            "&smooth=1"
        );


        const value =
        await response.text();


        const newAngle =
        parseInt(
            value
        );


        if(
            !isNaN(
                newAngle
            )
        ){

            updateDisplay(
                channel,
                newAngle
            );

        }

    }

    catch(error){

    }

}


/* ============================================================
   HOME ALL
   ============================================================ */

async function homeAll(){

    stopJog();


    try{

        await fetch(
            "/home"
        );


        for(
            let i = 0;
            i < 6;
            i++
        ){

            updateDisplay(
                i,
                homeAngles[i]
            );

        }

    }

    catch(error){

    }

}


/* ============================================================
   RELEASE
   ============================================================ */

async function releaseAll(){

    stopJog();


    try{

        await fetch(
            "/release"
        );

    }

    catch(error){

    }

}


/* ============================================================
   FULLSCREEN + LANDSCAPE LOCK + WAKE LOCK
   ============================================================ */

let wakeLock = null;


async function enterFullScreen(){

    try{

        if(
            !document.fullscreenElement
        ){

            await document.documentElement.requestFullscreen();

        }

    }

    catch(error){

    }


    try{

        if(
            screen.orientation
            &&
            screen.orientation.lock
        ){

            await screen.orientation.lock(
                "landscape"
            );

        }

    }

    catch(error){

    }


    try{

        if(
            "wakeLock"
            in navigator
        ){

            wakeLock =
            await navigator.wakeLock.request(
                "screen"
            );

        }

    }

    catch(error){

    }

}


/* ============================================================
   PREVENT PAGE MOVEMENT / SCROLL
   ============================================================ */

document.addEventListener(
    "touchmove",
    function(event){

        event.preventDefault();

    },
    {
        passive:false
    }
);


document.addEventListener(
    "contextmenu",
    function(event){

        event.preventDefault();

    }
);


/* ============================================================
   STOP JOG IF TOUCH IS RELEASED ANYWHERE
   ============================================================ */

document.addEventListener(
    "pointerup",
    stopJog
);


document.addEventListener(
    "pointercancel",
    stopJog
);


/* ============================================================
   INITIAL DISPLAY
   ============================================================ */

for(
    let i = 0;
    i < 6;
    i++
){

    updateDisplay(
        i,
        angles[i]
    );

}

</script>


</body>

</html>
"""

    return html


# ================================================================
# WIFI ACCESS POINT
# ================================================================

print()
print("Starting WiFi AP...")


ap = network.WLAN(
    network.AP_IF
)


ap.active(
    True
)


ap.config(
    essid=SSID,
    password=PASSWORD
)


while not ap.active():

    wdt.feed()

    time.sleep_ms(
        100
    )


ip = ap.ifconfig()[0]


print()
print("========================================")
print("WIFI READY")
print("========================================")
print("SSID     :", SSID)
print("Password :", PASSWORD)
print("IP       :", ip)
print("========================================")


# ================================================================
# STARTUP HOME
# ================================================================

print()
print("Setting startup positions...")


for channel in range(
    NUM_SERVOS
):

    set_servo(
        channel,
        HOME_ANGLES[channel]
    )

    wdt.feed()

    time.sleep_ms(
        80
    )


# ================================================================
# SEND DATA SAFELY
# ================================================================

def send_all(
    client,
    data
):

    if isinstance(
        data,
        str
    ):

        data = data.encode()


    total = 0

    length = len(
        data
    )


    while total < length:

        wdt.feed()


        sent = client.send(
            data[total:]
        )


        if sent is None:

            break


        if sent <= 0:

            break


        total += sent


# ================================================================
# HTTP RESPONSE
# ================================================================

def send_response(
    client,
    content,
    content_type="text/plain"
):

    header = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: "
        +
        content_type
        +
        "\r\n"
        "Connection: close\r\n"
        "Cache-Control: no-store\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "\r\n"
    )


    send_all(
        client,
        header
    )


    send_all(
        client,
        content
    )


# ================================================================
# URL PARAMETERS
# ================================================================

def get_parameters(
    path
):

    values = {}


    if "?" not in path:

        return values


    query = path.split(
        "?",
        1
    )[1]


    for item in query.split(
        "&"
    ):

        if "=" in item:

            key, value = item.split(
                "=",
                1
            )

            values[key] = value


    return values


# ================================================================
# HANDLE DIRECT SERVO TARGET
# ================================================================

def handle_servo_request(
    path
):

    try:

        values = get_parameters(
            path
        )


        channel = int(
            values.get(
                "ch",
                "0"
            )
        )


        angle = int(
            values.get(
                "angle",
                "90"
            )
        )


        smooth = int(
            values.get(
                "smooth",
                "0"
            )
        )


        if (
            channel < 0
            or
            channel >= NUM_SERVOS
        ):

            return "ERROR"


        if smooth == 1:

            smooth_move(
                channel,
                angle,
                9
            )

        else:

            set_servo(
                channel,
                angle
            )


        return str(
            current_angles[channel]
        )


    except Exception as e:

        print(
            "Servo request error:",
            e
        )

        return "ERROR"


# ================================================================
# HANDLE +/- 1 DEGREE
# ================================================================

def handle_move_request(
    path
):

    try:

        values = get_parameters(
            path
        )


        channel = int(
            values.get(
                "ch",
                "0"
            )
        )


        delta = int(
            values.get(
                "delta",
                "0"
            )
        )


        if (
            channel < 0
            or
            channel >= NUM_SERVOS
        ):

            return "ERROR"


        # Only allow one-degree jog commands
        if delta > 0:

            delta = 1

        elif delta < 0:

            delta = -1

        else:

            delta = 0


        angle = move_one_degree(
            channel,
            delta
        )


        return str(
            angle
        )


    except Exception as e:

        print(
            "Move error:",
            e
        )

        return "ERROR"


# ================================================================
# WEB SERVER
# ================================================================

address = socket.getaddrinfo(
    "0.0.0.0",
    80
)[0][-1]


server = socket.socket()


server.setsockopt(
    socket.SOL_SOCKET,
    socket.SO_REUSEADDR,
    1
)


server.bind(
    address
)


server.listen(
    4
)


# ================================================================
# NON-BLOCKING POLL
# ================================================================

poller = select.poll()


poller.register(
    server,
    select.POLLIN
)


print()
print("========================================")
print("ROBOT ARM SERVER READY")
print("========================================")
print("Connect :", SSID)
print("Open    : http://" + ip)
print()
print("SERVO LIMITS")
print("S1 :", MIN_ANGLES[0], "-", MAX_ANGLES[0])
print("S2 :", MIN_ANGLES[1], "-", MAX_ANGLES[1])
print("S3 :", MIN_ANGLES[2], "-", MAX_ANGLES[2])
print("S4 :", MIN_ANGLES[3], "-", MAX_ANGLES[3])
print("S5 :", MIN_ANGLES[4], "-", MAX_ANGLES[4])
print("S6 :", MIN_ANGLES[5], "-", MAX_ANGLES[5])
print("========================================")
print()


last_gc = time.ticks_ms()


# ================================================================
# MAIN LOOP
# ================================================================

while True:

    wdt.feed()


    events = poller.poll(
        80
    )


    # ------------------------------------------------------------
    # Garbage collection
    # ------------------------------------------------------------

    if time.ticks_diff(
        time.ticks_ms(),
        last_gc
    ) > 10000:

        gc.collect()

        last_gc = time.ticks_ms()


    if not events:

        continue


    client = None


    try:

        wdt.feed()


        client, remote_address = server.accept()


        try:

            client.settimeout(
                0.5
            )

        except:

            pass


        wdt.feed()


        request = client.recv(
            1024
        )


        wdt.feed()


        if not request:

            client.close()

            client = None

            continue


        request = request.decode(
            "utf-8",
            "ignore"
        )


        first_line = request.split(
            "\r\n"
        )[0]


        parts = first_line.split(
            " "
        )


        if len(parts) >= 2:

            path = parts[1]

        else:

            path = "/"


        # ========================================================
        # +/- ONE DEGREE
        # ========================================================

        if path.startswith(
            "/move?"
        ):

            result = handle_move_request(
                path
            )


            send_response(
                client,
                result
            )


        # ========================================================
        # DIRECT / SMOOTH SERVO POSITION
        # ========================================================

        elif path.startswith(
            "/servo?"
        ):

            result = handle_servo_request(
                path
            )


            send_response(
                client,
                result
            )


        # ========================================================
        # HOME ALL
        # ========================================================

        elif path == "/home":

            home_all()


            send_response(
                client,
                "HOME"
            )


        # ========================================================
        # RELEASE
        # ========================================================

        elif path == "/release":

            release_servos()


            send_response(
                client,
                "RELEASED"
            )


        # ========================================================
        # MAIN WEB PAGE
        # ========================================================

        else:

            wdt.feed()


            page = web_page()


            wdt.feed()


            send_response(
                client,
                page,
                "text/html; charset=utf-8"
            )


    except OSError:

        pass


    except Exception as e:

        print(
            "Server error:",
            e
        )


    finally:

        if client is not None:

            try:

                client.close()

            except:

                pass


        wdt.feed()