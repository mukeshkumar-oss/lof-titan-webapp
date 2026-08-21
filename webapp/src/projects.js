export const projects = [
  {
    id: 'invisible-line',
    name: 'Invisible Line Patrol',
    category: 'Autonomous DIY Walking Kit',
    badge: 'DIY Walking Robot',
    rating: 4.9,
    reviews: 128,
    duration: '45 Mins',
    difficulty: 'Intermediate',
    age: '10+',
    heroImage: '/assets/invisible-line/invisible_line_main.png',
    thumbnail: '/assets/invisible-line/invisible_line_main.png',
    tagline: 'UV Light Following 4-Bar Linkage 8-Leg Walking Robot',
    description: 'Going to build Invisible Line Patrol rover that detects UV light and follows it. It does not have wheels—it walks with a 4-bar linkage mechanism with a total of 8 mechanical legs.',
    
    // 2. Product Safety Warnings
    safetyWarnings: {
      hardware: [
        '⚠️ Keep fingers and loose objects clear of the 4-bar leg linkages and gearboxes while motors are active to avoid pinch hazards.',
        '⚠️ Ensure all screws and mechanical pivot joints are securely fastened before running walking sequences on rough or elevated surfaces.',
        '⚠️ Always place the robot on a flat, non-slip floor or test track during calibration.'
      ],
      electronics: [
        '⚡ Never short-circuit battery power leads or motor terminals. Use the dedicated battery port on LOF TITAN.',
        '⚡ Double-check sensor wiring polarity (GND, VCC, Signal) for S1 (GPIO 2), S2 (GPIO 1), and S3 (GPIO 3) before powering on.',
        '🔦 UV Light Safety: Do not look directly into high-intensity UV lamps or shine UV light into eyes. Always direct UV pens downwards onto the track.'
      ]
    },

    // 3. Product Requirements (BOM)
    requirements: [
      { name: 'UV Photodiode Sensors', qty: '3 Units', desc: 'Analog UV spectrum photodiodes connected to S1 (GPIO 2), S2 (GPIO 1), and S3 (GPIO 3)', icon: 'Sun' },
      { name: 'High-Torque DC Geared Motors', qty: '2 Units', desc: 'Dual H-bridge drive channels M1 (Left) & M2 (Right) for driving 8 walking legs', icon: 'Cpu' },
      { name: 'LOF TITAN ESP32-S3 Board', qty: '1 Unit', desc: 'Dual-core MCU with built-in Web Bluetooth supervisor & motor controllers', icon: 'CircuitBoard' },
      { name: '4-Bar Linkage Walking Chassis', qty: '1 Kit', desc: 'Precision mechanical crank system driving 4 left legs and 4 right legs', icon: 'Footprints' },
      { name: 'Rechargeable Battery Pack', qty: '1 Pack', desc: 'High-current 2S Li-ion / LiPo battery power supply for rover mobility', icon: 'BatteryCharging' },
      { name: 'Ultraviolet (UV) Light Pen / Lamp', qty: '1 Unit', desc: 'UV source to draw invisible paths or guide the robot live in real time', icon: 'Zap' }
    ],

    // 4. Components Introduction & Interactive Labs
    components: [
      {
        id: 'uv-sensor',
        name: 'UV Light Sensor (Photodiode Module)',
        image: '/assets/invisible-line/uv_sensor.png',
        whatIsIt: 'The UV sensor is a specialized optical sensor that measures ultraviolet radiation (wavelengths between 200nm and 370nm), which is invisible to the human eye.',
        howItWorks: 'When ultraviolet photons hit the photodiode, it generates a proportional micro-current. The onboard amplifier converts this into an analog voltage reading (0 to 4095) read by the ESP32-S3 ADC.',
        pinMapping: 'Left: GPIO 2 (S1) | Center: GPIO 1 (S2) | Right: GPIO 3 (S3)',
        experiment: {
          title: 'Live UV Sensor Calibration Experiment',
          instruction: '1. Connect the UV sensor to port S1 (GPIO 2).\n2. Upload the test script below.\n3. Open the Serial Monitor.\n4. Shine a UV light pen onto the sensor vs. normal room light and observe how readings jump from ~150 to ~3800 ADC units!',
          testCode: `# ================= LOF TITAN UV SENSOR TEST =================
import time
from machine import Pin, ADC
from supervisor.led_buzzer import hw

# Setup 12-bit ADC on Sensor S1 (GPIO 2), S2 (GPIO 1), S3 (GPIO 3)
uv_left   = ADC(Pin(2), atten=ADC.ATTN_11DB)
uv_center = ADC(Pin(1), atten=ADC.ATTN_11DB)
uv_right  = ADC(Pin(3), atten=ADC.ATTN_11DB)

print("--- LOF TITAN UV SENSOR EXPERIMENT ---")
print("Shine UV light on sensors to see real-time ADC response!")
hw.play_startup_tone()

while True:
    val_l = uv_left.read()
    val_c = uv_center.read()
    val_r = uv_right.read()
    
    print(f"UV [Left: {val_l:4d} | Center: {val_c:4d} | Right: {val_r:4d}]")
    time.sleep_ms(150)
`
        }
      },
      {
        id: 'dc-motor',
        name: 'Dual DC Motors & 4-Bar Walking Kinematics',
        image: '/assets/invisible-line/dc_motor.png',
        whatIsIt: 'DC geared motors convert electrical energy into mechanical rotational torque. Instead of circular wheels, the output shafts drive 4-bar linkage cranks that mimic quadruped biological walking strides with 8 legs.',
        howItWorks: 'LOF TITAN controls motor speed with PWM (Pulse Width Modulation) and direction with dual H-bridge driver outputs (M1: GPIO 15/16, M2: GPIO 13/14). Differential steering allows the robot to turn by running one motor faster than the other.',
        pinMapping: 'Left Motor M1: GPIO 15, 16 | Right Motor M2: GPIO 13, 14',
        experiment: {
          title: 'Motor Speed & Direction Kinematics Lab',
          instruction: 'Modify the motor speed blocks below (0% to 100%) and direction (Forward vs Backward) to test how the 4-bar walking legs oscillate and propel the robot forward and pivot-turn!',
          testCode: `# ================= LOF TITAN MOTOR KINEMATICS TEST =================
import time
from machine import Pin, PWM
from supervisor.led_buzzer import hw

_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def set_motors(m1_speed, m2_speed, dir_fwd=True):
    # Left Motor M1
    duty1 = int(abs(m1_speed) * 10.23)
    if dir_fwd:
        _get_pwm(15).duty(duty1); Pin(16, Pin.OUT).value(0)
    else:
        Pin(15, Pin.OUT).value(0); _get_pwm(16).duty(duty1)
        
    # Right Motor M2
    duty2 = int(abs(m2_speed) * 10.23)
    if dir_fwd:
        _get_pwm(13).duty(duty2); Pin(14, Pin.OUT).value(0)
    else:
        Pin(13, Pin.OUT).value(0); _get_pwm(14).duty(duty2)

print("Starting 4-Bar 8-Leg Kinematics Test...")
hw.play_startup_tone()

# 1. Walk Forward (80% Speed) for 2 seconds
print("Walking Forward...")
set_motors(80, 80, dir_fwd=True)
time.sleep(2)

# 2. Pivot Turn Right (M1 Forward, M2 Stop) for 1.5 seconds
print("Turning Right...")
set_motors(80, 0, dir_fwd=True)
time.sleep(1.5)

# 3. Stop Motors
set_motors(0, 0)
hw.play_confirmation_tone()
print("Kinematics Test Complete.")
`
        }
      }
    ],

    // 5. Assembly Steps
    assembly: [
      { step: 1, title: 'Assemble 4-Bar Walking Linkage', desc: 'Connect the primary drive cranks to the 4 mechanical leg linkages on the left side and 4 on the right side using M3 pivot pins.' },
      { step: 2, title: 'Install Dual DC Geared Motors', desc: 'Mount motor M1 into the left chassis bracket and motor M2 into the right bracket. Ensure gear meshing is smooth.' },
      { step: 3, title: 'Mount 3x UV Sensor Array', desc: 'Secure S1 (Left), S2 (Center), and S3 (Right) on the forward sensor bracket angled 45 degrees towards the floor.' },
      { step: 4, title: 'Connect to LOF TITAN Controller', desc: 'Plug S1 to GPIO 2, S2 to GPIO 1, S3 to GPIO 3, M1 to pins 15/16, M2 to pins 13/14, and connect the battery power harness.' }
    ],

    // 7. Built-in Coding Challenges
    challenges: [
      {
        id: 'challenge-1',
        title: 'Challenge 1: UV Light Seeker',
        level: 'Easy',
        goal: 'Program the robot to stand still when no UV light is present, and walk forward when the center UV sensor reads above 1500 ADC units.',
        hint: 'Use an [If Center UV > 1500] condition block wrapping [Motor Dual Drive Forward 80%].'
      },
      {
        id: 'challenge-2',
        title: 'Challenge 2: Autonomous 3-Way UV Navigator',
        level: 'Intermediate',
        goal: 'Implement differential steering: If Left UV is highest, turn left. If Right UV is highest, turn right. If Center is highest, march straight.',
        hint: 'Compare (UV_Left > UV_Center) and (UV_Right > UV_Center) to trigger turn maneuvers.'
      },
      {
        id: 'challenge-3',
        title: 'Challenge 3: OLED UV Radar Dashboard',
        level: 'Advanced',
        goal: 'Display real-time numerical readings and horizontal progress bars for all 3 UV sensors on the 1.3-inch OLED screen.',
        hint: 'Use the [OLED print] blocks and [OLED clear screen] inside a 100ms refresh loop.'
      }
    ],

    // 8. FAQ
    faq: [
      { q: 'Why is the robot turning opposite to the UV light direction?', a: 'Check your Left and Right sensor cables. S1 (GPIO 2) should be on the robot’s left and S3 (GPIO 3) on the right. Alternatively, swap motor channel wires.' },
      { q: 'The 8 walking legs are slipping on the surface?', a: 'Make sure you are testing on a matte or textured surface (like rubber mat, cardboard, or foam). Add small silicone foot pads to the leg tips for enhanced grip.' },
      { q: 'How do I adjust sensor sensitivity for different room lighting?', a: 'You can adjust the BASE_UV_THRESHOLD in the code or modify the comparison number block in Blockly from 800 to 1800 depending on ambient light.' }
    ],

    // 6. Complete Firmware Script
    code: `"""
# ==============================================================================
# LOF TITAN — INVISIBLE LINE PATROL (UV 4-BAR 8-LEG WALKING ROBOT)
# ==============================================================================
# Features:
# - Autonomous 3-Sensor UV Line Tracking & Light Following
# - 4-Bar Linkage 8-Leg Walking Kinematics (Dual DC Motors M1 & M2)
# - Embedded WiFi SoftAP Web Dashboard with Live Telemetry
# ==============================================================================
"""

import time
import socket
import select
import network
import gc
from machine import Pin, PWM, ADC
from supervisor.led_buzzer import hw

# ================= MOTOR PIN DEFINITIONS =================
# Left Motor M1 (GPIO 15, 16)
# Right Motor M2 (GPIO 13, 14)
_pwm_pool = {}
def _get_pwm(pin, freq=1000):
    if pin not in _pwm_pool:
        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)
    else:
        try: _pwm_pool[pin].freq(freq)
        except Exception: pass
    return _pwm_pool[pin]

def drive_rover(left_speed, right_speed):
    # Left Motor M1
    d1 = int(min(100, max(0, abs(left_speed))) * 10.23)
    if left_speed >= 0:
        _get_pwm(15, 5000).duty(d1); Pin(16, Pin.OUT).value(0)
    else:
        Pin(15, Pin.OUT).value(0); _get_pwm(16, 5000).duty(d1)
        
    # Right Motor M2
    d2 = int(min(100, max(0, abs(right_speed))) * 10.23)
    if right_speed >= 0:
        _get_pwm(13, 5000).duty(d2); Pin(14, Pin.OUT).value(0)
    else:
        Pin(13, Pin.OUT).value(0); _get_pwm(14, 5000).duty(d2)

def stop_rover():
    drive_rover(0, 0)
    try:
        _get_pwm(15).duty(0); Pin(16, Pin.OUT).value(0)
        _get_pwm(13).duty(0); Pin(14, Pin.OUT).value(0)
    except Exception: pass

# ================= UV SENSORS (12-BIT ADC) =================
# S1 (Left): GPIO 2 | S2 (Center): GPIO 1 | S3 (Right): GPIO 3
uv_left   = ADC(Pin(2), atten=ADC.ATTN_11DB)
uv_center = ADC(Pin(1), atten=ADC.ATTN_11DB)
uv_right  = ADC(Pin(3), atten=ADC.ATTN_11DB)

def read_uv_sensors():
    return uv_left.read(), uv_center.read(), uv_right.read()

# ================= MAIN AUTONOMOUS CONTROLLER =================
def main():
    hw.play_startup_tone()
    print("=" * 55)
    print("LOF TITAN: INVISIBLE LINE PATROL ONLINE")
    print("UV 4-Bar 8-Leg Walking Kinematics Ready")
    print("=" * 55)
    
    BASE_SPEED = 85
    TURN_SPEED = 65
    UV_THRESHOLD = 800  # Minimum UV delta to trigger active track
    
    while True:
        s_left, s_center, s_right = read_uv_sensors()
        
        # Determine tracking action based on strongest UV photon reading
        if s_center > s_left and s_center > s_right and s_center > UV_THRESHOLD:
            # Center track locked -> March forward
            drive_rover(BASE_SPEED, BASE_SPEED)
            Pin(47, Pin.OUT).value(0); Pin(48, Pin.OUT).value(1) # Green LED ON
        elif s_left > s_right and s_left > UV_THRESHOLD:
            # UV on left -> Pivot left
            drive_rover(-TURN_SPEED, TURN_SPEED)
            Pin(47, Pin.OUT).value(1); Pin(48, Pin.OUT).value(0) # Red LED ON
        elif s_right > s_left and s_right > UV_THRESHOLD:
            # UV on right -> Pivot right
            drive_rover(TURN_SPEED, -TURN_SPEED)
            Pin(47, Pin.OUT).value(1); Pin(48, Pin.OUT).value(1) # Both LEDs ON
        else:
            # No UV light detected -> Standby
            stop_rover()
            Pin(47, Pin.OUT).value(0); Pin(48, Pin.OUT).value(0)
            
        time.sleep_ms(20)  # Smooth 50Hz control loop with CPU safety yield

if __name__ == '__main__':
    main()
`
  }
];
