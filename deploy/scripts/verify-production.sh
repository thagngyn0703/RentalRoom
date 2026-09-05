#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL=${PUBLIC_URL:-http://161.248.81.124}

wait_for_url() {
  local url=$1
  local attempts=${2:-30}
  local attempt

  for ((attempt = 1; attempt <= attempts; attempt += 1)); do
    if curl --fail --show-error --silent --max-time 3 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  echo "Timed out waiting for $url after $attempts attempts" >&2
  return 1
}

sudo nginx -t
sudo systemctl is-active --quiet nginx
sudo systemctl is-active --quiet rentalroom-backend
sudo systemctl is-enabled --quiet nginx
sudo systemctl is-enabled --quiet rentalroom-backend

wait_for_url http://127.0.0.1:8000/api/health
curl --fail --show-error --silent --max-time 10 http://127.0.0.1/api/health >/dev/null
curl --fail --show-error --silent --max-time 10 http://127.0.0.1/ >/dev/null
curl --fail --show-error --silent --max-time 15 "$PUBLIC_URL/" >/dev/null

echo "RentalRoom production verification passed for $PUBLIC_URL"
