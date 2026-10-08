# ==========================================================
# LOF TITAN ALERT ROVER
# MicroPython Version
# ESP32-S3
# ==========================================================

from machine import Pin, PWM, I2C
import network
import socket
import time
import json

try:
    import sh1106
except ImportError:
    sh1106 = None


# ==========================================================
# WIFI ACCESS POINT
# ==========================================================

AP_SSID = "LOF_TITAN_ROVER"
AP_PASSWORD = "12345678"

AP_IP = "192.168.4.1"


# ==========================================================
# OLED
# ==========================================================

OLED_SDA = 7
OLED_SCL = 8

i2c = I2C(
    0,
    sda=Pin(OLED_SDA),
    scl=Pin(OLED_SCL),
    freq=400000
)

oled = None

if sh1106:
    try:
        oled = sh1106.SH1106_I2C(
            128,
            64,
            i2c
        )
        oled.sleep(False)
    except Exception as e:
        print("OLED Error:", e)


# ==========================================================
# SENSOR PINS
# ==========================================================

PIR_PIN = 2
WATER_PIN = 4

pir = Pin(
    PIR_PIN,
    Pin.IN
)

water_sensor = Pin(
    WATER_PIN,
    Pin.IN
)


# ==========================================================
# WATER SENSOR LOGIC
# ==========================================================

# If sensor outputs HIGH when water is detected:
WATER_ACTIVE_STATE = 1

# If your sensor outputs LOW when wet, use:
# WATER_ACTIVE_STATE = 0


# ==========================================================
# MOTOR PINS
# ==========================================================

# M3 LEFT MOTOR
LEFT_MOTOR_1 = 11
LEFT_MOTOR_2 = 12

# M4 RIGHT MOTOR
RIGHT_MOTOR_1 = 9
RIGHT_MOTOR_2 = 10


# ==========================================================
# PWM SETUP
# ==========================================================

PWM_FREQ = 5000

left_1 = PWM(
    Pin(LEFT_MOTOR_1),
    freq=PWM_FREQ
)

left_2 = PWM(
    Pin(LEFT_MOTOR_2),
    freq=PWM_FREQ
)

right_1 = PWM(
    Pin(RIGHT_MOTOR_1),
    freq=PWM_FREQ
)

right_2 = PWM(
    Pin(RIGHT_MOTOR_2),
    freq=PWM_FREQ
)


# ==========================================================
# MOTOR SPEED
# ==========================================================

# Arduino original:
# 0 - 255
#
# MicroPython duty_u16:
# 0 - 65535

MOTOR_SPEED = 200

MOTOR_PWM = int(
    MOTOR_SPEED / 255 * 65535
)


# ==========================================================
# SENSOR STATES
# ==========================================================

motionDetected = False
waterDetected = False

previousMotionState = False
previousWaterState = False


# ==========================================================
# MOTOR FUNCTIONS
# ==========================================================

def left_motor_forward():

    left_1.duty_u16(MOTOR_PWM)
    left_2.duty_u16(0)


def left_motor_backward():

    left_1.duty_u16(0)
    left_2.duty_u16(MOTOR_PWM)


def left_motor_stop():

    left_1.duty_u16(0)
    left_2.duty_u16(0)


def right_motor_forward():

    right_1.duty_u16(MOTOR_PWM)
    right_2.duty_u16(0)


def right_motor_backward():

    right_1.duty_u16(0)
    right_2.duty_u16(MOTOR_PWM)


def right_motor_stop():

    right_1.duty_u16(0)
    right_2.duty_u16(0)


# ==========================================================
# ROVER FUNCTIONS
# ==========================================================

def motors_forward():

    left_motor_forward()
    right_motor_forward()

    print("ROVER -> FORWARD")


def motors_backward():

    left_motor_backward()
    right_motor_backward()

    print("ROVER -> BACKWARD")


def motors_left():

    left_motor_backward()
    right_motor_forward()

    print("ROVER -> LEFT")


def motors_right():

    left_motor_forward()
    right_motor_backward()

    print("ROVER -> RIGHT")


def motors_stop():

    left_motor_stop()
    right_motor_stop()

    print("ROVER -> STOP")


# ==========================================================
# OLED FUNCTIONS
# ==========================================================

def oled_clear():

    if oled is None:
        return

    oled.fill(0)


def oled_show():

    if oled is None:
        return

    oled.show()


def show_startup():

    if oled is None:
        return

    oled.fill(0)

    oled.text(
        "LOF TITAN",
        28,
        8
    )

    oled.text(
        "ALERT SYSTEM",
        18,
        28
    )

    oled.text(
        "Starting...",
        24,
        48
    )

    oled.show()


def show_wifi():

    if oled is None:
        return

    oled.fill(0)

    oled.text(
        "ESP32 WiFi",
        25,
        0
    )

    oled.text(
        "LOF_TITAN_ROVER",
        0,
        18
    )

    oled.text(
        "Open browser:",
        0,
        36
    )

    oled.text(
        "192.168.4.1",
        0,
        52
    )

    oled.show()


def update_oled():

    if oled is None:
        return

    oled.fill(0)

    # Both detected
    if motionDetected and waterDetected:

        oled.text(
            "Motion Detected!",
            0,
            15
        )

        oled.text(
            "Water Detected!",
            0,
            40
        )

    # Motion only
    elif motionDetected:

        oled.text(
            "ALERT!",
            38,
            10
        )

        oled.text(
            "Motion Detected!",
            0,
            35
        )

    # Water only
    elif waterDetected:

        oled.text(
            "ALERT!",
            38,
            10
        )

        oled.text(
            "Water Detected!",
            0,
            35
        )

    # Safe
    else:

        oled.text(
            "SYSTEM SAFE",
            20,
            18
        )

        oled.text(
            "No Alert",
            32,
            40
        )

    oled.show()


# ==========================================================
# SENSOR CHECK
# ==========================================================

def check_sensors():

    global motionDetected
    global waterDetected

    global previousMotionState
    global previousWaterState

    # PIR
    motionDetected = (
        pir.value() == 1
    )

    # Water sensor
    waterDetected = (
        water_sensor.value()
        ==
        WATER_ACTIVE_STATE
    )

    # Motion state changed
    if motionDetected != previousMotionState:

        if motionDetected:

            print(
                "ALERT: MOTION DETECTED"
            )

        else:

            print(
                "MOTION: CLEAR"
            )

        previousMotionState = motionDetected

    # Water state changed
    if waterDetected != previousWaterState:

        if waterDetected:

            print(
                "ALERT: WATER DETECTED"
            )

        else:

            print(
                "WATER: CLEAR"
            )

        previousWaterState = waterDetected

    update_oled()


# ==========================================================
# WEB PAGE
# ==========================================================

MAIN_PAGE = """<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width, initial-scale=1.0">

<title>LoF Titan Alert Rover</title>

<style>

{
    box-sizing: border-box;
}

body {

    margin: 0;

    font-family:
    Arial,
    Helvetica,
    sans-serif;

    background:
    linear-gradient(
        135deg,
        #061526,
        #0d3152
    );

    color: white;

    text-align: center;
}

.header {

    background: #06101d;

    padding: 22px;

    font-size: 27px;

    font-weight: bold;

    letter-spacing: 1px;

    box-shadow:
    0px 4px 15px
    rgba(0,0,0,0.5);
}

.container {

    max-width: 700px;

    margin: auto;

    padding: 20px;
}

.section-title {

    font-size: 21px;

    font-weight: bold;

    margin-top: 15px;

    margin-bottom: 20px;
}

.sensor-container {

    display: flex;

    justify-content: center;

    align-items: center;

    gap: 20px;

    flex-wrap: wrap;
}

.sensor-card {

    width: 270px;

    padding: 22px;

    background: #112d48;

    border-radius: 18px;

    box-shadow:
    0px 6px 20px
    rgba(0,0,0,0.4);
}

.sensor-name {

    font-size: 20px;

    font-weight: bold;

    margin-bottom: 15px;
}

.status {

    padding: 18px;

    border-radius: 12px;

    font-size: 18px;

    font-weight: bold;

    transition: 0.3s;
}

.safe {

    background: #16834a;

    box-shadow:
    0px 0px 12px
    rgba(22,131,74,0.7);
}

.alert {

    background: #d52d35;

    box-shadow:
    0px 0px 18px
    rgba(255,0,0,0.8);

    animation:
    alertPulse
    0.7s
    infinite
    alternate;
}

@keyframes alertPulse {

    from {
        transform: scale(1);
    }

    to {
        transform: scale(1.05);
    }
}

.control-panel {

    margin-top: 30px;

    padding: 25px;

    background: #112d48;

    border-radius: 18px;

    box-shadow:
    0px 6px 20px
    rgba(0,0,0,0.4);
}

.control-grid {

    display: grid;

    grid-template-columns:
    100px
    100px
    100px;

    gap: 15px;

    justify-content: center;

    margin-top: 20px;
}

button {

    width: 100px;

    height: 65px;

    border: none;

    border-radius: 14px;

    background: #178ce5;

    color: white;

    font-size: 15px;

    font-weight: bold;

    cursor: pointer;

    box-shadow:
    0px 5px 12px
    rgba(0,0,0,0.5);

    touch-action: none;

    user-select: none;
}

button:active {

    transform: scale(0.92);
}

.stop-button {

    background: #e02e38;
}

.blank {

    visibility: hidden;
}

.connection {

    margin-top: 25px;

    padding: 10px;

    font-size: 14px;

    color: #a6cce8;
}

.online-dot {

    display: inline-block;

    width: 10px;

    height: 10px;

    background: #24d264;

    border-radius: 50%;

    margin-right: 6px;
}

@media(max-width:420px) {

    .header {
        font-size: 21px;
    }

    .control-grid {

        grid-template-columns:
        85px
        85px
        85px;
    }

    button {

        width: 85px;

        font-size: 13px;
    }
}

</style>

</head>


<body>


<div class="header">

LOF TITAN ALERT ROVER

</div>


<div class="container">


<div class="section-title">

LIVE SENSOR STATUS

</div>


<div class="sensor-container">


<div class="sensor-card">

<div class="sensor-name">

MOTION SENSOR

</div>


<div
id="motion"
class="status safe">

NO MOTION

</div>

</div>


<div class="sensor-card">

<div class="sensor-name">

WATER SENSOR

</div>


<div
id="water"
class="status safe">

NO WATER

</div>

</div>


</div>


<div class="control-panel">


<div class="section-title">

ROVER CONTROL

</div>


<div class="control-grid">


<div class="blank"></div>


<button
onpointerdown="startMove('/forward')"
onpointerup="stopMove()"
onpointerleave="stopMove()"
onpointercancel="stopMove()">

FORWARD

</button>


<div class="blank"></div>


<button
onpointerdown="startMove('/left')"
onpointerup="stopMove()"
onpointerleave="stopMove()"
onpointercancel="stopMove()">

LEFT

</button>


<button
class="stop-button"
onclick="sendCommand('/stop')">

STOP

</button>


<button
onpointerdown="startMove('/right')"
onpointerup="stopMove()"
onpointerleave="stopMove()"
onpointercancel="stopMove()">

RIGHT

</button>


<div class="blank"></div>


<button
onpointerdown="startMove('/backward')"
onpointerup="stopMove()"
onpointerleave="stopMove()"
onpointercancel="stopMove()">

BACKWARD

</button>


<div class="blank"></div>


</div>

</div>


<div class="connection">

<span class="online-dot"></span>

ESP32-S3 Direct Wi-Fi Dashboard

<br><br>

Connect to:
LOF_TITAN_ROVER

<br><br>

Open:
192.168.4.1

</div>


</div>


<script>

let moving = false;


function sendCommand(command) {

    fetch(
        command,
        {
            cache:"no-store"
        }
    )
    .catch(error => {

        console.log(
            "Command Error",
            error
        );

    });
}


function startMove(command) {

    moving = true;

    sendCommand(command);
}


function stopMove() {

    if(moving) {

        moving = false;

        sendCommand('/stop');
    }
}


function updateSensors() {

    fetch(
        '/status',
        {
            cache:'no-store'
        }
    )

    .then(
        response =>
        response.json()
    )

    .then(data => {

        let motion =
        document.getElementById(
            "motion"
        );

        if(data.motion === true) {

            motion.innerHTML =
            "MOTION DETECTED";

            motion.className =
            "status alert";
        }

        else {

            motion.innerHTML =
            "NO MOTION";

            motion.className =
            "status safe";
        }


        let water =
        document.getElementById(
            "water"
        );

        if(data.water === true) {

            water.innerHTML =
            "WATER DETECTED";

            water.className =
            "status alert";
        }

        else {

            water.innerHTML =
            "NO WATER";

            water.className =
            "status safe";
        }

    })

    .catch(error => {

        console.log(
            "Dashboard connection error"
        );

    });
}


setInterval(
    updateSensors,
    500
);


updateSensors();


window.addEventListener(
    "blur",
    function() {

        sendCommand('/stop');

        moving = false;
    }
);


window.addEventListener(
    "beforeunload",
    function() {

        sendCommand('/stop');
    }
);

</script>


</body>

</html>
"""


# ==========================================================
# WIFI ACCESS POINT
# ==========================================================

def start_access_point():

    print()
    print(
        "Starting ESP32 Wi-Fi Access Point..."
    )

    ap = network.WLAN(
        network.AP_IF
    )

    ap.active(False)

    time.sleep_ms(300)

    ap.active(True)

    # Configure fixed IP
    try:

        ap.ifconfig(
            (
                AP_IP,
                "255.255.255.0",
                AP_IP,
                AP_IP
            )
        )

    except Exception as e:

        print(
            "AP IP configuration warning:",
            e
        )

    # Configure SSID/password
    try:

        ap.config(
            essid=AP_SSID,
            password=AP_PASSWORD
        )

    except Exception:

        # Some MicroPython builds use security/authmode
        ap.config(
            essid=AP_SSID,
            password=AP_PASSWORD
        )

    timeout = 50

    while (
        not ap.active()
        and
        timeout > 0
    ):

        time.sleep_ms(100)

        timeout -= 1


    if not ap.active():

        print(
            "ERROR: Access Point failed!"
        )

        if oled:

            oled.fill(0)

            oled.text(
                "WiFi AP FAILED!",
                0,
                25
            )

            oled.show()

        while True:
            time.sleep(1)


    print()
    print(
        "ESP32 ACCESS POINT READY"
    )

    print(
        "Wi-Fi Name :",
        AP_SSID
    )

    print(
        "Password   :",
        AP_PASSWORD
    )

    print(
        "Dashboard  : http://" +
        AP_IP
    )

    show_wifi()

    time.sleep(4)

    return ap


# ==========================================================
# SEND HTTP RESPONSE
# ==========================================================

def send_response(
    client,
    content,
    content_type="text/plain",
    status="200 OK"
):

    if isinstance(
        content,
        str
    ):

        content = content.encode()


    header = (
        "HTTP/1.1 {}\r\n"
        "Content-Type: {}\r\n"
        "Content-Length: {}\r\n"
        "Connection: close\r\n"
        "Cache-Control: no-store\r\n"
        "\r\n"
    ).format(
        status,
        content_type,
        len(content)
    )

    client.sendall(
        header.encode()
    )

    client.sendall(
        content
    )


# ==========================================================
# PROCESS WEB REQUEST
# ==========================================================

def process_request(client):

    try:

        request = client.recv(
            1024
        )

        if not request:
            return

        request = request.decode(
            "utf-8",
            "ignore"
        )

        first_line = request.split(
            "\r\n"
        )[0]

        parts = first_line.split()

        if len(parts) < 2:
            return

        path = parts[1]


        # ==============================================
        # MAIN PAGE
        # ==============================================

        if path == "/":

            send_response(
                client,
                MAIN_PAGE,
                "text/html"
            )


        # ==============================================
        # SENSOR STATUS
        # ==============================================

        elif path.startswith(
            "/status"
        ):

            status = {
                "motion":
                motionDetected,

                "water":
                waterDetected
            }

            send_response(
                client,
                json.dumps(status),
                "application/json"
            )


        # ==============================================
        # FORWARD
        # ==============================================

        elif path.startswith(
            "/forward"
        ):

            motors_forward()

            send_response(
                client,
                "FORWARD"
            )


        # ==============================================
        # BACKWARD
        # ==============================================

        elif path.startswith(
            "/backward"
        ):

            motors_backward()

            send_response(
                client,
                "BACKWARD"
            )


        # ==============================================
        # LEFT
        # ==============================================

        elif path.startswith(
            "/left"
        ):

            motors_left()

            send_response(
                client,
                "LEFT"
            )


        # ==============================================
        # RIGHT
        # ==============================================

        elif path.startswith(
            "/right"
        ):

            motors_right()

            send_response(
                client,
                "RIGHT"
            )


        # ==============================================
        # STOP
        # ==============================================

        elif path.startswith(
            "/stop"
        ):

            motors_stop()

            send_response(
                client,
                "STOP"
            )


        # ==============================================
        # FAVICON
        # ==============================================

        elif path.startswith(
            "/favicon.ico"
        ):

            send_response(
                client,
                "",
                "text/plain"
            )


        # ==============================================
        # NOT FOUND
        # ==============================================

        else:

            send_response(
                client,
                "404 Not Found",
                "text/plain",
                "404 Not Found"
            )


    except Exception as e:

        print(
            "Web error:",
            e
        )


# ==========================================================
# WEB SERVER
# ==========================================================

def start_web_server():

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

    server.listen(
        3
    )

    server.settimeout(
        0.05
    )

    print(
        "Web Server Started!"
    )

    return server


# ==========================================================
# MAIN
# ==========================================================

def main():

    print()

    print(
        "=================================="
    )

    print(
        "      LOF TITAN ALERT ROVER"
    )

    print(
        "      DIRECT ESP32 WI-FI MODE"
    )

    print(
        "=================================="
    )


    # Safety stop
    motors_stop()


    # OLED startup
    show_startup()

    time.sleep(
        1.5
    )


    # Start WiFi
    ap = start_access_point()


    # Start web server
    server = start_web_server()


    # Initial sensor check
    check_sensors()


    print()

    print(
        "=================================="
    )

    print(
        "SYSTEM READY"
    )

    print(
        "CONNECT TO WIFI :",
        AP_SSID
    )

    print(
        "PASSWORD        :",
        AP_PASSWORD
    )

    print(
        "OPEN BROWSER    : http://" +
        AP_IP
    )

    print(
        "M3 LEFT MOTOR   : GPIO 11 / GPIO 12"
    )

    print(
        "M4 RIGHT MOTOR  : GPIO 9 / GPIO 10"
    )

    print(
        "PIR             : GPIO 2"
    )

    print(
        "WATER SENSOR    : GPIO 4"
    )

    print(
        "OLED SDA/SCL    : GPIO 7 / GPIO 8"
    )

    print(
        "=================================="
    )


    previous_sensor_time = (
        time.ticks_ms()
    )


    while True:

        # ==============================================
        # WEB SERVER
        # ==============================================

        try:

            client, address = (
                server.accept()
            )

            try:

                client.settimeout(
                    1
                )

                process_request(
                    client
                )

            finally:

                try:
                    client.close()
                except:
                    pass


        except OSError:
            # Normal socket timeout
            pass

        except Exception as e:

            print(
                "Server error:",
                e
            )


        # ==============================================
        # SENSOR UPDATE EVERY 300 ms
        # ==============================================

        current_time = (
            time.ticks_ms()
        )

        if (
            time.ticks_diff(
                current_time,
                previous_sensor_time
            )
            >=
            300
        ):

            previous_sensor_time = (
                current_time
            )

            check_sensors()


        time.sleep_ms(
            5
        )


# ==========================================================
# START PROGRAM
# ==========================================================

try:

    main()

except KeyboardInterrupt:

    motors_stop()

    print(
        "Program stopped"
    )

except Exception as e:

    motors_stop()

    print(
        "Fatal Error:",
        e
    )