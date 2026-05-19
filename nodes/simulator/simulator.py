import asyncio
import json
import os
import random
import signal
import time
from pathlib import Path

import httpx
import jsonschema

BACKEND_URL = os.environ.get("BACKEND_URL", "http://backend:5000")
_default_schema_dir = Path(__file__).parent.parent / "shared" / "schemas"
SCHEMA_DIR = Path(os.environ.get("SCHEMA_DIR", _default_schema_dir))
NODE_ID = os.environ.get("NODE_ID", "ESP32_01")
LOGIN_EMAIL = os.environ.get("LOGIN_EMAIL", "node@harvey.local")
LOGIN_PASSWORD = os.environ.get("LOGIN_PASSWORD", "change-me")
BED_IDS = [b.strip() for b in os.environ.get("BED_IDS", "Bed_0,Bed_1").split(",")]

delays = {
    "api_call_delay": int(os.environ.get("API_CALL_DELAY_MS", 5000)) / 1000,
    "config_update_delay": int(os.environ.get("CONFIG_UPDATE_DELAY_MS", 60000)) / 1000,
    "login_delay": int(os.environ.get("LOGIN_DELAY_MS", 600000)) / 1000,
}

MOISTURE_MIN = max(float(os.environ.get("MOISTURE_MIN", 0.20)), 0.0001)
MOISTURE_MAX = float(os.environ.get("MOISTURE_MAX", 0.90))
AIR_TEMP_MIN = float(os.environ.get("AIR_TEMP_MIN", 20))
AIR_TEMP_MAX = float(os.environ.get("AIR_TEMP_MAX", 40))
SOIL_TEMP_MIN = float(os.environ.get("SOIL_TEMP_MIN", 18))
SOIL_TEMP_MAX = float(os.environ.get("SOIL_TEMP_MAX", 38))
LIGHT_MIN = max(float(os.environ.get("LIGHT_MIN", 0.0)), 0.0001)
LIGHT_MAX = float(os.environ.get("LIGHT_MAX", 1.0))
HUMIDITY_MIN = max(float(os.environ.get("HUMIDITY_MIN", 0.30)), 0.0001)
HUMIDITY_MAX = float(os.environ.get("HUMIDITY_MAX", 0.90))

token = None
shutdown = asyncio.Event()
schemas = {}


def load_schemas():
    names = ["login-request", "telemetry-request"]
    for name in names:
        path = SCHEMA_DIR / f"{name}.json"
        with open(path) as f:
            schemas[name] = json.load(f)
    log("schemas_loaded", schemas=names)


def validate_payload(schema_name: str, payload: dict) -> bool:
    schema = schemas.get(schema_name)
    if schema is None:
        return True
    errors = list(jsonschema.Draft7Validator(schema).iter_errors(payload))
    if errors:
        log("schema_validation_error", schema=schema_name, errors=[e.message for e in errors])
        return False
    return True


def log(event: str, **kwargs):
    print(json.dumps({"time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "event": event, **kwargs}), flush=True)


def auth_headers() -> dict:
    return {"Authorization": f"Bearer {token}"} if token else {}


async def with_backoff(coro, label: str):
    backoff = 1
    while not shutdown.is_set():
        try:
            result = await coro()
            return result
        except (httpx.ConnectError, httpx.TimeoutException, httpx.RemoteProtocolError) as exc:
            log("connection_error", label=label, error=str(exc), retry_in=backoff)
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 30)


async def login_loop():
    global token
    first = True
    while not shutdown.is_set():
        if not first:
            await asyncio.sleep(delays["login_delay"])
            if shutdown.is_set():
                break
        first = False

        login_payload = {"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD}
        if not validate_payload("login-request", login_payload):
            continue

        async def do_login():
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{BACKEND_URL}/api/v1/users/login",
                    json=login_payload,
                    timeout=10,
                )
                resp.raise_for_status()
                data = resp.json()
                return data["token"]

        new_token = await with_backoff(do_login, "login")
        if new_token:
            token = new_token
            log("login_ok", node_id=NODE_ID)


async def config_loop():
    await asyncio.sleep(1)
    while not shutdown.is_set():
        if token:
            async def do_config():
                async with httpx.AsyncClient() as client:
                    resp = await client.get(
                        f"{BACKEND_URL}/api/v1/node/{NODE_ID}/config",
                        headers=auth_headers(),
                        timeout=10,
                    )
                    if resp.status_code == 404:
                        return None
                    resp.raise_for_status()
                    return resp.json()

            data = await with_backoff(do_config, "poll_config")
            if data:
                updated = {}
                if "apiCallDelay" in data:
                    delays["api_call_delay"] = data["apiCallDelay"] / 1000
                    updated["api_call_delay"] = delays["api_call_delay"]
                if "configUpdateDelay" in data:
                    delays["config_update_delay"] = data["configUpdateDelay"] / 1000
                    updated["config_update_delay"] = delays["config_update_delay"]
                if "loginDelay" in data:
                    delays["login_delay"] = data["loginDelay"] / 1000
                    updated["login_delay"] = delays["login_delay"]
                if updated:
                    log("config_updated", node_id=NODE_ID, **updated)

        await asyncio.sleep(delays["config_update_delay"])


async def telemetry_loop():
    await asyncio.sleep(2)
    while not shutdown.is_set():
        if token:
            for bed_id in BED_IDS:
                if shutdown.is_set():
                    break

                payload = {
                    "bedId": bed_id,
                    "airTemp": round(random.uniform(AIR_TEMP_MIN, AIR_TEMP_MAX), 2),
                    "soilTemp": round(random.uniform(SOIL_TEMP_MIN, SOIL_TEMP_MAX), 2),
                    "light": round(random.uniform(LIGHT_MIN, LIGHT_MAX), 4),
                    "moisture": round(random.uniform(MOISTURE_MIN, MOISTURE_MAX), 4),
                    "humidity": round(random.uniform(HUMIDITY_MIN, HUMIDITY_MAX), 4),
                }

                if not validate_payload("telemetry-request", payload):
                    continue

                async def do_telemetry(p=payload):
                    async with httpx.AsyncClient() as client:
                        resp = await client.post(
                            f"{BACKEND_URL}/api/v1/gardenBed/data",
                            json=p,
                            headers=auth_headers(),
                            timeout=10,
                        )
                        resp.raise_for_status()

                await with_backoff(do_telemetry, f"telemetry:{bed_id}")
                log("telemetry_sent", node_id=NODE_ID, bed_id=bed_id, **{k: v for k, v in payload.items() if k != "bedId"})

        await asyncio.sleep(delays["api_call_delay"])


async def main():
    load_schemas()
    loop = asyncio.get_running_loop()
    loop.add_signal_handler(signal.SIGTERM, shutdown.set)

    tasks = [
        asyncio.create_task(login_loop()),
        asyncio.create_task(config_loop()),
        asyncio.create_task(telemetry_loop()),
    ]

    await shutdown.wait()

    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    log("shutdown", node_id=NODE_ID)


if __name__ == "__main__":
    asyncio.run(main())
