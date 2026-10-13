import network
import socket
import time

from machine import Pin, PWM, ADC, WDT

import onewire
import ds18x20


# ============================================================
# LOF TITAN ESP32-S3
#
# 4 WHEEL WEB ROVER
# DUAL JOYSTICK CONTROL
# 2 SERVO ARM
# CAPACITIVE SOIL MOISTURE SENSOR
# DS18B20 WATERPROOF TEMPERATURE SENSOR
# AUTOMATIC MEASURE SEQUENCE
# ============================================================


# ============================================================
# WATCHDOG
# ============================================================

wdt = WDT(0, timeout=8000)
wdt.feed()


# ============================================================
# MOTOR PINS
# ============================================================

# M1 - FRONT LEFT
FL_PWM = PWM(Pin(15))
FL_DIR = Pin(16, Pin.OUT)

# M2 - FRONT RIGHT
FR_PWM = PWM(Pin(13))
FR_DIR = Pin(14, Pin.OUT)

# M3 - REAR LEFT
RL_PWM = PWM(Pin(11))
RL_DIR = Pin(12, Pin.OUT)

# M4 - REAR RIGHT
RR_PWM = PWM(Pin(9))
RR_DIR = Pin(10, Pin.OUT)


# Motor PWM Frequency

FL_PWM.freq(1000)
FR_PWM.freq(1000)
RL_PWM.freq(1000)
RR_PWM.freq(1000)


# ============================================================
# MOTOR DIRECTION CORRECTION
#
# If any motor rotates opposite direction,
# change False to True.
# ============================================================

FL_INVERT = False
FR_INVERT = False
RL_INVERT = False
RR_INVERT = False


# ============================================================
# SERVO SETUP
# ============================================================

# Servo 1 = GPIO 1
# Servo 2 = GPIO 2

SERVO1_PIN = 1
SERVO2_PIN = 2


servo1 = PWM(
    Pin(SERVO1_PIN)
)

servo2 = PWM(
    Pin(SERVO2_PIN)
)


servo1.freq(50)
servo2.freq(50)


# ============================================================
# SERVO HOME POSITIONS
# ============================================================

SERVO1_HOME = 180
SERVO2_HOME = 0


# Measurement Positions

SERVO1_MEASURE = 0
SERVO2_MEASURE = 90


servo1_angle = SERVO1_HOME
servo2_angle = SERVO2_HOME


# ============================================================
# SERVO WRITE
# ============================================================

def servo_write(servo, angle):

    angle = max(
        0,
        min(
            180,
            int(angle)
        )
    )

    # 500us to 2500us
    pulse_us = (
        500 +
        int(
            angle *
            2000 /
            180
        )
    )

    duty = int(
        pulse_us *
        65535 /
        20000
    )

    servo.duty_u16(
        duty
    )


# Set initial home position

servo_write(
    servo1,
    SERVO1_HOME
)

servo_write(
    servo2,
    SERVO2_HOME
)


# ============================================================
# SOIL MOISTURE SENSOR
# ============================================================

SOIL_PIN = 3


soil_adc = ADC(
    Pin(SOIL_PIN)
)


try:

    soil_adc.atten(
        ADC.ATTN_11DB
    )

except:
    pass


# ============================================================
# SOIL CALIBRATION
#
# Replace these after testing your actual sensor.
#
# DRY value = sensor in air/dry soil
# WET value = sensor in very wet soil
# ============================================================

SOIL_DRY = 52000
SOIL_WET = 22000


soil_raw = 0
soil_percent = 0


# ============================================================
# SOIL READ FUNCTION
# ============================================================

def measure_soil():

    global soil_raw
    global soil_percent


    print(
        "Reading soil moisture..."
    )


    total = 0

    samples = 15


    # Take multiple readings

    for i in range(samples):

        wdt.feed()

        total += (
            soil_adc.read_u16()
        )

        time.sleep_ms(30)


    soil_raw = int(
        total /
        samples
    )


    difference = (
        SOIL_DRY -
        SOIL_WET
    )


    if difference != 0:

        soil_percent = int(

            (
                SOIL_DRY -
                soil_raw
            )

            *

            100

            /

            difference

        )

    else:

        soil_percent = 0


    soil_percent = max(
        0,
        min(
            100,
            soil_percent
        )
    )


    print(
        "Soil RAW:",
        soil_raw
    )

    print(
        "Soil Moisture:",
        soil_percent,
        "%"
    )


# ============================================================
# DS18B20 TEMPERATURE SENSOR
# ============================================================

DS18_PIN = 4


one_wire = onewire.OneWire(
    Pin(
        DS18_PIN,
        Pin.IN,
        Pin.PULL_UP
    )
)


ds18 = ds18x20.DS18X20(
    one_wire
)


ds18_roms = ds18.scan()


water_temperature = None


print()
print("==============================")
print("DS18B20 CHECK")
print("==============================")


if ds18_roms:

    print(
        "DS18B20 FOUND"
    )

    print(
        "Sensors:",
        len(ds18_roms)
    )

else:

    print(
        "DS18B20 NOT FOUND"
    )


# ============================================================
# TEMPERATURE MEASUREMENT
# ============================================================

def measure_temperature():

    global water_temperature


    print(
        "Reading temperature..."
    )


    if not ds18_roms:

        water_temperature = None

        print(
            "DS18B20 NOT FOUND"
        )

        return


    try:

        # Start temperature conversion

        ds18.convert_temp()


        # Wait ~800ms
        # Feed watchdog during wait

        for i in range(8):

            wdt.feed()

            time.sleep_ms(100)


        water_temperature = (
            ds18.read_temp(
                ds18_roms[0]
            )
        )


        print(
            "Temperature:",
            water_temperature,
            "C"
        )


    except Exception as e:

        water_temperature = None

        print(
            "Temperature Error:",
            e
        )


# ============================================================
# MOTOR CONTROL
# ============================================================

def motor(
    pwm,
    direction,
    speed,
    invert=False
):

    speed = int(
        max(
            -255,
            min(
                255,
                speed
            )
        )
    )


    if invert:

        speed = -speed


    # STOP

    if speed == 0:

        direction.value(0)

        pwm.duty_u16(0)

        return


    magnitude = abs(
        speed
    )


    duty = int(
        magnitude *
        65535 /
        255
    )


    # FORWARD

    if speed > 0:

        direction.value(0)

        pwm.duty_u16(
            duty
        )


    # REVERSE

    else:

        direction.value(1)

        pwm.duty_u16(
            65535 -
            duty
        )


# ============================================================
# STOP ALL MOTORS
# ============================================================

def stop():

    motor(
        FL_PWM,
        FL_DIR,
        0
    )

    motor(
        FR_PWM,
        FR_DIR,
        0
    )

    motor(
        RL_PWM,
        RL_DIR,
        0
    )

    motor(
        RR_PWM,
        RR_DIR,
        0
    )


# ============================================================
# ARCADE DRIVE
#
# y = throttle
# x = steering
#
# Range = -255 to +255
# ============================================================

def drive(y, x):

    y = max(
        -255,
        min(
            255,
            int(y)
        )
    )


    x = max(
        -255,
        min(
            255,
            int(x)
        )
    )


    left = (
        y +
        x
    )

    right = (
        y -
        x
    )


    maximum = max(
        abs(left),
        abs(right),
        255
    )


    if maximum > 255:

        left = int(
            left *
            255 /
            maximum
        )

        right = int(
            right *
            255 /
            maximum
        )


    # LEFT WHEELS

    motor(
        FL_PWM,
        FL_DIR,
        left,
        FL_INVERT
    )

    motor(
        RL_PWM,
        RL_DIR,
        left,
        RL_INVERT
    )


    # RIGHT WHEELS

    motor(
        FR_PWM,
        FR_DIR,
        right,
        FR_INVERT
    )

    motor(
        RR_PWM,
        RR_DIR,
        right,
        RR_INVERT
    )


# Start safely

stop()


# ============================================================
# SLOW SERVO MOVEMENT
# ============================================================

def move_servos_slow(
    target1,
    target2
):

    global servo1_angle
    global servo2_angle


    start1 = servo1_angle
    start2 = servo2_angle


    difference1 = (
        target1 -
        start1
    )

    difference2 = (
        target2 -
        start2
    )


    # Number of movement steps

    steps = max(
        abs(difference1),
        abs(difference2)
    )


    if steps == 0:

        return


    # --------------------------------------------------------
    # Both servos move simultaneously
    # --------------------------------------------------------

    for i in range(
        steps + 1
    ):

        wdt.feed()


        new1 = int(

            start1 +

            difference1 *

            i /

            steps

        )


        new2 = int(

            start2 +

            difference2 *

            i /

            steps

        )


        servo_write(
            servo1,
            new1
        )


        servo_write(
            servo2,
            new2
        )


        servo1_angle = new1
        servo2_angle = new2


        # Adjust for arm movement speed
        time.sleep_ms(20)


    # Make sure target is exact

    servo1_angle = target1
    servo2_angle = target2


    servo_write(
        servo1,
        target1
    )


    servo_write(
        servo2,
        target2
    )


# ============================================================
# ARM HOME
# ============================================================

def arm_home():

    print()
    print("ARM RETURNING HOME")


    stop()


    move_servos_slow(
        SERVO1_HOME,
        SERVO2_HOME
    )


    print(
        "Servo 1:",
        servo1_angle
    )

    print(
        "Servo 2:",
        servo2_angle
    )

    print(
        "ARM HOME COMPLETE"
    )


# ============================================================
# AUTOMATIC MEASUREMENT SEQUENCE
# ============================================================

def automatic_measure():

    global servo1_angle
    global servo2_angle


    print()
    print("==============================")
    print("MEASUREMENT STARTED")
    print("==============================")


    # --------------------------------------------------------
    # Safety: stop rover
    # --------------------------------------------------------

    stop()


    # --------------------------------------------------------
    # Move ARM to measurement position
    #
    # Servo 1:
    # 180 -> 0
    #
    # Servo 2:
    # 0 -> 90
    # --------------------------------------------------------

    print(
        "Moving arm..."
    )


    move_servos_slow(
        SERVO1_MEASURE,
        SERVO2_MEASURE
    )


    print(
        "Servo 1:",
        servo1_angle
    )


    print(
        "Servo 2:",
        servo2_angle
    )


    # --------------------------------------------------------
    # Allow probe to settle
    # --------------------------------------------------------

    print(
        "Waiting for sensors..."
    )


    for i in range(10):

        wdt.feed()

        time.sleep_ms(100)


    # --------------------------------------------------------
    # Soil measurement
    # --------------------------------------------------------

    measure_soil()


    # --------------------------------------------------------
    # Temperature measurement
    # --------------------------------------------------------

    measure_temperature()


    print()
    print("==============================")
    print("MEASUREMENT COMPLETE")
    print("==============================")

    print(
        "Soil:",
        soil_percent,
        "%"
    )


    if water_temperature is not None:

        print(
            "Temperature:",
            water_temperature,
            "C"
        )


    print("==============================")
    print()


# ============================================================
# WIFI ACCESS POINT
# ============================================================

SSID = "LOF_ARM_ROVER"

PASSWORD = "12345678"


ap = network.WLAN(
    network.AP_IF
)


ap.active(False)

time.sleep_ms(300)

wdt.feed()


ap.active(True)


ap.config(
    essid=SSID,
    password=PASSWORD
)


while not ap.active():

    wdt.feed()

    time.sleep_ms(100)


ip = ap.ifconfig()[0]


print()
print("==============================")
print("LOF SENSOR ARM ROVER")
print("==============================")

print(
    "WiFi:",
    SSID
)

print(
    "Password:",
    PASSWORD
)

print(
    "IP:",
    ip
)

print(
    "Servo 1 HOME:",
    SERVO1_HOME
)

print(
    "Servo 2 HOME:",
    SERVO2_HOME
)

print(
    "Servo 1 MEASURE:",
    SERVO1_MEASURE
)

print(
    "Servo 2 MEASURE:",
    SERVO2_MEASURE
)

print(
    "Soil Sensor GPIO:",
    SOIL_PIN
)

print(
    "DS18B20 GPIO:",
    DS18_PIN
)

print("==============================")


# ============================================================
# WEB PAGE
# ============================================================

html = """<!DOCTYPE html>

<html>

<head>

<meta name="viewport"
content="width=device-width,
initial-scale=1,
maximum-scale=1,
user-scalable=no">

<title>LOF ARM ROVER</title>


<style>

:root{

--orange:#ff6b21;

--background:#080c0f;

--panel:#11171c;

--panel2:#161d22;

--line:#303b43;

--white:#ffffff;

--grey:#aab3ba;

--green:#00e676;

}


*{

box-sizing:border-box;

-webkit-user-select:none;

user-select:none;

}


html,
body{

margin:0;

padding:0;

width:100%;

height:100%;

overflow:hidden;

background:var(--background);

color:var(--orange);

font-family:Arial,sans-serif;

touch-action:none;

}


/* ======================================================
   HEADER
====================================================== */

.header{

height:12%;

border-bottom:
2px solid var(--orange);

display:flex;

align-items:center;

justify-content:space-around;

padding:5px 20px;

}


.title{

font-size:25px;

font-weight:900;

letter-spacing:2px;

text-align:center;

}


.subtitle{

font-size:11px;

color:var(--grey);

margin-top:3px;

}


.topInfo{

font-size:12px;

}


.valueWhite{

color:white;

font-weight:bold;

}


/* ======================================================
   MAIN LAYOUT
====================================================== */

.main{

height:88%;

display:grid;

grid-template-columns:

1fr
1.25fr
1fr;

gap:12px;

padding:12px;

}


/* ======================================================
   JOYSTICK PANEL
====================================================== */

.joyPanel{

display:flex;

flex-direction:column;

align-items:center;

justify-content:center;

border:

1px solid var(--line);

border-radius:18px;

background:

linear-gradient(
145deg,
#10161a,
#080c0f
);

}


.joy{

position:relative;

width:min(29vw,235px);

height:min(29vw,235px);

border:

3px solid var(--orange);

border-radius:50%;

background:

radial-gradient(
circle,
#273036,
#0a0d10 72%
);

box-shadow:

0 0 15px
rgba(
255,
107,
33,
0.15
);

touch-action:none;

}


.ring{

position:absolute;

width:72%;

height:72%;

left:14%;

top:14%;

border:

2px dashed
rgba(
255,
107,
33,
0.5
);

border-radius:50%;

}


.crossV{

position:absolute;

width:1px;

height:100%;

left:50%;

background:
rgba(
255,
255,
255,
0.15
);

}


.crossH{

position:absolute;

height:1px;

width:100%;

top:50%;

background:
rgba(
255,
255,
255,
0.15
);

}


.knob{

position:absolute;

width:30%;

height:30%;

left:35%;

top:35%;

border-radius:50%;

background:

radial-gradient(
circle at 35% 30%,
#ff9b65,
var(--orange)
);

box-shadow:

0 0 20px
rgba(
255,
107,
33,
0.8
);

}


.joyTitle{

font-size:18px;

font-weight:bold;

margin-top:12px;

}


.joySub{

font-size:11px;

color:var(--grey);

margin-top:4px;

}


/* ======================================================
   CENTER PANEL
====================================================== */

.center{

display:flex;

flex-direction:column;

gap:8px;

overflow:auto;

}


.card{

background:
var(--panel);

border:
1px solid var(--line);

border-radius:13px;

padding:10px;

}


.cardTitle{

font-size:14px;

font-weight:bold;

margin-bottom:8px;

}


/* ======================================================
   SENSORS
====================================================== */

.sensorGrid{

display:grid;

grid-template-columns:
1fr 1fr;

gap:8px;

}


.sensorBox{

background:
var(--panel2);

border-radius:10px;

padding:9px;

}


.sensorName{

font-size:10px;

color:var(--grey);

}


.sensorValue{

font-size:25px;

color:white;

font-weight:bold;

margin-top:3px;

}


.sensorSmall{

font-size:9px;

color:var(--grey);

margin-top:3px;

}


/* ======================================================
   SERVO
====================================================== */

.servoHeader{

display:flex;

align-items:center;

justify-content:space-between;

font-size:13px;

font-weight:bold;

color:white;

}


.servoAngle{

color:var(--orange);

font-size:18px;

}


input[type=range]{

width:100%;

margin-top:7px;

accent-color:
var(--orange);

}


.positionInfo{

font-size:9px;

color:var(--grey);

}


/* ======================================================
   BUTTONS
====================================================== */

.homeButton{

width:100%;

height:40px;

border:

2px solid var(--orange);

border-radius:10px;

background:

rgba(
255,
107,
33,
0.08
);

color:var(--orange);

font-weight:bold;

font-size:14px;

}


.measureButton{

width:100%;

height:48px;

border:

2px solid var(--orange);

border-radius:10px;

background:
var(--orange);

color:white;

font-weight:900;

font-size:18px;

letter-spacing:1px;

}


.measureButton:active,
.homeButton:active{

transform:
scale(0.98);

}


.measureButton:disabled{

opacity:0.4;

}


/* ======================================================
   MEASUREMENT STATUS
====================================================== */

.measureStatus{

text-align:center;

font-size:11px;

color:var(--grey);

min-height:14px;

}


@media(
max-height:500px
){

.header{

height:14%;

}


.main{

height:86%;

}


.card{

padding:6px;

}


.sensorValue{

font-size:19px;

}


.joyTitle{

font-size:14px;

margin-top:5px;

}


.measureButton{

height:38px;

font-size:14px;

}


.homeButton{

height:32px;

}

}

</style>

</head>


<body>


<!-- =====================================================
HEADER
===================================================== -->

<div class="header">


<div class="topInfo">

STATUS:

<span
id="status"
class="valueWhite">

IDLE

</span>

</div>



<div class="title">

LOF ARM ROVER

<div class="subtitle">

4WD + 2DOF ARM + SOIL & TEMPERATURE

</div>

</div>



<div class="topInfo">

THRUST:

<span
id="thrust"
class="valueWhite">

0%

</span>


&nbsp;&nbsp;


STEER:

<span
id="steer"
class="valueWhite">

0%

</span>

</div>


</div>



<!-- =====================================================
MAIN
===================================================== -->

<div class="main">


<!-- =====================================================
LEFT JOYSTICK
===================================================== -->

<div class="joyPanel">


<div
id="joyY"
class="joy">


<div class="ring"></div>

<div class="crossV"></div>

<div class="crossH"></div>


<div
id="knobY"
class="knob">
</div>


</div>


<div class="joyTitle">

THRUST CONTROL

</div>


<div class="joySub">

FORWARD / REVERSE

</div>


</div>



<!-- =====================================================
CENTER CONTROL
===================================================== -->

<div class="center">


<!-- SENSOR MONITORING -->

<div class="card">


<div class="cardTitle">

SENSOR MONITORING

</div>


<div class="sensorGrid">


<div class="sensorBox">


<div class="sensorName">

SOIL MOISTURE

</div>


<div
id="soil"
class="sensorValue">

-- %

</div>


<div
id="soilRaw"
class="sensorSmall">

RAW: --

</div>


</div>



<div class="sensorBox">


<div class="sensorName">

WATER TEMPERATURE

</div>


<div
id="temp"
class="sensorValue">

-- °C

</div>


<div class="sensorSmall">

DS18B20

</div>


</div>


</div>


</div>



<!-- SERVO 1 -->

<div class="card">


<div class="servoHeader">


<span>

SERVO 1

</span>


<span
class="servoAngle">

<span id="servo1Value">

180

</span>°

</span>


</div>


<input

id="servo1"

type="range"

min="0"

max="180"

value="180">


<div class="positionInfo">

HOME: 180° &nbsp;&nbsp; MEASURE: 0°

</div>


</div>



<!-- SERVO 2 -->

<div class="card">


<div class="servoHeader">


<span>

SERVO 2

</span>


<span
class="servoAngle">

<span id="servo2Value">

0

</span>°

</span>


</div>


<input

id="servo2"

type="range"

min="0"

max="180"

value="0">


<div class="positionInfo">

HOME: 0° &nbsp;&nbsp; MEASURE: 90°

</div>


</div>



<!-- ARM HOME -->

<button

class="homeButton"

id="homeButton"

onclick="homeArm()">

ARM HOME

</button>



<!-- MEASURE -->

<button

class="measureButton"

id="measureButton"

onclick="startMeasure()">

MEASURE

</button>


<div
id="measureStatus"
class="measureStatus">

Ready for measurement

</div>


</div>



<!-- =====================================================
RIGHT JOYSTICK
===================================================== -->

<div class="joyPanel">


<div
id="joyX"
class="joy">


<div class="ring"></div>

<div class="crossV"></div>

<div class="crossH"></div>


<div
id="knobX"
class="knob">
</div>


</div>


<div class="joyTitle">

VECTOR STEERING

</div>


<div class="joySub">

LEFT / RIGHT

</div>


</div>


</div>



<script>


// =========================================================
// JOYSTICK VARIABLES
// =========================================================

let moveY = 0;

let moveX = 0;


let measuring = false;


const DEADZONE = 0.08;

const EXPO = 1.6;


// =========================================================
// RESPONSE CURVE
// =========================================================

function processAxis(n){


if(
Math.abs(n)
<=
DEADZONE
){

return 0;

}


let value =

(
Math.abs(n)
-
DEADZONE
)

/

(
1 -
DEADZONE
);


value =

Math.pow(
value,
EXPO
)

*

Math.sign(n);


return Math.round(
value *
255
);

}


// =========================================================
// CREATE JOYSTICK
// =========================================================

function createJoystick(
zoneID,
knobID,
axis
){


const zone =
document.getElementById(
zoneID
);


const knob =
document.getElementById(
knobID
);


let active = false;



function move(e){


if(
!active ||
measuring
){

return;

}


const rect =
zone.getBoundingClientRect();


const centerX =
rect.left +
rect.width /
2;


const centerY =
rect.top +
rect.height /
2;


const max =
rect.width /
2 -
rect.width *
0.18;


let dx =
e.clientX -
centerX;


let dy =
e.clientY -
centerY;



if(
axis === "Y"
){

dx = 0;

}


if(
axis === "X"
){

dy = 0;

}



dx = Math.max(
-max,
Math.min(
max,
dx
)
);


dy = Math.max(
-max,
Math.min(
max,
dy
)
);



knob.style.transform =

"translate(" +
dx +
"px," +
dy +
"px)";



if(
axis === "Y"
){

moveY =
processAxis(
-dy /
max
);

}

else{

moveX =
processAxis(
dx /
max
);

}


updateDriveDisplay();

}



function start(e){


if(measuring)
return;


active = true;


zone.setPointerCapture(
e.pointerId
);


move(e);

}



function end(){


active = false;


knob.style.transform =

"translate(0px,0px)";


if(
axis === "Y"
){

moveY = 0;

}

else{

moveX = 0;

}


updateDriveDisplay();

sendDrive();

}



zone.addEventListener(
"pointerdown",
start
);


zone.addEventListener(
"pointermove",
move
);


zone.addEventListener(
"pointerup",
end
);


zone.addEventListener(
"pointercancel",
end
);


}


// =========================================================
// DRIVE DISPLAY
// =========================================================

function updateDriveDisplay(){


document.getElementById(
"thrust"
).innerText =

Math.round(
moveY /
255 *
100
)
+
"%";


document.getElementById(
"steer"
).innerText =

Math.round(
moveX /
255 *
100
)
+
"%";


if(measuring){

document.getElementById(
"status"
).innerText =
"MEASURING";

return;

}


if(
moveY === 0 &&
moveX === 0
){

document.getElementById(
"status"
).innerText =
"IDLE";

}

else{

document.getElementById(
"status"
).innerText =
"DRIVING";

}


}


// =========================================================
// DRIVE COMMAND
// =========================================================

function sendDrive(){


if(measuring)
return;


fetch(

"/d?y=" +
moveY +
"&x=" +
moveX,

{
cache:"no-store"
}

).catch(()=>{});


}


// Send control every 100ms

setInterval(
sendDrive,
100
);


// =========================================================
// SERVO MANUAL CONTROL
// =========================================================

const servo1Slider =
document.getElementById(
"servo1"
);


const servo2Slider =
document.getElementById(
"servo2"
);


let servoTimer = null;


function sendServo(
number,
angle
){


if(measuring)
return;


clearTimeout(
servoTimer
);


servoTimer = setTimeout(

function(){


fetch(

"/s?n=" +
number +
"&a=" +
angle,

{
cache:"no-store"
}

).catch(()=>{});


},

80

);


}


servo1Slider.oninput =
function(){


if(measuring)
return;


document.getElementById(
"servo1Value"
).innerText =
this.value;


sendServo(
1,
this.value
);


};


servo2Slider.oninput =
function(){


if(measuring)
return;


document.getElementById(
"servo2Value"
).innerText =
this.value;


sendServo(
2,
this.value
);


};


// =========================================================
// ARM HOME
// =========================================================

function homeArm(){


if(measuring)
return;


document.getElementById(
"status"
).innerText =
"ARM MOVING";


document.getElementById(
"measureStatus"
).innerText =
"Returning arm to home position...";


fetch(
"/home",
{
cache:"no-store"
}
)


.then(
response =>
response.json()
)


.then(
data => {


servo1Slider.value =
data.servo1;


servo2Slider.value =
data.servo2;


document.getElementById(
"servo1Value"
).innerText =
data.servo1;


document.getElementById(
"servo2Value"
).innerText =
data.servo2;


document.getElementById(
"status"
).innerText =
"IDLE";


document.getElementById(
"measureStatus"
).innerText =
"Arm at home position";


})


.catch(
()=>{


document.getElementById(
"status"
).innerText =
"ERROR";


});


}


// =========================================================
// MEASURE
// =========================================================

function startMeasure(){


if(measuring)
return;


measuring = true;


moveY = 0;
moveX = 0;


sendDrive();


document.getElementById(
"status"
).innerText =
"MEASURING";


document.getElementById(
"measureStatus"
).innerText =
"Moving arm to measurement position...";


const button =
document.getElementById(
"measureButton"
);


button.disabled =
true;


button.innerText =
"MEASURING...";


document.getElementById(
"homeButton"
).disabled =
true;



fetch(
"/measure",
{
cache:"no-store"
}
)


.then(
response =>
response.json()
)


.then(
data => {


servo1Slider.value =
data.servo1;


servo2Slider.value =
data.servo2;


document.getElementById(
"servo1Value"
).innerText =
data.servo1;


document.getElementById(
"servo2Value"
).innerText =
data.servo2;



document.getElementById(
"soil"
).innerText =

data.soil +
" %";


document.getElementById(
"soilRaw"
).innerText =

"RAW: " +
data.raw;



if(
data.temp === null
){

document.getElementById(
"temp"
).innerText =
"-- °C";

}

else{

document.getElementById(
"temp"
).innerText =

Number(
data.temp
).toFixed(1)
+
" °C";

}



document.getElementById(
"measureStatus"
).innerText =
"Measurement completed";


document.getElementById(
"status"
).innerText =
"MEASURED";


button.disabled =
false;


button.innerText =
"MEASURE";


document.getElementById(
"homeButton"
).disabled =
false;


measuring =
false;


})


.catch(
function(){


document.getElementById(
"status"
).innerText =
"ERROR";


document.getElementById(
"measureStatus"
).innerText =
"Measurement failed";


button.disabled =
false;


button.innerText =
"MEASURE";


document.getElementById(
"homeButton"
).disabled =
false;


measuring =
false;


});


}


// =========================================================
// JOYSTICKS
// =========================================================

createJoystick(
"joyY",
"knobY",
"Y"
);


createJoystick(
"joyX",
"knobX",
"X"
);


// =========================================================
// SAFETY
// =========================================================

document.addEventListener(

"visibilitychange",

function(){


if(
document.hidden
){

moveY = 0;

moveX = 0;

fetch(
"/d?y=0&x=0",
{
cache:"no-store"
}
).catch(()=>{});

}


}

);

</script>


</body>

</html>
"""


# ============================================================
# URL QUERY FUNCTION
# ============================================================

def get_value(
    path,
    key,
    default=0
):

    try:

        query = path.split(
            "?",
            1
        )[1]


        sections = query.split(
            "&"
        )


        for section in sections:

            pair = section.split(
                "=",
                1
            )


            if len(pair) == 2:

                if pair[0] == key:

                    return int(
                        pair[1]
                    )


    except:
        pass


    return default


# ============================================================
# JSON DATA FUNCTION
# ============================================================

def sensor_json():

    if water_temperature is None:

        temperature_text = (
            "null"
        )

    else:

        temperature_text = (
            "{:.2f}".format(
                water_temperature
            )
        )


    return (

        "{"

        '"soil":' +
        str(
            soil_percent
        )

        +

        ',"raw":' +
        str(
            soil_raw
        )

        +

        ',"temp":' +
        temperature_text

        +

        ',"servo1":' +
        str(
            servo1_angle
        )

        +

        ',"servo2":' +
        str(
            servo2_angle
        )

        +

        "}"

    )


# ============================================================
# WEB SERVER
# ============================================================

addr = socket.getaddrinfo(
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
    addr
)


server.listen(3)


# Prevent watchdog timeout

server.settimeout(
    0.1
)


print()
print(
    "Web server started"
)

print(
    "Open: http://" +
    ip
)

print()


# ============================================================
# DRIVE FAILSAFE
# ============================================================

last_drive = (
    time.ticks_ms()
)


# ============================================================
# MAIN LOOP
# ============================================================

while True:

    wdt.feed()


    now = (
        time.ticks_ms()
    )


    # --------------------------------------------------------
    # AUTOMATIC DRIVE STOP
    # --------------------------------------------------------

    if time.ticks_diff(
        now,
        last_drive
    ) > 600:

        stop()


    client = None


    try:

        client, address = (
            server.accept()
        )


        client.settimeout(
            0.4
        )


        wdt.feed()


        request = client.recv(
            1024
        )


        if not request:

            continue


        request = request.decode(
            "utf-8",
            "ignore"
        )


        first_line = (
            request.split(
                "\r\n"
            )[0]
        )


        parts = first_line.split(
            " "
        )


        if len(parts) < 2:

            continue


        path = parts[1]


        # ====================================================
        # DRIVE
        # ====================================================

        if path.startswith(
            "/d?"
        ):

            y = get_value(
                path,
                "y",
                0
            )


            x = get_value(
                path,
                "x",
                0
            )


            drive(
                y,
                x
            )


            last_drive = (
                time.ticks_ms()
            )


            content_type = (
                "text/plain"
            )


            response = (
                "OK"
            )


        # ====================================================
        # MANUAL SERVO
        # ====================================================

        elif path.startswith(
            "/s?"
        ):

            number = get_value(
                path,
                "n",
                1
            )


            angle = get_value(
                path,
                "a",
                90
            )


            angle = max(
                0,
                min(
                    180,
                    angle
                )
            )


            if number == 1:

                servo1_angle = angle

                servo_write(
                    servo1,
                    servo1_angle
                )


            elif number == 2:

                servo2_angle = angle

                servo_write(
                    servo2,
                    servo2_angle
                )


            content_type = (
                "text/plain"
            )


            response = (
                "OK"
            )


        # ====================================================
        # ARM HOME
        # ====================================================

        elif path == "/home":

            stop()


            arm_home()


            content_type = (
                "application/json"
            )


            response = (
                sensor_json()
            )


        # ====================================================
        # AUTOMATIC MEASUREMENT
        # ====================================================

        elif path == "/measure":

            stop()


            automatic_measure()


            content_type = (
                "application/json"
            )


            response = (
                sensor_json()
            )


        # ====================================================
        # SENSOR DATA
        # ====================================================

        elif path == "/sensor":

            content_type = (
                "application/json"
            )


            response = (
                sensor_json()
            )


        # ====================================================
        # MAIN PAGE
        # ====================================================

        else:

            content_type = (
                "text/html"
            )


            response = html


        # ====================================================
        # HTTP RESPONSE
        # ====================================================

        wdt.feed()


        header = (

            "HTTP/1.1 200 OK\r\n"

            +

            "Content-Type: " +
            content_type +
            "\r\n"

            +

            "Cache-Control: no-store\r\n"

            +

            "Connection: close\r\n"

            +

            "\r\n"

        )


        client.send(
            header
        )


        client.send(
            response
        )


    except OSError:

        # Normal socket timeout
        pass


    except Exception as e:

        print(
            "WEB ERROR:",
            e
        )


    finally:

        if client:

            try:

                client.close()

            except:

                pass


    wdt.feed()

    time.sleep_ms(5)