# Flashing Guide

End-to-end guide: compile firmware → connect device → flash → monitor serial output.

## Prerequisites

- USB cable (data-capable, not charge-only)
- ESP32 dev board (e.g., ESP32-WROOM-32)
- PlatformIO CLI installed locally **or** Docker (see Step 2)
- Backend running (locally or on your network)

## Step 1: Configure LocalConfig.h

`nodes/esp32/include/LocalConfig.h` is gitignored and must be created manually before compiling.

```bash
cp nodes/esp32/include/LocalConfig.h.example nodes/esp32/include/LocalConfig.h
```

Edit `nodes/esp32/include/LocalConfig.h` and fill in your values:

| Field | Description |
|---|---|
| `ssid` | WiFi network name |
| `wifiPassword` | WiFi password |
| `serverName` | Backend URL, e.g. `http://192.168.1.100:5000` |
| `loginEmail` | Email of the node user in the backend DB |
| `loginPassword` | Password of that user |

## Step 2: Compile the Firmware

**Method A — Local PlatformIO:**

```bash
cd nodes/esp32
pio run
```

**Method B — Docker (no local install required):**

```bash
docker build -t harvey-esp32-build nodes/esp32/
docker run --rm -v $(pwd)/nodes/esp32:/workspace harvey-esp32-build pio run
```

> **Note:** Flashing requires direct USB device access. The Docker method compiles only — use Method A or `esptool.py` directly to flash to a device.

The compiled binary will be at `nodes/esp32/.pio/build/esp32dev/firmware.bin`.

## Step 3: Flash to Device

Connect the ESP32 via USB, then:

```bash
cd nodes/esp32
pio run --target upload
```

To specify the port explicitly (use if auto-detection fails):

```bash
pio run --target upload --upload-port /dev/cu.usbserial-XXXX
```

Finding the device port:

- **macOS:** `ls /dev/cu.*`
- **Linux:** `ls /dev/ttyUSB*`

## Step 4: Monitor Serial Output

```bash
pio device monitor --baud 115200
```

What to look for on a successful boot:

- `Connecting` then `Connected to WiFi network with IP Address: ...`
- `Token Set: Bearer ...` — login succeeded
- `HTTP Response Code: 200` — telemetry POSTs are reaching the backend

## Step 5: Validate in Backend

Query the backend to confirm telemetry is being received:

```bash
curl http://<your-backend-url>:5000/api/v1/gardenBed/data \
  -H "Authorization: Bearer <your-token>"
```

Replace `<your-backend-url>` with the backend host and `<your-token>` with the token from the login response.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| WiFi not connecting | Wrong SSID or password | Check `ssid` and `wifiPassword` in `LocalConfig.h` |
| `HTTP Error -1` | Backend unreachable | Verify `serverName` URL; confirm backend is running and reachable from the ESP32's network |
| `Token Set:` never appears | Bad credentials or missing user | Check `loginEmail`/`loginPassword`; verify the user exists in the backend DB |
| Compile error: `LocalConfig.h not found` | File not created | Run the `cp` command in Step 1 |
