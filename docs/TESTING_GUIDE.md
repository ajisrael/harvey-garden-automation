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

> Note: always use `-f infrastructure/compose/docker-compose.yml` — the root symlink does not resolve `env_file` paths correctly.

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

The simulator authenticates as `node@harvey.local`. Seed the database before starting the stack:

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

---

## Firmware Compile Check

> Placeholder — will be documented in Phase 7.
