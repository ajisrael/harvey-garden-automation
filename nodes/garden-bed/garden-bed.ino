
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define CONNECTED_BED_COUNT 2

const int jsonDocSize = 300;       // size of static JSON document
const String nodeId = "ESP32_01";  // ID of Harvey node
const String bedIds[CONNECTED_BED_COUNT] = { "Bed_0", "Bed_1" };

unsigned long lastLoginTime = 0;     // Holds value for millis() for timing login API calls
unsigned long loginDelay = 86400000; // Delay between login calls

unsigned long lastConfigUpdateTime = 0;    // Holds value for millis() for timing config update API calls
unsigned long configUpdateDelay = 3600000; // Delay between config update calls

unsigned long lastApiCallTime = 0;   // Holds value for millis() for timing other API calls
unsigned long apiCallDelay = 60000;  // Delay between calls to API

#include "LocalConfig.h"
#include "HttpHelper.h"
#include "NodeConfigHelper.h"

void setup() {
  Serial.begin(115200);
  connectToNetwork();
  if (WiFi.status() == WL_CONNECTED) {
    login();
    getHarveyNodeConfig();
  }
}

void loop() {
  if ((millis() - lastLoginTime) > loginDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      login();
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastLoginTime = millis();
  }

  if ((millis() - lastConfigUpdateTime) > configUpdateDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      getHarveyNodeConfig();
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastConfigUpdateTime = millis();
  }

  if ((millis() - lastApiCallTime) > apiCallDelay) {
    if (WiFi.status() == WL_CONNECTED) {
      for (int i = 0; i < CONNECTED_BED_COUNT; i++) {
        sendGardenBedData(bedIds[i]);
      }
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastApiCallTime = millis();
  }
}

void connectToNetwork() {
  const int connectionDelay = 500;   // Delay for output when connecting to wifi

  WiFi.begin(ssid, wifiPassword);

  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(connectionDelay);
    Serial.print(".");
  }
  Serial.println("");

  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
}

void login() {
  String currentPath = serverName + "/api/v1/users/login";

  StaticJsonDocument<jsonDocSize> doc;
  doc["email"] = loginEmail;
  doc["password"] = loginPassword;

  String requestBody;
  serializeJson(doc, requestBody);

  String response = httpPOSTRequest(currentPath, requestBody);

  setToken(response);
}

void sendGardenBedData(String bedId) {
  String currentPath = serverName + "/api/v1/gardenBed/data";

  StaticJsonDocument<jsonDocSize> doc;

  doc["bedId"] = bedId;
  doc["airTemp"] = 34;
  doc["soilTemp"] = 38;
  doc["light"] = 0.50;
  doc["moisture"] = 0.45;
  doc["humidity"] = 0.60;

  String requestBody;
  serializeJson(doc, requestBody);

  String response = httpPOSTRequest(currentPath, requestBody);
}
