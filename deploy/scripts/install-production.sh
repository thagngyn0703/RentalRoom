#!/usr/bin/env bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

PROJECT_ROOT=${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)}
PROJECT_ROOT=$(realpath "$PROJECT_ROOT")
APP_USER=${APP_USER:-codexproxy}
APP_GROUP=${APP_GROUP:-codexproxy}
YARN_BIN=$(command -v yarn)

if [[ ! -f "$PROJECT_ROOT/backend/server.js" || ! -f "$PROJECT_ROOT/frontend/package.json" ]]; then
  echo "PROJECT_ROOT is not a RentalRoom checkout: $PROJECT_ROOT" >&2
  exit 1
fi

if [[ ! -f /etc/rentalroom/backend.env ]]; then
  echo "Missing /etc/rentalroom/backend.env" >&2
  exit 1
fi

if ! command -v nginx >/dev/null 2>&1 || ! command -v rsync >/dev/null 2>&1; then
  apt-get update
  DEBIAN_FRONTEND=noninteractive apt-get install -y nginx rsync
fi

runuser -u "$APP_USER" -- env HOME="/home/$APP_USER" "$YARN_BIN" --cwd "$PROJECT_ROOT/backend" install --frozen-lockfile
runuser -u "$APP_USER" -- env HOME="/home/$APP_USER" "$YARN_BIN" --cwd "$PROJECT_ROOT/frontend" install --frozen-lockfile
runuser -u "$APP_USER" -- env HOME="/home/$APP_USER" "$YARN_BIN" --cwd "$PROJECT_ROOT/frontend" build

install -d -m 0755 -o root -g root /var/www/rentalroom
rsync -a --delete --chmod=D755,F644 "$PROJECT_ROOT/frontend/build/" /var/www/rentalroom/
chown -R root:root /var/www/rentalroom

install -m 0644 "$PROJECT_ROOT/deploy/nginx/rentalroom.conf" /etc/nginx/sites-available/rentalroom
ln -sfn /etc/nginx/sites-available/rentalroom /etc/nginx/sites-enabled/rentalroom
if [[ -L /etc/nginx/sites-enabled/default ]]; then
  unlink /etc/nginx/sites-enabled/default
fi

sed \
  -e "s|@APP_USER@|$APP_USER|g" \
  -e "s|@APP_GROUP@|$APP_GROUP|g" \
  -e "s|@PROJECT_ROOT@|$PROJECT_ROOT|g" \
  "$PROJECT_ROOT/deploy/systemd/rentalroom-backend.service" \
  > /etc/systemd/system/rentalroom-backend.service
chmod 0644 /etc/systemd/system/rentalroom-backend.service

nginx -t
systemctl daemon-reload
systemctl enable --now nginx
systemctl enable rentalroom-backend
systemctl restart rentalroom-backend
systemctl reload nginx

if command -v ufw >/dev/null 2>&1 && [[ ${ENABLE_UFW:-0} == 1 ]]; then
  ufw allow OpenSSH
  ufw allow 80/tcp
  ufw --force enable
fi

PUBLIC_URL=${PUBLIC_URL:-http://161.248.81.124}
PUBLIC_URL="$PUBLIC_URL" "$PROJECT_ROOT/deploy/scripts/verify-production.sh"
