# ============================================================
# LOF TITAN - NAVIGATION RADAR SYSTEM
#
# LEFT  : GYRO HORIZON
# RIGHT : NAVIGATION RADAR
#
# MPU6050:
# SDA = GPIO 7
# SCL = GPIO 8
#
# Ultrasonic:
# TRIG = GPIO 6
# ECHO = GPIO 19
#
# WiFi:
# SSID     : NAV_RADAR
# Password : 12345678
#
# Open:
# http://192.168.4.1
# ============================================================


import time
import math
import socket
import network
import gc

from machine import Pin, I2C
from supervisor.led_buzzer import hw


# ============================================================
# HARDWARE
# ============================================================

SDA_PIN = 7
SCL_PIN = 8

TRIG_PIN = 6
ECHO_PIN = 19


# ============================================================
# WIFI
# ============================================================

SSID = "NAV_RADAR"
PASSWORD = "12345678"


# ============================================================
# MPU6050
# ============================================================

MPU_ADDR = 0x68

PWR_MGMT_1 = 0x6B
GYRO_CONFIG = 0x1B
ACCEL_CONFIG = 0x1C

ACCEL_XOUT_H = 0x3B
GYRO_ZOUT_H = 0x47


# ============================================================
# VARIABLES
# ============================================================

heading = 0.0
pitch = 0.0
roll = 0.0

distance_cm = -1.0

gyro_z_offset = 0.0

last_gyro_time = time.ticks_us()
last_attitude_time = time.ticks_ms()
last_distance_time = time.ticks_ms()

GYRO_DEADBAND = 0.7


# ============================================================
# I2C
# ============================================================

i2c = I2C(
    0,
    sda=Pin(SDA_PIN),
    scl=Pin(SCL_PIN),
    freq=400000
)


# ============================================================
# HELPERS
# ============================================================

def signed16(high, low):

    value = (high << 8) | low

    if value & 0x8000:
        value -= 65536

    return value


# ============================================================
# MPU6050 INITIALISATION
# ============================================================

def mpu_write(register, value):

    i2c.writeto_mem(
        MPU_ADDR,
        register,
        bytes([value])
    )


def init_mpu6050():

    print()
    print("Scanning I2C...")

    devices = i2c.scan()

    print("I2C devices:", devices)

    if MPU_ADDR not in devices:

        print("MPU6050 NOT FOUND")

        return False


    # Wake sensor
    mpu_write(
        PWR_MGMT_1,
        0x00
    )

    time.sleep_ms(100)


    # Gyro +/-250 deg/sec
    mpu_write(
        GYRO_CONFIG,
        0x00
    )


    # Accelerometer +/-2G
    mpu_write(
        ACCEL_CONFIG,
        0x00
    )


    print("MPU6050 detected")

    return True


# ============================================================
# SENSOR READING
# ============================================================

def read_gyro_z():

    data = i2c.readfrom_mem(
        MPU_ADDR,
        GYRO_ZOUT_H,
        2
    )

    raw = signed16(
        data[0],
        data[1]
    )

    return raw / 131.0


def read_accel_xyz():

    data = i2c.readfrom_mem(
        MPU_ADDR,
        ACCEL_XOUT_H,
        6
    )


    ax = signed16(
        data[0],
        data[1]
    ) / 16384.0


    ay = signed16(
        data[2],
        data[3]
    ) / 16384.0


    az = signed16(
        data[4],
        data[5]
    ) / 16384.0


    return ax, ay, az


# ============================================================
# MPU CALIBRATION
# ============================================================

def calibrate_mpu(seconds=5):

    global gyro_z_offset
    global heading
    global pitch
    global roll
    global last_gyro_time


    print()
    print("==============================")
    print("CALIBRATING MPU6050")
    print("KEEP SENSOR STILL")
    print("==============================")


    total = 0.0
    samples = 0

    start = time.ticks_ms()


    while time.ticks_diff(
        time.ticks_ms(),
        start
    ) < seconds * 1000:


        try:

            total += read_gyro_z()

            samples += 1

        except:
            pass


        time.sleep_ms(10)


    if samples > 0:

        gyro_z_offset = (
            total / samples
        )

    else:

        gyro_z_offset = 0.0


    heading = 0.0
    pitch = 0.0
    roll = 0.0

    last_gyro_time = time.ticks_us()


    print(
        "Gyro offset:",
        gyro_z_offset
    )

    print(
        "Calibration complete"
    )

    print()


# ============================================================
# HEADING
# ============================================================

def update_heading():

    global heading
    global last_gyro_time


    now = time.ticks_us()


    dt_us = time.ticks_diff(
        now,
        last_gyro_time
    )


    last_gyro_time = now


    dt = dt_us / 1000000.0


    if dt <= 0 or dt > 0.3:
        return


    try:

        gz = (
            read_gyro_z()
            - gyro_z_offset
        )


        if abs(gz) < GYRO_DEADBAND:

            gz = 0.0


        heading += (
            gz * dt
        )


        heading %= 360.0


    except:
        pass


# ============================================================
# PITCH + ROLL
# ============================================================

def update_attitude():

    global pitch
    global roll
    global last_attitude_time


    now = time.ticks_ms()


    if time.ticks_diff(
        now,
        last_attitude_time
    ) < 35:

        return


    last_attitude_time = now


    try:

        ax, ay, az = \
            read_accel_xyz()


        # Correct pitch direction
        new_pitch = math.degrees(
            math.atan2(
                ax,
                math.sqrt(
                    ay * ay +
                    az * az
                )
            )
        )


        new_roll = math.degrees(
            math.atan2(
                ay,
                az
            )
        )


        # Smooth movement
        pitch = (
            pitch * 0.72
            + new_pitch * 0.28
        )


        roll = (
            roll * 0.72
            + new_roll * 0.28
        )


    except:
        pass


# ============================================================
# ULTRASONIC
# ============================================================

def read_ultrasonic():

    try:

        value = \
            hw.read_ultrasonic_distance(
                trig=TRIG_PIN,
                echo=ECHO_PIN,
                unit="CM"
            )


        if value is None:
            return -1


        value = float(value)


        if value < 2:
            return -1


        if value > 400:
            return -1


        return value


    except Exception as e:

        print(
            "Ultrasonic error:",
            e
        )

        return -1


# ============================================================
# ULTRASONIC UPDATE
# ============================================================

def update_distance():

    global distance_cm
    global last_distance_time


    now = time.ticks_ms()


    if time.ticks_diff(
        now,
        last_distance_time
    ) < 60:

        return


    last_distance_time = now


    value = read_ultrasonic()


    if value > 0:

        if distance_cm < 0:

            distance_cm = value

        else:

            # Fast + smooth
            distance_cm = (
                distance_cm * 0.30
                + value * 0.70
            )


    else:

        distance_cm = -1


# ============================================================
# WEB PAGE
# ============================================================

HTML = """<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8">

<meta name="viewport"
content="width=device-width,
initial-scale=1,
maximum-scale=1,
minimum-scale=1,
user-scalable=no,
viewport-fit=cover">

<title>Navigation Radar System</title>


<style>

*{
box-sizing:border-box;
margin:0;
padding:0;
-webkit-tap-highlight-color:transparent;
}

html,
body{
width:100%;
height:100%;
overflow:hidden;
background:#010305;
font-family:Arial,Consolas,monospace;
touch-action:none;
}


/* ========================================================
   MAIN APP
======================================================== */

#app{

position:fixed;
inset:0;

width:100vw;

height:100vh;
height:100dvh;

display:grid;

grid-template-rows:
clamp(28px,7vh,48px)
minmax(0,1fr);

background:#010305;

}


/* ========================================================
   TITLE
======================================================== */

#header{

display:flex;

align-items:center;

justify-content:center;

color:#6bffa4;

background:#030709;

border-bottom:
1px solid #145338;

font-size:
clamp(11px,2.2vw,20px);

font-weight:bold;

letter-spacing:
clamp(1px,0.35vw,4px);

white-space:nowrap;

}


/* ========================================================
   DISPLAY GRID
======================================================== */

#content{

min-width:0;
min-height:0;

display:grid;

grid-template-columns:
minmax(0,1fr)
minmax(0,1fr);

gap:
clamp(3px,0.7vw,9px);

padding:
clamp(3px,0.7vw,8px);

}


/* ========================================================
   PANELS
======================================================== */

.panel{

position:relative;

width:100%;
height:100%;

min-width:0;
min-height:0;

overflow:hidden;

background:#010304;

border:
1px solid #154832;

border-radius:
clamp(5px,1vw,12px);

}


canvas{

position:absolute;

left:0;
top:0;

width:100%;
height:100%;

display:block;

}


/* ========================================================
   SMALL LABEL
======================================================== */

.panelTitle{

position:absolute;

left:
clamp(5px,1vw,12px);

top:
clamp(4px,1vh,9px);

z-index:20;

color:#64f49c;

font-size:
clamp(7px,1vw,12px);

font-weight:bold;

letter-spacing:1px;

}


/* ========================================================
   DISTANCE BOX
======================================================== */

#distanceBox{

position:absolute;

right:
clamp(5px,1vw,12px);

bottom:
clamp(5px,1vh,12px);

z-index:25;

min-width:
clamp(70px,14vw,125px);

padding:
clamp(4px,0.8vw,9px);

border:
1px solid #298455;

border-radius:7px;

background:
rgba(0,15,8,0.90);

text-align:center;

}


#distanceLabel{

font-size:
clamp(6px,0.8vw,10px);

color:#5db67f;

letter-spacing:1px;

}


#distanceValue{

margin-top:2px;

font-size:
clamp(13px,2vw,25px);

font-weight:bold;

color:#8dffad;

}


/* ========================================================
   SMALL RADAR STATUS
======================================================== */

#radarStatus{

position:absolute;

right:
clamp(5px,1vw,12px);

top:
clamp(4px,1vh,9px);

z-index:25;

padding:
clamp(3px,0.6vw,7px)
clamp(5px,0.9vw,10px);

border:
1px solid #26734d;

border-radius:6px;

background:
rgba(0,20,10,0.92);

color:#8bffb8;

font-size:
clamp(6px,0.9vw,11px);

font-weight:bold;

white-space:nowrap;

}


#radarStatus.near{

color:#ffe16d;

border-color:#c89923;

background:
rgba(50,32,0,0.95);

}


/* ========================================================
   FULL SCREEN WARNING
======================================================== */

#warningOverlay{

position:fixed;

inset:0;

z-index:500;

display:none;

align-items:center;

justify-content:center;

background:
radial-gradient(
circle at center,
rgba(110,0,0,0.92) 0%,
rgba(48,0,0,0.97) 50%,
rgba(8,0,0,1) 100%
);

overflow:hidden;

}


/* RED HUD RINGS */

.hudRing{

position:absolute;

left:50%;
top:50%;

border:
2px solid rgba(255,45,20,0.35);

border-radius:50%;

transform:
translate(-50%,-50%);

animation:
hudSpin 8s linear infinite;

}


.ring1{

width:85vmin;
height:85vmin;

border-style:dashed;

}


.ring2{

width:68vmin;
height:68vmin;

animation-direction:reverse;

}


.ring3{

width:50vmin;
height:50vmin;

border-style:dotted;

}


@keyframes hudSpin{

from{
transform:
translate(-50%,-50%)
rotate(0deg);
}

to{
transform:
translate(-50%,-50%)
rotate(360deg);
}

}


/* WARNING BOX */

#warningContent{

position:relative;

z-index:510;

display:flex;

flex-direction:column;

align-items:center;

justify-content:center;

text-align:center;

animation:
warningPulse
0.45s infinite alternate;

}


@keyframes warningPulse{

from{
transform:scale(0.96);
filter:brightness(0.75);
}

to{
transform:scale(1.03);
filter:brightness(1.25);
}

}


/* TRIANGLE */

.warningTriangle{

position:relative;

width:
clamp(75px,17vmin,160px);

height:
clamp(65px,15vmin,140px);

margin-bottom:
clamp(10px,2vh,20px);

}


.warningTriangle:before{

content:"";

position:absolute;

left:50%;

transform:
translateX(-50%);

width:0;
height:0;

border-left:
clamp(40px,9vmin,85px)
solid transparent;

border-right:
clamp(40px,9vmin,85px)
solid transparent;

border-bottom:
clamp(70px,15vmin,145px)
solid #ff361c;

filter:
drop-shadow(
0 0 18px #ff2a00
);

}


.warningTriangle:after{

content:"!";

position:absolute;

left:50%;
top:
clamp(23px,5vmin,48px);

transform:
translateX(-50%);

color:#ffe45b;

font-size:
clamp(38px,8vmin,78px);

font-weight:bold;

z-index:5;

}


/* WARNING TEXT */

#warningText{

padding:
clamp(7px,1.4vh,14px)
clamp(25px,5vw,60px);

border-top:
2px solid #ff351c;

border-bottom:
2px solid #ff351c;

background:
rgba(150,12,0,0.42);

color:#ffb52e;

font-size:
clamp(22px,6vmin,58px);

font-weight:bold;

letter-spacing:
clamp(2px,0.6vw,7px);

box-shadow:
0 0 30px
rgba(255,40,0,0.5);

}


#warningDistance{

margin-top:
clamp(12px,2.5vh,26px);

color:#ffffff;

font-size:
clamp(16px,3.5vmin,36px);

font-weight:bold;

letter-spacing:2px;

}


/* ========================================================
   PORTRAIT MESSAGE
======================================================== */

#rotateScreen{

position:fixed;

inset:0;

z-index:800;

display:none;

align-items:center;

justify-content:center;

background:#010305;

color:#72ffa3;

font-size:
clamp(15px,5vw,26px);

font-weight:bold;

letter-spacing:2px;

text-align:center;

}


@media
(orientation:portrait){

#rotateScreen{
display:flex;
}

}


/* SMALL PHONES */

@media
(orientation:landscape)
and
(max-height:390px){

#app{

grid-template-rows:
27px
minmax(0,1fr);

}

#content{

gap:3px;
padding:2px;

}

.panelTitle{

top:3px;
left:4px;

}

}

</style>

</head>


<body>


<div id="app">


<div id="header">

NAVIGATION RADAR SYSTEM

</div>


<div id="content">


<!-- =============================================== -->
<!-- LEFT - GYRO HORIZON                             -->
<!-- =============================================== -->

<div class="panel">

<div class="panelTitle">

GYRO HORIZON

</div>


<canvas
id="horizonCanvas">
</canvas>

</div>


<!-- =============================================== -->
<!-- RIGHT - RADAR                                   -->
<!-- =============================================== -->

<div class="panel">


<div class="panelTitle">

RADAR

</div>


<div id="radarStatus">

NO OBSTACLE DETECTED

</div>


<div id="distanceBox">

<div id="distanceLabel">

OBSTACLE DISTANCE

</div>


<div id="distanceValue">

--- CM

</div>

</div>


<canvas
id="radarCanvas">
</canvas>


</div>


</div>

</div>


<!-- ================================================= -->
<!-- FULL SCREEN DANGER                                 -->
<!-- ================================================= -->

<div id="warningOverlay">


<div class="hudRing ring1">
</div>

<div class="hudRing ring2">
</div>

<div class="hudRing ring3">
</div>


<div id="warningContent">


<div class="warningTriangle">
</div>


<div id="warningText">

WARNING

</div>


<div id="warningDistance">

DISTANCE 0 CM

</div>


</div>

</div>


<!-- ================================================= -->
<!-- PORTRAIT SCREEN                                   -->
<!-- ================================================= -->

<div id="rotateScreen">

ROTATE PHONE TO LANDSCAPE

</div>



<script>


// ============================================================
// ELEMENTS
// ============================================================

const horizonCanvas =
document.getElementById(
"horizonCanvas"
);


const radarCanvas =
document.getElementById(
"radarCanvas"
);


const hctx =
horizonCanvas.getContext(
"2d"
);


const rctx =
radarCanvas.getContext(
"2d"
);


const distanceValue =
document.getElementById(
"distanceValue"
);


const radarStatus =
document.getElementById(
"radarStatus"
);


const warningOverlay =
document.getElementById(
"warningOverlay"
);


const warningDistance =
document.getElementById(
"warningDistance"
);


// ============================================================
// SENSOR VALUES
// ============================================================

let targetHeading = 0;

let targetPitch = 0;

let targetRoll = 0;

let targetDistance = -1;


// ============================================================
// DISPLAY VALUES
// ============================================================

let smoothHeading = 0;

let smoothPitch = 0;

let smoothRoll = 0;

let smoothDistance = -1;


// ============================================================
// CANVAS SIZE
// ============================================================

let horizonW = 100;
let horizonH = 100;

let radarW = 100;
let radarH = 100;


// ============================================================
// RESPONSIVE CANVAS
// ============================================================

function resizeCanvas(
canvas,
ctx
){

const rect =
canvas.parentElement
.getBoundingClientRect();


const width =
Math.max(
1,
Math.floor(
rect.width
)
);


const height =
Math.max(
1,
Math.floor(
rect.height
)
);


const dpr =
Math.min(
window.devicePixelRatio || 1,
2
);


canvas.width =
Math.floor(
width*dpr
);


canvas.height =
Math.floor(
height*dpr
);


canvas.style.width =
width+"px";


canvas.style.height =
height+"px";


ctx.setTransform(
dpr,
0,
0,
dpr,
0,
0
);


return{

width:width,
height:height

};

}


function resizeAll(){

let h =
resizeCanvas(
horizonCanvas,
hctx
);


horizonW =
h.width;

horizonH =
h.height;


let r =
resizeCanvas(
radarCanvas,
rctx
);


radarW =
r.width;

radarH =
r.height;

}


window.addEventListener(
"resize",
resizeAll
);


window.addEventListener(
"orientationchange",
function(){

setTimeout(
resizeAll,
250
);

}
);


// ============================================================
// LANDSCAPE LOCK
// ============================================================

async function lockLandscape(){

try{

if(
screen.orientation &&
screen.orientation.lock
){

await screen.orientation.lock(
"landscape"
);

}

}
catch(e){

}

}


document.body.addEventListener(
"touchstart",
lockLandscape,
{once:true}
);


document.body.addEventListener(
"click",
lockLandscape,
{once:true}
);


// ============================================================
// HELPERS
// ============================================================

function rad(deg){

return deg *
Math.PI /
180;

}


function shortestAngle(
current,
target
){

return(
(
target-current+540
)%360
)-180;

}


// ============================================================
// DRAW ARTIFICIAL HORIZON
// ============================================================

function drawHorizon(){

const W =
horizonW;

const H =
horizonH;


hctx.clearRect(
0,
0,
W,
H
);


// smooth motion

smoothPitch +=
(
targetPitch -
smoothPitch
)*0.18;


smoothRoll +=
(
targetRoll -
smoothRoll
)*0.18;


const cx =
W*0.50;


const cy =
H*0.53;


const radius =
Math.min(
W*0.40,
H*0.40
);


if(radius<15){
return;
}


// ==========================================================
// CLIP CIRCLE
// ==========================================================

hctx.save();


hctx.beginPath();


hctx.arc(
cx,
cy,
radius,
0,
Math.PI*2
);


hctx.clip();


hctx.translate(
cx,
cy
);


hctx.rotate(
rad(
-smoothRoll
)
);


const pitchScale =
radius/35;


const pitchOffset =
smoothPitch *
pitchScale;


// SKY

hctx.fillStyle =
"#568cf7";


hctx.fillRect(
-radius*3,
-radius*3+
pitchOffset,
radius*6,
radius*3
);


// GROUND

hctx.fillStyle =
"#724b20";


hctx.fillRect(
-radius*3,
pitchOffset,
radius*6,
radius*3
);


// HORIZON

hctx.strokeStyle =
"#ffffff";


hctx.lineWidth =
Math.max(
2,
radius*0.014
);


hctx.beginPath();


hctx.moveTo(
-radius*3,
pitchOffset
);


hctx.lineTo(
radius*3,
pitchOffset
);


hctx.stroke();


// ==========================================================
// PITCH LADDER
// ==========================================================

for(
let deg=-30;
deg<=30;
deg+=5
){

if(deg===0){
continue;
}


let y =
pitchOffset +
deg *
pitchScale;


let major =
deg%10===0;


let length =
major
?
radius*0.33
:
radius*0.19;


hctx.strokeStyle =
"#ffffff";


hctx.lineWidth =
Math.max(
1.3,
radius*0.009
);


hctx.beginPath();


hctx.moveTo(
-length,
y
);


hctx.lineTo(
length,
y
);


hctx.stroke();


if(major){

let fontSize =
Math.max(
8,
radius*0.075
);


hctx.fillStyle =
"#ffffff";


hctx.font =
"bold "+
fontSize+
"px monospace";


hctx.textAlign =
"center";


let text =
String(
Math.abs(
deg
)
);


hctx.fillText(
text,
-length-
radius*0.11,
y+
fontSize*0.3
);


hctx.fillText(
text,
length+
radius*0.11,
y+
fontSize*0.3
);

}

}


hctx.restore();


// ==========================================================
// OUTER CIRCLE
// ==========================================================

hctx.strokeStyle =
"#ffffff";


hctx.lineWidth =
Math.max(
2,
radius*0.014
);


hctx.beginPath();


hctx.arc(
cx,
cy,
radius,
0,
Math.PI*2
);


hctx.stroke();


// ==========================================================
// BANK MARKS
// ==========================================================

let bankMarks =
[
-60,
-45,
-30,
-20,
-10,
10,
20,
30,
45,
60
];


hctx.strokeStyle =
"#ffffff";


hctx.lineWidth =
Math.max(
1.3,
radius*0.009
);


for(
let i=0;
i<bankMarks.length;
i++
){

let a =
rad(
bankMarks[i]-90
);


let outer =
radius+
radius*0.055;


let inner =
radius-
radius*0.055;


hctx.beginPath();


hctx.moveTo(
cx+
Math.cos(a)*outer,
cy+
Math.sin(a)*outer
);


hctx.lineTo(
cx+
Math.cos(a)*inner,
cy+
Math.sin(a)*inner
);


hctx.stroke();

}


// top pointer

hctx.fillStyle =
"#ffffff";


hctx.beginPath();


hctx.moveTo(
cx,
cy-radius-
radius*0.055
);


hctx.lineTo(
cx-radius*0.04,
cy-radius+
radius*0.03
);


hctx.lineTo(
cx+radius*0.04,
cy-radius+
radius*0.03
);


hctx.closePath();

hctx.fill();


// ==========================================================
// FIXED AIRCRAFT
// ==========================================================

hctx.strokeStyle =
"#ffffff";


hctx.lineWidth =
Math.max(
2,
radius*0.016
);


let wing =
radius*0.43;


let gap =
radius*0.10;


hctx.beginPath();


hctx.moveTo(
cx-wing,
cy
);


hctx.lineTo(
cx-gap,
cy
);


hctx.lineTo(
cx,
cy+
radius*0.075
);


hctx.lineTo(
cx+gap,
cy
);


hctx.lineTo(
cx+wing,
cy
);


hctx.stroke();

}


// ============================================================
// DRAW RADAR
// ============================================================

function drawRadar(){

const W =
radarW;

const H =
radarH;


rctx.clearRect(
0,
0,
W,
H
);


// smooth heading

smoothHeading +=
shortestAngle(
smoothHeading,
targetHeading
)*0.18;


if(
smoothHeading<0
){

smoothHeading+=360;

}


if(
smoothHeading>=360
){

smoothHeading-=360;

}


// smooth distance

if(
targetDistance>0
){

if(
smoothDistance<0
){

smoothDistance =
targetDistance;

}

else{

smoothDistance +=
(
targetDistance -
smoothDistance
)*0.30;

}

}

else{

smoothDistance=-1;

}


const cx =
W*0.50;


const cy =
H*0.53;


const radius =
Math.min(
W*0.40,
H*0.40
);


if(radius<15){
return;
}


// ==========================================================
// OUTER RINGS
// ==========================================================

rctx.strokeStyle =
"#20dc8b";


rctx.lineWidth =
Math.max(
2,
radius*0.012
);


rctx.beginPath();


rctx.arc(
cx,
cy,
radius,
0,
Math.PI*2
);


rctx.stroke();


rctx.strokeStyle =
"#164e37";


rctx.lineWidth=1;


rctx.beginPath();


rctx.arc(
cx,
cy,
radius*0.94,
0,
Math.PI*2
);


rctx.stroke();


// ==========================================================
// COMPASS SCALE
// ==========================================================

for(
let angle=0;
angle<360;
angle+=5
){

let display =
angle -
smoothHeading;


let a =
rad(
display-90
);


let major =
angle%30===0;


let medium =
angle%10===0;


let outer =
radius*0.985;


let inner =
radius-
(
major
?
radius*0.11
:
medium
?
radius*0.07
:
radius*0.035
);


let x1 =
cx+
Math.cos(a)*outer;


let y1 =
cy+
Math.sin(a)*outer;


let x2 =
cx+
Math.cos(a)*inner;


let y2 =
cy+
Math.sin(a)*inner;


rctx.strokeStyle =
major
?
"#a7f7d4"
:
"#1c694a";


rctx.lineWidth =
major
?
Math.max(
1.5,
radius*0.009
)
:
1;


rctx.beginPath();


rctx.moveTo(
x1,
y1
);


rctx.lineTo(
x2,
y2
);


rctx.stroke();


// labels

if(major){

let tr =
radius*0.79;


let tx =
cx+
Math.cos(a)*tr;


let ty =
cy+
Math.sin(a)*tr;


let label;


if(angle===0){

label="N";

}

else if(
angle===90
){

label="E";

}

else if(
angle===180
){

label="S";

}

else if(
angle===270
){

label="W";

}

else{

label=
String(
angle
);

}


rctx.fillStyle =
"#c7ffe7";


let fontSize =
Math.max(
8,
radius*0.065
);


rctx.font =
"bold "+
fontSize+
"px monospace";


rctx.textAlign =
"center";


rctx.textBaseline =
"middle";


rctx.save();


rctx.translate(
tx,
ty
);


rctx.rotate(
a+
Math.PI/2
);


rctx.fillText(
label,
0,
0
);


rctx.restore();

}

}


// ==========================================================
// TOP MARKER
// ==========================================================

rctx.fillStyle =
"#ffd94d";


rctx.beginPath();


rctx.moveTo(
cx,
cy-radius+
radius*0.03
);


rctx.lineTo(
cx-radius*0.03,
cy-radius+
radius*0.10
);


rctx.lineTo(
cx+radius*0.03,
cy-radius+
radius*0.10
);


rctx.closePath();

rctx.fill();


// ==========================================================
// CENTRE COURSE LINE
// ==========================================================

rctx.strokeStyle =
"#dd9638";


rctx.lineWidth =
Math.max(
1,
radius*0.007
);


rctx.beginPath();


rctx.moveTo(
cx,
cy-radius*0.68
);


rctx.lineTo(
cx,
cy+radius*0.62
);


rctx.stroke();


// ==========================================================
// AIRCRAFT
// ==========================================================

rctx.strokeStyle =
"#f1f3d5";


rctx.lineWidth =
Math.max(
2,
radius*0.012
);


rctx.beginPath();


rctx.moveTo(
cx-radius*0.08,
cy
);


rctx.lineTo(
cx,
cy-radius*0.05
);


rctx.lineTo(
cx+radius*0.08,
cy
);


rctx.moveTo(
cx-radius*0.055,
cy-radius*0.015
);


rctx.lineTo(
cx+radius*0.055,
cy-radius*0.015
);


rctx.moveTo(
cx,
cy-radius*0.05
);


rctx.lineTo(
cx,
cy+radius*0.09
);


rctx.stroke();


// green centre light

rctx.shadowColor =
"#31ff72";


rctx.shadowBlur =
radius*0.06;


rctx.fillStyle =
"#31ff72";


rctx.beginPath();


rctx.arc(
cx,
cy-radius*0.105,
Math.max(
3,
radius*0.025
),
0,
Math.PI*2
);


rctx.fill();


rctx.shadowBlur=0;


// ==========================================================
// HEADING VALUE
// ==========================================================

let headingText =
String(
Math.round(
smoothHeading
)%360
).padStart(
3,
"0"
);


rctx.fillStyle =
"#f4e98b";


rctx.font =
"bold "+
Math.max(
11,
radius*0.10
)+
"px monospace";


rctx.textAlign =
"center";


rctx.fillText(
headingText,
cx,
cy+
radius*0.52
);


// ==========================================================
// TARGET
// ==========================================================

if(
smoothDistance>0 &&
smoothDistance<=200
){

let ratio =
Math.min(
smoothDistance/200,
1
);


let objectRadius =
radius*
(
0.16+
ratio*0.56
);


let tx =
cx;


let ty =
cy-objectRadius;


let color;


if(
smoothDistance<20
){

color=
"#ff3030";

}

else if(
smoothDistance<50
){

color=
"#ffd549";

}

else{

color=
"#44ff78";

}


rctx.strokeStyle =
color;


rctx.fillStyle =
color;


rctx.shadowColor =
color;


rctx.shadowBlur =
radius*0.07;


// dot

rctx.beginPath();


rctx.arc(
tx,
ty,
Math.max(
4,
radius*0.027
),
0,
Math.PI*2
);


rctx.fill();


// outer circle

rctx.beginPath();


rctx.arc(
tx,
ty,
Math.max(
9,
radius*0.065
),
0,
Math.PI*2
);


rctx.stroke();


rctx.shadowBlur=0;

}

}


// ============================================================
// UPDATE WARNING DISPLAY
// ============================================================

function updateWarning(){

// ----------------------------------------------------------
// NO VALID READING
// ----------------------------------------------------------

if(
targetDistance <= 0
){

distanceValue.innerText =
"--- CM";


radarStatus.className =
"";


radarStatus.innerText =
"NO OBSTACLE DETECTED";


warningOverlay.style.display =
"none";


return;

}


// ----------------------------------------------------------
// DISTANCE NUMBER
// ----------------------------------------------------------

let d =
Math.round(
targetDistance
);


distanceValue.innerText =
d+" CM";


// ----------------------------------------------------------
// DANGER BELOW 20 CM
// ----------------------------------------------------------

if(
targetDistance<20
){

radarStatus.className =
"near";


radarStatus.innerText =
"OBSTACLE";


warningDistance.innerText =
"DISTANCE "+
d+
" CM";


warningOverlay.style.display =
"flex";

}


// ----------------------------------------------------------
// 20 TO 50 CM
// ----------------------------------------------------------

else if(
targetDistance<50
){

radarStatus.className =
"near";


radarStatus.innerText =
"OBJECT NEAR";


warningOverlay.style.display =
"none";

}


// ----------------------------------------------------------
// CLEAR
// ----------------------------------------------------------

else{

radarStatus.className =
"";


radarStatus.innerText =
"NO OBSTACLE DETECTED";


warningOverlay.style.display =
"none";

}

}


// ============================================================
// DATA REQUEST
//
// IMPORTANT:
// This does NOT use setInterval.
// Next request starts only AFTER previous request finishes.
// Prevents overlapping requests and ECONNRESET spam.
// ============================================================

async function updateData(){

try{

let response =
await fetch(
"/data",
{
cache:"no-store"
}
);


let data =
await response.json();


targetHeading =
Number(
data.heading
)||0;


targetPitch =
Number(
data.pitch
)||0;


targetRoll =
Number(
data.roll
)||0;


let d =
Number(
data.distance
);


if(
isNaN(d)
){

targetDistance=-1;

}

else{

targetDistance=d;

}


updateWarning();

}

catch(error){

// Ignore temporary WiFi fetch failure

}


// Request again only after this request finished

setTimeout(
updateData,
100
);

}


// ============================================================
// DRAW LOOP
// ============================================================

function animate(){

drawHorizon();

drawRadar();


requestAnimationFrame(
animate
);

}


// ============================================================
// START
// ============================================================

resizeAll();


setTimeout(
resizeAll,
200
);


setTimeout(
resizeAll,
500
);


animate();


updateData();

</script>

</body>

</html>
"""


# ============================================================
# WIFI
# ============================================================

def start_wifi():

    ap = network.WLAN(
        network.AP_IF
    )


    ap.active(False)

    time.sleep_ms(300)

    ap.active(True)


    try:

        ap.config(
            essid=SSID,
            password=PASSWORD
        )

    except:

        ap.config(
            essid=SSID
        )


    while not ap.active():

        time.sleep_ms(100)


    ip = ap.ifconfig()[0]


    print()
    print("==============================")
    print("NAVIGATION RADAR WIFI")
    print("==============================")

    print("SSID:", SSID)
    print("PASSWORD:", PASSWORD)
    print("IP:", ip)

    print()
    print("OPEN:")
    print("http://" + ip)
    print()


    return ap


# ============================================================
# SAFE HTTP SEND
# ============================================================

def safe_send(client, data):

    if isinstance(data, str):

        data = data.encode()


    total = 0

    length = len(data)


    while total < length:

        try:

            sent = client.send(
                data[total:]
            )


            if not sent:
                break


            total += sent


        except OSError:
            break


# ============================================================
# HTTP RESPONSE
# ============================================================

def send_response(
    client,
    content,
    content_type="text/html"
):

    header = (
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: "
        + content_type
        + "; charset=utf-8\r\n"
        "Cache-Control: no-store\r\n"
        "Pragma: no-cache\r\n"
        "Connection: close\r\n"
        "\r\n"
    )


    safe_send(
        client,
        header
    )


    safe_send(
        client,
        content
    )


# ============================================================
# WEB SERVER
# ============================================================

def web_server():

    global heading


    address = socket.getaddrinfo(
        "0.0.0.0",
        80
    )[0][-1]


    server = socket.socket()


    try:

        server.setsockopt(
            socket.SOL_SOCKET,
            socket.SO_REUSEADDR,
            1
        )

    except:
        pass


    server.bind(
        address
    )


    # slightly larger backlog
    server.listen(
        4
    )


    server.setblocking(
        False
    )


    print(
        "Web server running"
    )

    print()


    while True:


        # ====================================================
        # SENSOR UPDATES
        # ====================================================

        update_heading()

        update_attitude()

        update_distance()


        # ====================================================
        # HTTP
        # ====================================================

        try:

            client, addr = \
                server.accept()


        except OSError:

            time.sleep_ms(2)

            continue


        try:

            request = client.recv(
                1024
            )


            if not request:

                client.close()

                continue


            request = request.decode(
                "utf-8"
            )


            first_line = request.split(
                "\r\n"
            )[0]


            parts = first_line.split()


            if len(parts) >= 2:

                path = parts[1]

            else:

                path = "/"


            # ================================================
            # WEB PAGE
            # ================================================

            if path == "/":

                send_response(
                    client,
                    HTML
                )


            # ================================================
            # LIVE DATA
            # ================================================

            elif path.startswith(
                "/data"
            ):


                payload = (
                    "{"

                    + '"heading":'
                    + str(
                        round(
                            heading,
                            1
                        )
                    )

                    + ","

                    + '"pitch":'
                    + str(
                        round(
                            pitch,
                            1
                        )
                    )

                    + ","

                    + '"roll":'
                    + str(
                        round(
                            roll,
                            1
                        )
                    )

                    + ","

                    + '"distance":'
                    + str(
                        round(
                            distance_cm,
                            1
                        )
                    )

                    + "}"
                )


                send_response(
                    client,
                    payload,
                    "application/json"
                )


            # ================================================
            # ZERO
            # ================================================

            elif path.startswith(
                "/zero"
            ):

                heading = 0.0


                send_response(
                    client,
                    '{"status":"ok"}',
                    "application/json"
                )


            # ================================================
            # CALIBRATE
            # ================================================

            elif path.startswith(
                "/calibrate"
            ):

                calibrate_mpu(
                    5
                )


                send_response(
                    client,
                    '{"status":"ok"}',
                    "application/json"
                )


            else:

                send_response(
                    client,
                    "404",
                    "text/plain"
                )


        except OSError as e:

            # Browser may close connection before ESP32 finishes.
            # Errno 104 is normal and can safely be ignored.

            try:

                error_number = e.args[0]

            except:

                error_number = None


            if error_number != 104:

                print(
                    "Web socket error:",
                    e
                )


        except Exception as e:

            print(
                "Web error:",
                e
            )


        finally:

            try:

                client.close()

            except:

                pass


        gc.collect()


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("====================================")
    print(" NAVIGATION RADAR SYSTEM")
    print("====================================")
    print()


    # MPU

    if not init_mpu6050():

        print(
            "Check MPU6050 connection"
        )

        return


    # Calibration

    calibrate_mpu(
        5
    )


    # Ultrasonic test

    print(
        "Ultrasonic test:"
    )


    test_distance = \
        read_ultrasonic()


    print(
        test_distance,
        "CM"
    )


    # WiFi

    start_wifi()


    # Web

    web_server()


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    main()