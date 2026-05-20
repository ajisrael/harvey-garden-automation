#!/usr/bin/env bash
set -euo pipefail

COMPOSE="docker compose -f infrastructure/compose/docker-compose.yml -f infrastructure/compose/docker-compose.integration.yml"

trap "$COMPOSE down" EXIT

echo "==> Starting stack..."
$COMPOSE up -d backend mosquitto

echo "==> Seeding database..."
$COMPOSE run --rm backend npm run data:reset

echo "==> Starting simulator (30s run)..."
$COMPOSE run --rm \
  -e API_CALL_DELAY_MS=2000 \
  -e LOGIN_DELAY_MS=5000 \
  -e CONFIG_UPDATE_DELAY_MS=10000 \
  node-simulator timeout 30 python3 simulator.py || true

echo "==> Querying backend for telemetry..."
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"1234567!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

COUNT=$(curl -s http://localhost:5000/api/v1/gardenBed/data \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('data', d) if isinstance(d, dict) else d))")

echo "==> Telemetry records found: $COUNT"

if [ "$COUNT" -lt 1 ]; then
  echo "FAIL: No telemetry records found in backend"
  exit 1
fi

echo "PASS: Integration test passed"
