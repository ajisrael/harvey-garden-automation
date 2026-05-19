FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir platformio

# Pre-warm PlatformIO toolchain and framework cache
RUN pio platform install espressif32 && \
    pio pkg install --global --tool "platformio/framework-arduinoespressif32@~3.20017.0" && \
    pio pkg install --global --tool "platformio/tool-scons@~4.40801.0"

WORKDIR /workspace

CMD ["pio", "run"]
