# Harvey Garden Automation

A monorepo for Harvey — an automated garden irrigation and monitoring system built around ESP32 nodes, a Node.js backend API, and a web frontend.

## What It Does

ESP32 microcontrollers monitor garden bed conditions (soil moisture, temperature, humidity, light) and report telemetry to the backend API. The backend uses that data to automatically control irrigation — activating solenoid valves and pumps when moisture drops below a threshold and shutting them off when the soil is sufficiently watered.

## Repository Structure

```
harvey-garden-automation/
├── frontend/        # Web frontend
├── backend/         # Node.js/Express REST API
├── nodes/           # ESP32 firmware and supporting tooling
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) 20+ (for local backend development)
- [PlatformIO](https://platformio.org/) (for ESP32 firmware — or use the Docker build)

### Environment Setup

Run the setup script to copy example environment files:

```bash
scripts/setup.sh
```

Then edit the generated `.env` files and `nodes/esp32/include/LocalConfig.h` with your actual values before starting any services.

## Services

| Service | Description | Default Port |
|---------|-------------|-------------|
| frontend | UI for configuration, monitoring, and manual control | 3000 |
| backend | REST API for telemetry, irrigation control, and node configuration | 5000 |
| nodes | ESP32 firmware for reading sensors and controlling actuators| - |

## Backend API

Base path: `/api/v1`

| Route | Purpose |
|-------|---------|
| `POST /users/login` | Authenticate and receive a JWT |
| `GET /node/:nodeId/config` | Fetch node configuration (delays, settings) |
| `POST /gardenBed/data` | Submit garden bed telemetry |
| `GET /gardenBed/data` | Retrieve stored telemetry |
| `GET /gardenStatus` | Get current garden status |
| `GET/POST /pumpState` | Read or update pump state |
| `GET/POST /solenoidState` | Read or update solenoid state |
| `GET/POST /actions` | Read or record irrigation actions |

All routes except login require `Authorization: Bearer <token>`.

## ESP32 Nodes

Firmware lives in `nodes/garden-bed/`. Each node:

1. Connects to WiFi and authenticates with the backend
2. Polls the backend for its configuration (call intervals, etc.)
3. Reads sensors and posts telemetry for each connected garden bed on a configurable interval

## Testing

```bash
# Backend unit and integration tests (local)
cd backend && npm test
```
