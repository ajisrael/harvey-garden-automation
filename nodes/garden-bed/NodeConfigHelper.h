void updateLoginDelay(StaticJsonDocument<jsonDocSize> doc) {
  if (!doc["loginDelay"]) {
    Serial.println("No loginDelay configuration found");
    return;
  }

  if (loginDelay != doc["loginDelay"]) {
    loginDelay = doc["loginDelay"];
    Serial.print("loginDelay updated to: ");
    Serial.println(loginDelay);
  }
}

void updateConfigUpdateDelay(StaticJsonDocument<jsonDocSize> doc) {
  if (!doc["configUpdateDelay"]) {
    Serial.println("No configUpdateDelay configuration found");
    return;
  }

  if (configUpdateDelay != doc["configUpdateDelay"]) {
    configUpdateDelay = doc["configUpdateDelay"];
    Serial.print("configUpdateDelay updated to: ");
    Serial.println(configUpdateDelay);
  }
}

void updateApiCallDelay(StaticJsonDocument<jsonDocSize> doc) {
  if (!doc["apiCallDelay"]) {
    Serial.println("No apiCallDelay configuration found");
    return;
  }

  if (apiCallDelay != doc["apiCallDelay"]) {
    apiCallDelay = doc["apiCallDelay"];
    Serial.print("apiCallDelay updated to: ");
    Serial.println(apiCallDelay);
  }
}

void getHarveyNodeConfig() {
  String currentPath = serverName + "/api/v1/node/" + nodeId + "/config";

  String payload = httpGETRequest(currentPath);

  StaticJsonDocument<jsonDocSize> doc;
  DeserializationError error = deserializeJson(doc, payload);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  updateLoginDelay(doc);
  updateConfigUpdateDelay(doc);
  updateApiCallDelay(doc);
}
