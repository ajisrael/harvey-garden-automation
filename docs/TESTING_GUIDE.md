# Testing Guide

## Backend Tests (Docker)

Build the test image (includes dev dependencies):

```bash
docker build -f infrastructure/docker/backend.dev.Dockerfile backend/ -t harvey-backend-test
```

Run the full Mocha suite inside a container:

```bash
docker compose -f infrastructure/compose/docker-compose.yml --profile test run --rm backend-test
```

> Note: always use the explicit `-f infrastructure/compose/docker-compose.yml` path — do not rely on a root-level symlink.

Run a specific test suite by route:

```bash
docker compose -f infrastructure/compose/docker-compose.yml --profile test run --rm backend-test \
  npm run test:user
```

Available scoped test scripts: `test:action`, `test:gardenBed`, `test:gardenStatus`, `test:middleware`, `test:node`, `test:pump`, `test:solenoid`, `test:user`.

### Interpreting test output

- `passing` — all assertions succeeded
- `failing` — assertions that failed; mocha prints expected vs actual values
- Exit code 0 = all pass; non-zero = at least one failure

---

## Backend Tests (Local)

Copy the env file if you haven't already:

```bash
bash scripts/setup.sh
```

Install dependencies and run all tests:

```bash
cd backend
npm install
npm test
```

Run a specific suite:

```bash
npm run test:user
npm run test:gardenBed
```

For faster iteration, `NODE_ENV=test` and `DB_PATH` are read from `backend/.env`. You can override `DB_PATH` to use an in-memory or throwaway path:

```bash
DB_PATH=/tmp/harvey-test.db npm test
```

---

## Docker Compose Stack (Integration)

Bring up the full stack (backend + Mosquitto broker):

```bash
docker compose -f infrastructure/compose/docker-compose.yml up
```

Services:
- `backend` — Node.js/Express API on port 5000
- `mosquitto` — Eclipse Mosquitto MQTT broker on port 1883
- `node-simulator` — Python ESP32 simulator (built in Phase 3)

Tear down and remove volumes:

```bash
docker compose -f infrastructure/compose/docker-compose.yml down -v
```

---

## Simulator Integration Tests

### Prerequisites

The simulator authenticates as `node@harvey.io`. Seed the database before starting the stack:

```bash
# Inside the backend container (if already running):
docker compose -f infrastructure/compose/docker-compose.yml exec backend npm run data:import

# Or locally:
cd backend && npm run data:import
```

The default node password is `change-me` — matches `LOGIN_PASSWORD` in `nodes/simulator/.env.example`.

### Start the full stack

Start the full stack with accelerated simulator timing:

```bash
docker compose \
  -f infrastructure/compose/docker-compose.yml \
  -f infrastructure/compose/docker-compose.integration.yml \
  up --build
```

The backend must reach healthy status before the simulator starts. Watch for these log events from the `node-simulator` container:

- `{"event": "login_ok", ...}` — simulator authenticated; JWT obtained
- `{"event": "telemetry_sent", "bed_id": "Bed_0", ...}` — sensor data posted for a bed
- `{"event": "config_updated", ...}` — simulator received and applied delay values from the backend

With the integration override, telemetry arrives every 2 s and config is polled every 10 s (vs 5 s / 60 s in base config).

### Verify telemetry was stored

Query the running backend from another terminal:

```bash
curl -s http://localhost:5000/api/v1/gardenBed/data \
  -H "Authorization: Bearer <token>" | jq .
```

Or exec into the backend container and query SQLite directly:

```bash
docker compose -f infrastructure/compose/docker-compose.yml exec backend \
  sh -c 'sqlite3 /app/data/harvey.db "SELECT * FROM gardenBedData ORDER BY id DESC LIMIT 10;"'
```

### Tear down

```bash
docker compose -f infrastructure/compose/docker-compose.yml down -v
```

For a fully automated version of this flow, see [Automated Integration Test](#automated-integration-test) below.

---

## Automated Integration Test

Runs the full stack end-to-end, seeds the database, drives the simulator for 30 seconds, and asserts that telemetry records were stored in the backend.

```bash
scripts/test-integration.sh
```

Run from the repo root. No arguments needed. Takes roughly 45–60 seconds.

**What it does:**
1. Starts `backend` and `mosquitto` via Docker Compose (integration override)
2. Seeds the database (`npm run data:import`)
3. Runs the simulator for 30 s with accelerated timing (telemetry every 2 s)
4. Logs in as `admin@harvey.local` and queries `/api/v1/gardenBed/data`
5. Exits 0 if at least one telemetry record is found; exits 1 otherwise
6. Tears down the stack on exit regardless of pass/fail

**Passing output ends with:**
```
==> Telemetry records found: <N>
PASS: Integration test passed
```

---

## Firmware Compile Check

Build the PlatformIO image and compile the firmware without hardware:

```bash
docker build -t harvey-esp32-build nodes/esp32/
cp nodes/esp32/include/LocalConfig.h.example nodes/esp32/include/LocalConfig.h
docker run --rm -v $(pwd)/nodes/esp32:/workspace harvey-esp32-build pio run
```

A successful compile prints `[SUCCESS]` for the `esp32dev` environment. `LocalConfig.h` is gitignored — copy the example file before running so the build can find it.

---

## CI (GitHub Actions)

The workflow at `.github/workflows/ci.yml` runs on every push to `main` or `develop` and on all pull requests.

**Jobs:**

| Job | What it does |
|---|---|
| `Backend Tests` | Builds `infrastructure/docker/backend.dev.Dockerfile`, runs the full Mocha suite inside the container |
| `Firmware Compile Check` | Builds `nodes/esp32/Dockerfile`, copies `LocalConfig.h.example` → `LocalConfig.h`, runs `pio run` |

Both jobs run on `ubuntu-latest` and require no secrets or credentials.

**Reading a run:** open the Actions tab on GitHub, select the workflow run, and expand the failing job's steps. A red `Run tests` step means at least one Mocha assertion failed — the step output shows the full Mocha report. A red `Compile firmware` step means a C++ compile error — the step output contains the PlatformIO error log.

The simulator integration test (`scripts/test-integration.sh`) is not run in CI — it requires a seeded database and takes too long for every PR. Run it manually before merging changes that touch the simulator or backend API.

---

## Hardware-in-the-Loop (HIL)

To validate the firmware on a real ESP32 device, see [`docs/FLASHING_GUIDE.md`](FLASHING_GUIDE.md).

That guide covers: configuring `LocalConfig.h`, compiling and flashing via PlatformIO, monitoring serial output, and confirming telemetry reaches the backend.
