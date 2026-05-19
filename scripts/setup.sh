#!/usr/bin/env bash
set -euo pipefail

copy_if_missing() {
  local src="$1"
  local dst="$2"
  if [ -f "$dst" ]; then
    echo "  exists:  $dst"
  else
    cp "$src" "$dst"
    echo "  created: $dst"
  fi
}

echo "Harvey Garden Automation — environment setup"
echo ""

echo "Copying .env files..."
copy_if_missing backend/.env.example backend/.env
copy_if_missing nodes/simulator/.env.example nodes/simulator/.env

echo ""
echo "Copying firmware config..."
copy_if_missing nodes/esp32/include/LocalConfig.h.example nodes/esp32/include/LocalConfig.h

echo ""
echo "Done. Review and edit the .env files and nodes/esp32/include/LocalConfig.h before starting."
