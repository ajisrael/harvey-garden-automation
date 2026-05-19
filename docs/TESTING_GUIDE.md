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

> Placeholder — will be documented in Phase 3.

---

## Firmware Compile Check

> Placeholder — will be documented in Phase 7.
