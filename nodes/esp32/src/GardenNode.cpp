#include "GardenNode.h"

static const int JSON_DOC_SIZE = 300;

GardenNode::GardenNode(const String& nodeId, const String bedIds[], int bedCount,
                       const String& serverName, const String& loginEmail, const String& loginPassword)
    : _nodeId(nodeId),
      _bedIds(bedIds),
      _bedCount(bedCount),
      _serverName(serverName),
      _loginEmail(loginEmail),
      _loginPassword(loginPassword),
      _token(""),
      _lastLoginTime(0),
      _lastConfigUpdateTime(0),
      _lastApiCallTime(0),
      _loginDelay(86400000UL),
      _configUpdateDelay(3600000UL),
      _apiCallDelay(60000UL)
{}

void GardenNode::begin() {
    login();
    fetchConfig();
}

void GardenNode::loop() {
    if ((millis() - _lastLoginTime) > _loginDelay) {
        login();
        _lastLoginTime = millis();
    }

    if ((millis() - _lastConfigUpdateTime) > _configUpdateDelay) {
        fetchConfig();
        _lastConfigUpdateTime = millis();
    }

    if ((millis() - _lastApiCallTime) > _apiCallDelay) {
        for (int i = 0; i < _bedCount; i++) {
            sendTelemetry(_bedIds[i]);
        }
        _lastApiCallTime = millis();
    }
}

void GardenNode::login() {
    String path = _serverName + "/api/v1/users/login";

    StaticJsonDocument<JSON_DOC_SIZE> doc;
    doc["email"] = _loginEmail;
    doc["password"] = _loginPassword;

    String body;
    serializeJson(doc, body);

    String response = httpPOST(path, body);

    StaticJsonDocument<JSON_DOC_SIZE> respDoc;
    DeserializationError error = deserializeJson(respDoc, response);
    if (error) {
        Serial.print(F("login deserializeJson failed: "));
        Serial.println(error.f_str());
        return;
    }

    const char* tokenBuf = respDoc["token"];
    _token = String("Bearer ") + tokenBuf;
    Serial.print("Token Set: ");
    Serial.println(_token);
}

void GardenNode::fetchConfig() {
    String path = _serverName + "/api/v1/node/" + _nodeId + "/config";
    String payload = httpGET(path);

    StaticJsonDocument<JSON_DOC_SIZE> doc;
    DeserializationError error = deserializeJson(doc, payload);
    if (error) {
        Serial.print(F("fetchConfig deserializeJson failed: "));
        Serial.println(error.f_str());
        return;
    }

    if (doc["loginDelay"] && _loginDelay != (unsigned long)doc["loginDelay"]) {
        _loginDelay = doc["loginDelay"];
        Serial.print("loginDelay updated to: ");
        Serial.println(_loginDelay);
    }
    if (doc["configUpdateDelay"] && _configUpdateDelay != (unsigned long)doc["configUpdateDelay"]) {
        _configUpdateDelay = doc["configUpdateDelay"];
        Serial.print("configUpdateDelay updated to: ");
        Serial.println(_configUpdateDelay);
    }
    if (doc["apiCallDelay"] && _apiCallDelay != (unsigned long)doc["apiCallDelay"]) {
        _apiCallDelay = doc["apiCallDelay"];
        Serial.print("apiCallDelay updated to: ");
        Serial.println(_apiCallDelay);
    }
}

void GardenNode::sendTelemetry(const String& bedId) {
    String path = _serverName + "/api/v1/gardenBed/data";

    StaticJsonDocument<JSON_DOC_SIZE> doc;
    doc["bedId"] = bedId;
    doc["airTemp"] = 34;
    doc["soilTemp"] = 38;
    doc["light"] = 0.50;
    doc["moisture"] = 0.45;
    doc["humidity"] = 0.60;

    String body;
    serializeJson(doc, body);

    httpPOST(path, body);
}

String GardenNode::httpGET(const String& path) {
    WiFiClient client;
    HTTPClient http;

    http.begin(client, path.c_str());
    http.addHeader("Authorization", _token);

    int code = http.GET();
    String payload = "{}";
    if (code > 0) {
        payload = http.getString();
    }
    http.end();

    Serial.print("HTTP Request to   : GET ");
    Serial.println(path);
    Serial.print("HTTP Response Code: ");
    Serial.println(code);

    return payload;
}

String GardenNode::httpPOST(const String& path, const String& body) {
    HTTPClient http;

    http.begin(path.c_str());
    http.addHeader("Authorization", _token);
    http.addHeader("Content-Type", "application/json");

    int code = http.POST(body);
    String payload = "{}";
    if (code > 0) {
        payload = http.getString();
    }
    http.end();

    Serial.print("HTTP Request to   : POST ");
    Serial.println(path);
    Serial.print("HTTP Response Code: ");
    Serial.println(code);

    return payload;
}
