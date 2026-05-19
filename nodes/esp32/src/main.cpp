#include <Arduino.h>
#include <WiFi.h>
#include "LocalConfig.h"
#include "GardenNode.h"

const String bedIds[] = { "Bed_0", "Bed_1" };
GardenNode node("ESP32_01", bedIds, 2, serverName, loginEmail, loginPassword);

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, wifiPassword);
    while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
    Serial.println("\nConnected");
    node.begin();
}

void loop() {
    node.loop();
}
