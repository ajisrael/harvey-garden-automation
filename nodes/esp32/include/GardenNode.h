#pragma once
#include <Arduino.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

class GardenNode {
public:
    GardenNode(const String& nodeId, const String bedIds[], int bedCount,
               const String& serverName, const String& loginEmail, const String& loginPassword);

    void begin();
    void loop();

private:
    String _nodeId;
    const String* _bedIds;
    int _bedCount;
    String _serverName;
    String _loginEmail;
    String _loginPassword;
    String _token;

    unsigned long _lastLoginTime;
    unsigned long _lastConfigUpdateTime;
    unsigned long _lastApiCallTime;

    unsigned long _loginDelay;
    unsigned long _configUpdateDelay;
    unsigned long _apiCallDelay;

    void login();
    void fetchConfig();
    void sendTelemetry(const String& bedId);
    String httpGET(const String& path);
    String httpPOST(const String& path, const String& body);
};
