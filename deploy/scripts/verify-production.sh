#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL=${PUBLIC_URL:-http://161.248.81.124}

sudo nginx -t
sudo systemctl is-active --quiet nginx
sudo systemctl is-active --quiet rentalroom-backend
sudo systemctl is-enabled --quiet nginx
sudo systemctl is-enabled --quiet rentalroom-backend

curl --fail --show-error --silent --max-time 10 http://127.0.0.1:8000/api/health >/dev/null
curl --fail --show-error --silent --max-time 10 http://127.0.0.1/api/health >/dev/null
curl --fail --show-error --silent --max-time 10 http://127.0.0.1/ >/dev/null
curl --fail --show-error --silent --max-time 15 "$PUBLIC_URL/" >/dev/null

echo "RentalRoom production verification passed for $PUBLIC_URL"
