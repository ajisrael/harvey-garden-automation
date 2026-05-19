String token = "";

void setToken(String loginResponse) {
  StaticJsonDocument<jsonDocSize> respObj;
  DeserializationError error = deserializeJson(respObj, loginResponse);

  if (error) {
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return;
  }

  const char* tokenBuf = respObj["token"];
  String tokenTemp = tokenBuf;

  token = "Bearer " + tokenTemp;

  Serial.print("Token Set: ");
  Serial.println(token);
}

void logHttpResponse(String requestType, String requestPath, int responseCode, String payload) {
  Serial.print("HTTP Request to   : ");
  Serial.println(requestType + " " + requestPath);

  if (responseCode > 0) {
    Serial.print("HTTP Response Code: ");
    Serial.println(responseCode);
    Serial.print("HTTP Response Body: ");
    Serial.println(payload);
  }
  else {
    Serial.print("Error code: ");
    Serial.println(responseCode);
  }
}

String httpGETRequest(String requestPath) {
  WiFiClient client;
  HTTPClient http;

  http.begin(client, requestPath.c_str());

  http.addHeader("Authorization", token);
  
  int respCode = http.GET();

  String payload = "{}";

  if (respCode > 0) {
    payload = http.getString();
  }

  http.end();

  logHttpResponse("GET", requestPath, respCode, payload);

  return payload;
}

String httpPOSTRequest(String requestPath, String body) {
  HTTPClient http;

  http.begin(requestPath.c_str());

  http.addHeader("Authorization", token);
  http.addHeader("Content-Type", "application/json");

  int respCode = http.POST(body);

  String payload = "{}";

  if (respCode > 0) {
    payload = http.getString();
  }

  http.end();

  logHttpResponse("POST", requestPath, respCode, payload);

  return payload;
}
