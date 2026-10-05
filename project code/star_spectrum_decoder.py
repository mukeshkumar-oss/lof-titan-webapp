# ============================================================
# STAR SPECTRUM DECODER
# MicroPython - LOF TITAN ESP32-S3
#
# AS7341 + 1.3" I2C OLED
#
# AUTO I2C:
# Scans the exposed TITAN I2C / sensor connector pin pairs below.
#
# Device addresses:
# AS7341         = 0x39
# 1.3" OLED      = 0x3C or 0x3D
#
# Default TITAN I2C = SDA GPIO7, SCL GPIO8
# ============================================================

from machine import Pin, I2C, SoftI2C
import network
import socket
import time
import json
import gc

# ============================================================
# OLED DRIVER
# ============================================================

try:
    import sh1106
except ImportError:
    sh1106 = None

# ============================================================
# AS7341 DRIVER
# ============================================================

try:
    from as7341 import AS7341
except ImportError:
    AS7341 = None


# ============================================================
# PIN SETTINGS
# ============================================================

# Each entry is: (name, SDA pin, SCL pin)
# GPIO7/8 is the normal LOF TITAN I2C connector.
# GPIO1/2, 3/4 and 5/6 are also scanned so a device can be
# connected to another exposed sensor pair without changing the code.
I2C_PORTS = [
    ("TITAN-I2C", 7, 8),
    ("S1-S2",     1, 2),
    ("S3-S4",     3, 4),
    ("S5-S6",     5, 6),
]

AS7341_ADDR = 0x39
OLED_ADDRS = (0x3C, 0x3D)

I2C_FREQ = 100000


# ============================================================
# WIFI HOTSPOT
# ============================================================

SSID = "StarSpectrumDecoder"
PASSWORD = "12345678"

AP_IP = "192.168.4.1"


# ============================================================
# SENSOR SETTINGS
# ============================================================

NUM_SAMPLES = 5

SENSOR_INTERVAL = 500

raw_ch = [0] * 12

vis = [0] * 8

latest_color = "READY"

latest_star = "Unknown"


# ============================================================
# CALIBRATED VALUES
# F1 F2 F3 F4 F5 F6 F7 F8
# ============================================================

RED_REF = [
    3020, 8860, 7358, 12863,
    13612, 30000, 30000, 5823
]

YELLOW_REF = [
    4704, 10138, 30000, 30000,
    23762, 30000, 30000, 8160
]

SKYBLUE_REF = [
    6499, 30000, 30000, 30000,
    23178, 30000, 30000, 11203
]

BLUE_REF = [
    2885, 30000, 30000, 14299,
    14134, 13206, 12269, 6304
]

WHITE_REF = [
    6419, 30000, 30000, 30000,
    23710, 30000, 30000, 11248
]

ORANGE_REF = [
    3220, 7662, 18428, 30000,
    15030, 30000, 30000, 5619
]


# ============================================================
# AUTO I2C BUS SCAN
# ============================================================

i2c_buses = []
sensor_i2c = None
sensor_i2c_name = None
oled_i2c = None
oled_i2c_name = None
oled_addr = None


def create_i2c_bus(name, sda_pin, scl_pin):
    try:
        bus = SoftI2C(
            sda=Pin(sda_pin),
            scl=Pin(scl_pin),
            freq=I2C_FREQ
        )

        # Small settling delay before scan.
        time.sleep_ms(10)

        devices = bus.scan()

        return {
            "name": name,
            "sda": sda_pin,
            "scl": scl_pin,
            "bus": bus,
            "devices": devices
        }

    except Exception as e:
        print(
            "I2C bus error {} SDA={} SCL={}: {}".format(
                name,
                sda_pin,
                scl_pin,
                e
            )
        )

        return None


def scan_all_i2c_ports():
    global i2c_buses
    global sensor_i2c
    global sensor_i2c_name
    global oled_i2c
    global oled_i2c_name
    global oled_addr

    i2c_buses = []

    sensor_i2c = None
    sensor_i2c_name = None

    oled_i2c = None
    oled_i2c_name = None
    oled_addr = None

    print()
    print("================================")
    print("AUTO I2C SCAN")
    print("================================")

    for name, sda_pin, scl_pin in I2C_PORTS:

        result = create_i2c_bus(
            name,
            sda_pin,
            scl_pin
        )

        if result is None:
            continue

        i2c_buses.append(result)

        devices = result["devices"]

        if devices:
            addresses = [
                hex(address)
                for address in devices
            ]

            print(
                "{} | SDA={} SCL={} | {}".format(
                    name,
                    sda_pin,
                    scl_pin,
                    ", ".join(addresses)
                )
            )

        else:
            print(
                "{} | SDA={} SCL={} | no device".format(
                    name,
                    sda_pin,
                    scl_pin
                )
            )

        # Select the first bus containing AS7341.
        if (
            sensor_i2c is None
            and
            AS7341_ADDR in devices
        ):
            sensor_i2c = result["bus"]
            sensor_i2c_name = name

        # Select the first bus containing a supported OLED address.
        if oled_i2c is None:

            for address in OLED_ADDRS:

                if address in devices:

                    oled_i2c = result["bus"]
                    oled_i2c_name = name
                    oled_addr = address

                    break

    print("--------------------------------")

    if sensor_i2c is not None:
        print(
            "AS7341 found at 0x39 on {}".format(
                sensor_i2c_name
            )
        )
    else:
        print(
            "AS7341 0x39 not found on scanned I2C ports"
        )

    if oled_i2c is not None:
        print(
            "1.3 OLED found at {} on {}".format(
                hex(oled_addr),
                oled_i2c_name
            )
        )
    else:
        print(
            "1.3 OLED 0x3C/0x3D not found on scanned I2C ports"
        )

    print("================================")
    print()


def print_i2c_summary():
    print("I2C devices:")

    for item in i2c_buses:

        if item["devices"]:

            print(
                "{} SDA={} SCL={}: {}".format(
                    item["name"],
                    item["sda"],
                    item["scl"],
                    ", ".join(
                        hex(address)
                        for address in item["devices"]
                    )
                )
            )

        else:

            print(
                "{} SDA={} SCL={}: none".format(
                    item["name"],
                    item["sda"],
                    item["scl"]
                )
            )


# Scan every configured I2C port before creating drivers.
scan_all_i2c_ports()


# ============================================================
# 1.3-INCH OLED SETUP
# ============================================================

oled = None

if oled_i2c is None:

    print(
        "OLED skipped: no 0x3C/0x3D display detected"
    )

elif sh1106 is None:

    print(
        "sh1106.py not found"
    )

else:

    try:

        # Most 1.3-inch 128x64 I2C OLED modules use SH1106.
        # Pass the detected address so both 0x3C and 0x3D work.
        try:

            oled = sh1106.SH1106_I2C(
                128,
                64,
                oled_i2c,
                addr=oled_addr
            )

        except TypeError:

            # Compatibility with SH1106 drivers that do not
            # accept addr as a keyword.
            oled = sh1106.SH1106_I2C(
                128,
                64,
                oled_i2c
            )

        oled.sleep(False)

        # Some SH1106 libraries need flip()/rotate() settings.
        # Leave default orientation unless your module is mounted
        # upside-down.

        oled.fill(0)

        oled.text(
            "STAR SPECTRUM",
            10,
            10
        )

        oled.text(
            "DECODER",
            35,
            28
        )

        oled.text(
            "Starting...",
            25,
            48
        )

        oled.show()

        print(
            "1.3 OLED initialized on {} at {}".format(
                oled_i2c_name,
                hex(oled_addr)
            )
        )

    except Exception as e:

        oled = None

        print(
            "OLED Error:",
            e
        )


# ============================================================
# AS7341 SETUP
# ============================================================

sensor = None

if sensor_i2c is None:

    print(
        "AS7341 skipped: 0x39 not detected"
    )

elif AS7341 is None:

    print(
        "as7341.py not found"
    )

else:

    try:

        sensor = AS7341(
            sensor_i2c
        )

        print(
            "AS7341 initialized on {}".format(
                sensor_i2c_name
            )
        )

    except Exception as e:

        print(
            "AS7341 init error:",
            e
        )


# ============================================================
# STAR MAPPING
# ============================================================

def get_star_name(color):

    if color == "BLUE":

        return "Rigel"

    if color == "SKY BLUE":

        return "Sirius"

    if color == "WHITE":

        return "Procyon"

    if color == "YELLOW":

        return "Sun"

    if color == "ORANGE":

        return "Arcturus"

    if color == "RED":

        return "Betelgeuse"

    return "Unknown"


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_array(values):

    total = 0.0

    for value in values:

        total += value


    if total <= 0:

        total = 1.0


    result = []

    for value in values:

        result.append(
            value / total
        )


    return result


# ============================================================
# DISTANCE
# ============================================================

def calc_distance(a, b):

    distance = 0.0

    for i in range(8):

        difference = (
            a[i]
            -
            b[i]
        )

        distance += (
            difference
            *
            difference
        )


    return distance


# ============================================================
# SPECIAL COLOR CHECKS
# ============================================================

def looks_like_white(values):

    high_count = 0

    for value in values:

        if value > 20000:

            high_count += 1


    return (
        high_count >= 5
        and
        values[4] > 18000
        and
        values[7] > 9000
    )


def looks_like_sky_blue(values):

    return (

        values[1] > 25000

        and

        values[2] > 25000

        and

        values[3] > 25000

        and

        values[4] > 18000

        and

        values[7] > 10000
    )


# ============================================================
# DETECT COLOR
# ============================================================

def detect_color():

    if looks_like_sky_blue(
        vis
    ):

        return "SKY BLUE"


    if looks_like_white(
        vis
    ):

        return "WHITE"


    live_norm = normalize_array(
        vis
    )


    references = {

        "RED":
        normalize_array(
            RED_REF
        ),

        "YELLOW":
        normalize_array(
            YELLOW_REF
        ),

        "SKY BLUE":
        normalize_array(
            SKYBLUE_REF
        ),

        "BLUE":
        normalize_array(
            BLUE_REF
        ),

        "WHITE":
        normalize_array(
            WHITE_REF
        ),

        "ORANGE":
        normalize_array(
            ORANGE_REF
        )
    }


    detected = "RED"


    minimum_distance = (
        calc_distance(
            live_norm,
            references["RED"]
        )
    )


    for name in [

        "YELLOW",

        "SKY BLUE",

        "BLUE",

        "WHITE",

        "ORANGE"

    ]:

        distance = (
            calc_distance(
                live_norm,
                references[name]
            )
        )


        if (
            distance
            <
            minimum_distance
        ):

            minimum_distance = (
                distance
            )

            detected = name


    return detected


# ============================================================
# READ AS7341
# ============================================================

def read_sensor_once():

    if sensor is None:

        return None


    try:

        # Driver method 1
        if hasattr(
            sensor,
            "read_all_channels"
        ):

            values = (
                sensor.read_all_channels()
            )


        # Driver method 2
        elif hasattr(
            sensor,
            "readAllChannels"
        ):

            values = (
                sensor.readAllChannels()
            )


        # Driver method 3
        elif hasattr(
            sensor,
            "all_channels"
        ):

            values = (
                sensor.all_channels
            )

            if callable(
                values
            ):

                values = values()


        else:

            print(
                "Unknown AS7341 driver"
            )

            return None


        values = list(
            values
        )


        # ------------------------------------------------
        # If driver returns 12 channels
        # ------------------------------------------------

        if len(values) >= 12:

            return values[:12]


        # ------------------------------------------------
        # If driver returns 10:
        # F1 F2 F3 F4 F5 F6 F7 F8 CLEAR NIR
        # ------------------------------------------------

        if len(values) == 10:

            return [

                values[0],
                values[1],
                values[2],
                values[3],

                values[8],
                values[9],

                values[4],
                values[5],
                values[6],
                values[7],

                values[8],
                values[9]
            ]


        # ------------------------------------------------
        # If driver returns only F1-F8
        # ------------------------------------------------

        if len(values) == 8:

            return [

                values[0],
                values[1],
                values[2],
                values[3],

                0,
                0,

                values[4],
                values[5],
                values[6],
                values[7],

                0,
                0
            ]


    except Exception as e:

        print(
            "AS7341 read error:",
            e
        )


    return None


# ============================================================
# AVERAGE SENSOR
# ============================================================

def read_spectrum_averaged():

    sums = [0] * 12


    for sample in range(
        NUM_SAMPLES
    ):

        values = (
            read_sensor_once()
        )


        if values is None:

            return False


        for i in range(12):

            sums[i] += int(
                values[i]
            )


        time.sleep_ms(
            5
        )


    for i in range(12):

        raw_ch[i] = (
            sums[i]
            //
            NUM_SAMPLES
        )


    return True


# ============================================================
# MAP F1-F8
# ============================================================

def map_visible_channels():

    vis[0] = raw_ch[0]

    vis[1] = raw_ch[1]

    vis[2] = raw_ch[2]

    vis[3] = raw_ch[3]

    vis[4] = raw_ch[6]

    vis[5] = raw_ch[7]

    vis[6] = raw_ch[8]

    vis[7] = raw_ch[9]


# ============================================================
# OLED GRAPH
# ============================================================

def draw_oled():

    if oled is None:

        return


    oled.fill(
        0
    )


    oled.text(
        "STAR SPECTRUM",
        10,
        0
    )


    oled.text(
        "STAR:",
        0,
        13
    )


    oled.text(
        latest_star[:11],
        38,
        13
    )


    # GRAPH AREA

    graph_x = 2

    graph_y = 27

    graph_w = 124

    graph_h = 35


    oled.rect(

        graph_x,

        graph_y,

        graph_w,

        graph_h,

        1

    )


    max_value = max(
        max(vis),
        1
    )


    previous_x = None

    previous_y = None


    for i in range(8):


        x = (

            graph_x

            +

            3

            +

            (

                i
                *
                (graph_w - 8)

                //

                7
            )
        )


        y = (

            graph_y

            +

            graph_h

            -

            3

            -

            (

                vis[i]

                *

                (graph_h - 6)

                //

                max_value
            )
        )


        oled.pixel(
            x,
            y,
            1
        )


        if previous_x is not None:

            oled.line(

                previous_x,

                previous_y,

                x,

                y,

                1

            )


        previous_x = x

        previous_y = y


    oled.show()


# ============================================================
# SERIAL OUTPUT
# ============================================================

def print_serial():

    print(
        "====== STAR SPECTRUM DATA ======"
    )


    for i in range(8):

        print(

            "F{}: {}".format(

                i + 1,

                vis[i]

            )

        )


    print(
        "Detected Color:",
        latest_color
    )


    print(
        "Mapped Star:",
        latest_star
    )


    print(
        "================================"
    )


    print()


# ============================================================
# UPDATE SENSOR
# ============================================================

def update_sensor():

    global latest_color

    global latest_star


    if read_spectrum_averaged():


        map_visible_channels()


        latest_color = (
            detect_color()
        )


        latest_star = (
            get_star_name(
                latest_color
            )
        )


    else:


        for i in range(8):

            vis[i] = 0


        latest_color = (
            "SENSOR ERROR"
        )


        latest_star = (
            "Unknown"
        )


    draw_oled()

    print_serial()


# ============================================================
# HTML PAGE
# ============================================================

HTML_PAGE = """<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1">

<title>
Star Spectrum Decoder
</title>


<style>

body {

    margin:0;

    font-family:Arial;

    background:
    linear-gradient(
        #030712,
        #0b1220
    );

    color:white;

    text-align:center;
}


h1 {

    color:#7df9ff;

    margin-top:20px;
}


#star {

    font-size:30px;

    font-weight:bold;

    color:#b6ffb0;

    margin:15px;
}


#color {

    font-size:20px;

    color:#ffd27d;

    margin-bottom:15px;
}


canvas {

    background:#07101f;

    width:92%;

    max-width:900px;

    height:320px;

    border-radius:15px;
}

</style>

</head>


<body>


<h1>
Star Spectrum Decoder
</h1>


<div id="star">
Detecting...
</div>


<div id="color">
--
</div>


<canvas
id="graph"
width="900"
height="320">
</canvas>


<script>


function updateData(){

fetch(
    "/data"
)

.then(
    response =>
    response.json()
)

.then(
    data =>
    {

        document.getElementById(
            "star"
        ).innerText =
        "Star: "
        +
        data.star;


        document.getElementById(
            "color"
        ).innerText =
        "Colour: "
        +
        data.color;


        drawGraph(
            data.spectrum
        );

    }
);

}


function drawGraph(values){


const canvas =
document.getElementById(
    "graph"
);


const ctx =
canvas.getContext(
    "2d"
);


const w =
canvas.width;


const h =
canvas.height;


ctx.clearRect(
    0,
    0,
    w,
    h
);


ctx.fillStyle =
"#07101f";


ctx.fillRect(
    0,
    0,
    w,
    h
);


const maxVal =
Math.max(
    ...values,
    1
);


let points = [];


for(
    let i=0;
    i<values.length;
    i++
){

    let x =
    50
    +
    i
    *
    (
        (w-100)
        /
        7
    );


    let y =
    h-40
    -
    (
        values[i]
        /
        maxVal
        *
        (h-90)
    );


    points.push(
        {
            x:x,
            y:y
        }
    );

}


ctx.beginPath();

ctx.strokeStyle =
"#7df9ff";

ctx.lineWidth =
3;


ctx.moveTo(
    points[0].x,
    points[0].y
);


for(
    let i=1;
    i<points.length;
    i++
){

    ctx.lineTo(
        points[i].x,
        points[i].y
    );

}


ctx.stroke();


for(
    let i=0;
    i<points.length;
    i++
){

    ctx.beginPath();

    ctx.fillStyle =
    "white";

    ctx.arc(
        points[i].x,
        points[i].y,
        4,
        0,
        Math.PI*2
    );

    ctx.fill();

}

}


setInterval(
    updateData,
    1000
);


updateData();


</script>


</body>

</html>
"""


# ============================================================
# WIFI AP
# ============================================================

def start_wifi():

    ap = network.WLAN(
        network.AP_IF
    )


    ap.active(
        False
    )


    time.sleep_ms(
        300
    )


    ap.active(
        True
    )


    ap.config(

        essid=SSID,

        password=PASSWORD

    )


    try:

        ap.ifconfig(

            (
                AP_IP,

                "255.255.255.0",

                AP_IP,

                AP_IP
            )

        )

    except:

        pass


    print(
        "WiFi started"
    )


    print(
        "SSID:",
        SSID
    )


    print(
        "Password:",
        PASSWORD
    )


    print(
        "IP:",
        AP_IP
    )


    return ap


# ============================================================
# HTTP RESPONSE
# ============================================================

def send_response(

    client,

    content,

    content_type="text/plain"

):


    if isinstance(
        content,
        str
    ):

        content = (
            content.encode()
        )


    header = (

        "HTTP/1.1 200 OK\r\n"

        "Content-Type: {}\r\n"

        "Content-Length: {}\r\n"

        "Connection: close\r\n"

        "Cache-Control: no-store\r\n"

        "\r\n"

    ).format(

        content_type,

        len(content)

    )


    client.sendall(
        header.encode()
    )


    client.sendall(
        content
    )


# ============================================================
# WEB SERVER
# ============================================================

def start_server():


    address = socket.getaddrinfo(

        "0.0.0.0",

        80

    )[0][-1]


    server = socket.socket()


    server.bind(
        address
    )


    server.listen(
        2
    )


    server.settimeout(
        0.05
    )


    print(
        "Web Server Started"
    )


    return server


# ============================================================
# HANDLE WEB REQUEST
# ============================================================

def handle_request(
    client
):


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


    if path == "/":


        send_response(

            client,

            HTML_PAGE,

            "text/html"

        )


    elif path.startswith(
        "/data"
    ):


        data = {

            "star":
            latest_star,

            "color":
            latest_color,

            "spectrum":
            vis

        }


        send_response(

            client,

            json.dumps(
                data
            ),

            "application/json"

        )


# ============================================================
# MAIN
# ============================================================

def main():


    print()

    print(
        "================================"
    )

    print(
        "STAR SPECTRUM DECODER"
    )

    print(
        "LOF TITAN ESP32-S3"
    )

    print(
        "================================"
    )


    print_i2c_summary()


    start_wifi()


    server = (
        start_server()
    )


    update_sensor()


    last_update = (
        time.ticks_ms()
    )


    while True:


        # ===============================
        # WEB REQUEST
        # ===============================

        try:


            client, addr = (
                server.accept()
            )


            try:


                client.settimeout(
                    1
                )


                handle_request(
                    client
                )


            finally:


                client.close()


        except OSError:

            pass


        # ===============================
        # SENSOR UPDATE
        # ===============================

        current = (
            time.ticks_ms()
        )


        if (

            time.ticks_diff(

                current,

                last_update

            )

            >=

            SENSOR_INTERVAL

        ):


            last_update = (
                current
            )


            update_sensor()


        time.sleep_ms(
            5
        )


# ============================================================
# RUN
# ============================================================

try:

    main()


except KeyboardInterrupt:

    print(
        "Program stopped"
    )


except Exception as e:

    print(
        "Fatal Error:",
        e
    )