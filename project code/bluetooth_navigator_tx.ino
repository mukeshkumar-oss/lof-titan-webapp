#include <Arduino.h>
#include <BLEDevice.h>

// ============================================================
// BLE UUID
// ============================================================

#define SERVICE_UUID        "d60f0001-8bcb-4d5f-9a6b-4d1e6d001001"
#define CHARACTERISTIC_UUID "d60f0002-8bcb-4d5f-9a6b-4d1e6d001002"


// ============================================================
// JOYSTICK
// ============================================================

#define JOY_X 0
#define JOY_Y 1


// ============================================================
// DIRECTION BUTTONS
// ============================================================

#define BTN_UP     5
#define BTN_DOWN   6
#define BTN_LEFT   7
#define BTN_RIGHT  10


// ============================================================
// JOYSTICK SETTINGS
// ============================================================

int centerX = 0;
int centerY = 0;

const int DEAD_ZONE = 180;
const int MAX_JOY_VALUE = 1000;


// ============================================================
// CONTROLLER PACKET
//
// MUST BE EXACTLY SAME ON RX
// ============================================================

typedef struct __attribute__((packed)) {

  bool joystickMode;

  // Calibrated signed joystick
  // -1000 to +1000
  int16_t joyX;
  int16_t joyY;

  // Flex sensors ignored
  uint16_t flex1;
  uint16_t flex2;
  uint16_t flex3;
  uint16_t flex4;

  bool up;
  bool down;
  bool left;
  bool right;

  bool joyButton;

} ControllerData;

ControllerData data;


// ============================================================
// BLE
// ============================================================

static BLEUUID serviceUUID(SERVICE_UUID);
static BLEUUID charUUID(CHARACTERISTIC_UUID);

BLEClient* pClient = nullptr;

static BLERemoteCharacteristic* pRemoteCharacteristic = nullptr;
static BLEAdvertisedDevice* myDevice = nullptr;
static BLEScan* pBLEScan = nullptr;

bool connected = false;
bool doConnect = false;
bool doScan = true;


// ============================================================
// TIMING
// ============================================================

unsigned long lastSendTime = 0;
unsigned long lastScanTime = 0;

const unsigned long SEND_INTERVAL = 50;
const unsigned long SCAN_INTERVAL = 3000;


// ============================================================
// BLE CLIENT CALLBACK
// ============================================================

class ClientCallbacks : public BLEClientCallbacks {

  void onConnect(BLEClient* client) override {

    Serial.println();
    Serial.println("========================");
    Serial.println("ROVER CONNECTED");
    Serial.println("========================");
  }


  void onDisconnect(BLEClient* client) override {

    connected = false;
    doScan = true;

    pRemoteCharacteristic = nullptr;

    Serial.println();
    Serial.println("========================");
    Serial.println("ROVER DISCONNECTED");
    Serial.println("========================");
  }
};


// ============================================================
// BLE SCAN CALLBACK
// ============================================================

class ScanCallbacks : public BLEAdvertisedDeviceCallbacks {

  void onResult(BLEAdvertisedDevice advertisedDevice) override {

    if (advertisedDevice.haveServiceUUID() &&
        advertisedDevice.isAdvertisingService(serviceUUID)) {

      Serial.println();
      Serial.println("LOF TITAN ROVER FOUND");

      pBLEScan->stop();

      if (myDevice != nullptr) {

        delete myDevice;
        myDevice = nullptr;
      }

      myDevice =
        new BLEAdvertisedDevice(advertisedDevice);

      doConnect = true;
      doScan = false;
    }
  }
};


// ============================================================
// CONNECT TO ROVER
// ============================================================

bool connectToRover() {

  if (myDevice == nullptr) {
    return false;
  }

  Serial.println();
  Serial.println("Connecting to rover...");


  if (pClient == nullptr) {

    pClient = BLEDevice::createClient();

    pClient->setClientCallbacks(
      new ClientCallbacks()
    );
  }


  if (!pClient->connect(myDevice)) {

    Serial.println("Connection failed");

    return false;
  }


  BLERemoteService* pRemoteService =
    pClient->getService(serviceUUID);


  if (pRemoteService == nullptr) {

    Serial.println("Service not found");

    pClient->disconnect();

    return false;
  }


  pRemoteCharacteristic =
    pRemoteService->getCharacteristic(charUUID);


  if (pRemoteCharacteristic == nullptr) {

    Serial.println("Characteristic not found");

    pClient->disconnect();

    return false;
  }


  if (!pRemoteCharacteristic->canWrite()) {

    Serial.println("Characteristic cannot write");

    pClient->disconnect();

    return false;
  }


  Serial.println("BLE CONTROL READY");

  return true;
}


// ============================================================
// CALIBRATE JOYSTICK
// ============================================================

void calibrateJoystick() {

  Serial.println();
  Serial.println("============================");
  Serial.println("JOYSTICK CALIBRATION");
  Serial.println("============================");

  Serial.println("KEEP JOYSTICK AT CENTER");
  Serial.println("DO NOT TOUCH JOYSTICK");

  delay(1000);


  long totalX = 0;
  long totalY = 0;

  const int samples = 100;


  for (int i = 0; i < samples; i++) {

    totalX += analogRead(JOY_X);
    totalY += analogRead(JOY_Y);

    delay(10);
  }


  centerX = totalX / samples;
  centerY = totalY / samples;


  Serial.println();
  Serial.println("CALIBRATION COMPLETE");

  Serial.print("CENTER X = ");
  Serial.println(centerX);

  Serial.print("CENTER Y = ");
  Serial.println(centerY);

  Serial.println("============================");

  delay(500);
}


// ============================================================
// PROCESS JOYSTICK AXIS
// ============================================================

int16_t processAxis(int raw, int center) {

  int diff =
    raw - center;


  // --------------------------------------------------------
  // CENTER DEAD ZONE
  // --------------------------------------------------------

  if (abs(diff) <= DEAD_ZONE) {

    return 0;
  }


  // --------------------------------------------------------
  // POSITIVE SIDE
  // --------------------------------------------------------

  if (diff > 0) {

    long value = map(
      raw,
      center + DEAD_ZONE,
      4095,
      0,
      MAX_JOY_VALUE
    );


    return constrain(
      value,
      0,
      MAX_JOY_VALUE
    );
  }


  // --------------------------------------------------------
  // NEGATIVE SIDE
  // --------------------------------------------------------

  long value = map(
    raw,
    center - DEAD_ZONE,
    0,
    0,
    -MAX_JOY_VALUE
  );


  return constrain(
    value,
    -MAX_JOY_VALUE,
    0
  );
}


// ============================================================
// READ CONTROLLER
// ============================================================

void readController() {

  int rawX =
    analogRead(JOY_X);

  int rawY =
    analogRead(JOY_Y);


  // ========================================================
  // CONFIRMED JOYSTICK ORIENTATION
  //
  // X MUST BE REVERSED
  // Y MUST NOT BE REVERSED
  //
  // RIGHT    = +X
  // LEFT     = -X
  //
  // FORWARD  = +Y
  // BACKWARD = -Y
  // ========================================================

  data.joyX =
    -processAxis(
      rawX,
      centerX
    );


  data.joyY =
    processAxis(
      rawY,
      centerY
    );


  // ========================================================
  // FLEX COMPLETELY IGNORED
  // ========================================================

  data.flex1 = 0;
  data.flex2 = 0;
  data.flex3 = 0;
  data.flex4 = 0;


  // ========================================================
  // JOYSTICK MODE ALWAYS ENABLED
  // ========================================================

  data.joystickMode = true;


  // ========================================================
  // DIRECTION BUTTONS
  // ========================================================

  data.up =
    !digitalRead(BTN_UP);

  data.down =
    !digitalRead(BTN_DOWN);

  data.left =
    !digitalRead(BTN_LEFT);

  data.right =
    !digitalRead(BTN_RIGHT);


  // Joystick button currently ignored
  data.joyButton = false;
}


// ============================================================
// PRINT CONTROLLER
// ============================================================

void printController() {

  Serial.print("TX | X=");

  if (data.joyX > 0) {
    Serial.print("+");
  }

  Serial.print(data.joyX);


  Serial.print(" Y=");

  if (data.joyY > 0) {
    Serial.print("+");
  }

  Serial.print(data.joyY);


  Serial.print(" | ");


  // ========================================================
  // DIRECTION
  // ========================================================

  if (data.up) {

    Serial.print("BUTTON FORWARD");
  }

  else if (data.down) {

    Serial.print("BUTTON BACKWARD");
  }

  else if (data.left) {

    Serial.print("BUTTON LEFT");
  }

  else if (data.right) {

    Serial.print("BUTTON RIGHT");
  }

  else if (data.joyX == 0 &&
           data.joyY == 0) {

    Serial.print("CENTER");
  }

  else if (abs(data.joyY) >
           abs(data.joyX)) {

    if (data.joyY > 0) {

      Serial.print("FORWARD");

    } else {

      Serial.print("BACKWARD");
    }
  }

  else {

    if (data.joyX > 0) {

      Serial.print("RIGHT");

    } else {

      Serial.print("LEFT");
    }
  }


  Serial.print(" | BLE=");

  Serial.println(
    connected ?
    "CONNECTED" :
    "DISCONNECTED"
  );
}


// ============================================================
// SEND DATA
// ============================================================

void sendData() {

  if (!connected) {
    return;
  }


  if (pRemoteCharacteristic == nullptr) {
    return;
  }


  pRemoteCharacteristic->writeValue(
    (uint8_t*)&data,
    sizeof(data),
    false
  );
}


// ============================================================
// SETUP
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(2000);


  Serial.println();
  Serial.println("============================");
  Serial.println("ESP32-C3 BLE CONTROLLER");
  Serial.println("============================");


  // ========================================================
  // BUTTONS
  // ========================================================

  pinMode(
    BTN_UP,
    INPUT_PULLUP
  );

  pinMode(
    BTN_DOWN,
    INPUT_PULLUP
  );

  pinMode(
    BTN_LEFT,
    INPUT_PULLUP
  );

  pinMode(
    BTN_RIGHT,
    INPUT_PULLUP
  );


  // ========================================================
  // ADC
  // ========================================================

  analogReadResolution(12);


  // ========================================================
  // CALIBRATE BEFORE BLE STARTS
  // ========================================================

  calibrateJoystick();


  // ========================================================
  // BLE
  // ========================================================

  BLEDevice::init(
    "ESP32C3_JOYSTICK"
  );


  pBLEScan =
    BLEDevice::getScan();


  pBLEScan->setAdvertisedDeviceCallbacks(
    new ScanCallbacks()
  );


  pBLEScan->setInterval(1349);
  pBLEScan->setWindow(449);

  pBLEScan->setActiveScan(true);


  Serial.println();
  Serial.println(
    "Scanning for LOF Titan Rover..."
  );


  pBLEScan->start(
    5,
    false
  );


  lastScanTime =
    millis();
}


// ============================================================
// LOOP
// ============================================================

void loop() {

  unsigned long now =
    millis();


  // ========================================================
  // CONNECT
  // ========================================================

  if (doConnect) {

    if (connectToRover()) {

      connected = true;
      doScan = false;

      Serial.println();
      Serial.println("CONTROLLER READY");

    } else {

      connected = false;
      doScan = true;

      Serial.println(
        "Will scan again..."
      );
    }


    doConnect = false;
  }


  // ========================================================
  // SCAN AGAIN
  // ========================================================

  if (!connected &&
      doScan &&
      now - lastScanTime >= SCAN_INTERVAL) {

    lastScanTime = now;


    Serial.println();
    Serial.println("Scanning again...");


    pBLEScan->clearResults();


    pBLEScan->start(
      3,
      false
    );
  }


  // ========================================================
  // READ + SEND
  // ========================================================

  if (now - lastSendTime >= SEND_INTERVAL) {

    lastSendTime = now;


    readController();

    printController();

    sendData();
  }
}
