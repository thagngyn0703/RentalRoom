# Public-IP Production Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run RentalRoom persistently at `http://161.248.81.124` with Nginx, a loopback-only systemd backend, MongoDB Atlas readiness reporting, and documented operations.

**Architecture:** Nginx serves the compiled React application and proxies same-origin API and Socket.IO traffic to Express on `127.0.0.1:8000`. Application changes make the API base URL same-origin, derive cookie security from the real request protocol, expose database readiness, and honor a loopback bind address. Secrets live outside Git in a mode-`0600` environment file.

**Tech Stack:** React 18/Create React App, Axios, Express 5, Socket.IO 4, Mongoose 7, Jest, Nginx, systemd, Ubuntu UFW, Chromium.

**Spec:** `docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md`

## Global Constraints

- Public URL is exactly `http://161.248.81.124` until a domain is available.
- Public application ports are `80/tcp`; backend port `8000/tcp` is loopback-only.
- Existing MongoDB Atlas data must not be seeded, migrated, deleted, or rewritten.
- Secret values must never enter Git, service files, Nginx files, logs, screenshots, or reports.
- Existing unrelated `yarn.lock` changes and `screenshots/` files must not be bundled into implementation commits.
- Every behavior change follows red-green TDD.
- Completion requires two fresh verification rounds and real Chromium checks at `1440x900` and `390x844`.
- The current HTTP deployment is explicitly interim and unsafe for real sensitive traffic.

---

### Task 1: Same-origin frontend transport

**Files:**
- Create: `frontend/src/config/apiBaseUrl.js`
- Create: `frontend/src/config/apiBaseUrl.test.js`
- Delete: `frontend/src/App.test.js` (obsolete Create React App placeholder)
- Modify: `frontend/src/config/axios.js`
- Modify: `frontend/src/config/axiosJWT.js`

**Interfaces:**
- Produces: `resolveApiBaseUrl(value?: string): string`, returning a trimmed explicit URL or `''` for same-origin.
- Consumes: Create React App's `process.env.REACT_APP_API_URL`.

- [ ] **Step 1: Write the failing resolver test**

```js
import { resolveApiBaseUrl } from './apiBaseUrl';

test('uses the browser origin when no API URL is configured', () => {
  expect(resolveApiBaseUrl(undefined)).toBe('');
  expect(resolveApiBaseUrl('   ')).toBe('');
});

test('trims an explicitly configured API URL', () => {
  expect(resolveApiBaseUrl(' http://127.0.0.1:8000/ ')).toBe('http://127.0.0.1:8000/');
});
```

- [ ] **Step 2: Run RED**

Run: `cd frontend && CI=true yarn test --watchAll=false src/config/apiBaseUrl.test.js`

Expected: FAIL because `./apiBaseUrl` does not exist.

- [ ] **Step 3: Implement the minimal resolver**

```js
export const resolveApiBaseUrl = (value) => (value || '').trim();
```

Update both Axios configuration files to import the resolver and set their base URL from:

```js
const API_BASE_URL = resolveApiBaseUrl(process.env.REACT_APP_API_URL);
```

Remove the obsolete Render fallback and development branch.

Delete `frontend/src/App.test.js`: it asserts that the removed Create React App
starter text "learn react" is present and therefore does not test current
product behavior. Do not replace it with a shallow assertion; the new resolver
test is the maintained transport regression test for this task.

- [ ] **Step 4: Run GREEN and the frontend suite**

Run: `cd frontend && CI=true yarn test --watchAll=false src/config/apiBaseUrl.test.js`

Expected: 2 tests pass.

Run: `cd frontend && CI=true yarn test --watchAll=false`

Expected: all maintained tests pass and no stale starter-template assertion remains.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.test.js frontend/src/config/apiBaseUrl.js frontend/src/config/apiBaseUrl.test.js frontend/src/config/axios.js frontend/src/config/axiosJWT.js
git commit -m "fix: use same-origin API in production"
```

### Task 2: Protocol-aware authentication cookies

**Files:**
- Create: `backend/utils/cookieOptions.js`
- Create: `backend/test/cookieOptions.test.js`
- Modify: `backend/controllers/authControllers.js`

**Interfaces:**
- Produces: `isHttpsRequest(req): boolean`.
- Produces: `refreshCookieOptions(req, overrides?): object` with `httpOnly`, `path`, `secure`, `sameSite`, and optional overrides.
- Consumes: Express request protocol and `X-Forwarded-Proto` populated by Nginx.

- [ ] **Step 1: Write failing cookie-policy tests**

```js
const { refreshCookieOptions } = require('../utils/cookieOptions');

test('uses Lax non-Secure cookie for an HTTP request in production', () => {
  const options = refreshCookieOptions({ secure: false, headers: {} });
  expect(options).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
});

test('uses None Secure cookie behind an HTTPS proxy', () => {
  const options = refreshCookieOptions({ secure: false, headers: { 'x-forwarded-proto': 'https' } });
  expect(options).toMatchObject({ secure: true, sameSite: 'none' });
});
```

- [ ] **Step 2: Run RED**

Run: `cd backend && yarn test --runInBand test/cookieOptions.test.js`

Expected: FAIL because `cookieOptions` does not exist.

- [ ] **Step 3: Implement and reuse the cookie policy**

```js
const isHttpsRequest = (req) => {
  const forwarded = req.headers?.['x-forwarded-proto'] || '';
  return Boolean(req.secure || forwarded.split(',').some((value) => value.trim() === 'https'));
};

const refreshCookieOptions = (req, overrides = {}) => {
  const secure = isHttpsRequest(req);
  return { httpOnly: true, path: '/', secure, sameSite: secure ? 'none' : 'lax', ...overrides };
};

module.exports = { isHttpsRequest, refreshCookieOptions };
```

Replace duplicated cookie-option construction in login, logout, and refresh-token handlers. Preserve their current max ages, expiration behavior, and optional cookie domain.

- [ ] **Step 4: Run GREEN and backend tests**

Run: `cd backend && yarn test --runInBand test/cookieOptions.test.js`

Expected: 2 tests pass.

Run: `cd backend && yarn test --runInBand`

Expected: entire backend test suite passes.

- [ ] **Step 5: Commit**

```bash
git add backend/utils/cookieOptions.js backend/test/cookieOptions.test.js backend/controllers/authControllers.js
git commit -m "fix: derive auth cookie security from request protocol"
```

### Task 3: Readiness endpoint and loopback binding

**Files:**
- Create: `backend/utils/runtimeStatus.js`
- Create: `backend/test/runtimeStatus.test.js`
- Modify: `backend/server.js`

**Interfaces:**
- Produces: `getHealth(connectionState): { statusCode: number, body: object }`.
- Produces: `resolveListenHost(value?: string): string` returning an explicit host or `0.0.0.0`.
- Exposes: `GET /api/health` returning `200` with `status: "ok"` when Mongoose state is `1`, otherwise `503` with `status: "not_ready"`.

- [ ] **Step 1: Write failing runtime tests**

```js
const { getHealth, resolveListenHost } = require('../utils/runtimeStatus');

test('reports ready only when MongoDB is connected', () => {
  expect(getHealth(1)).toEqual({ statusCode: 200, body: { status: 'ok', database: 'connected' } });
  expect(getHealth(0)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'disconnected' } });
  expect(getHealth(2)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'connecting' } });
  expect(getHealth(3)).toEqual({ statusCode: 503, body: { status: 'not_ready', database: 'disconnecting' } });
});

test('defaults to all interfaces but accepts a loopback override', () => {
  expect(resolveListenHost(undefined)).toBe('0.0.0.0');
  expect(resolveListenHost(' 127.0.0.1 ')).toBe('127.0.0.1');
});
```

- [ ] **Step 2: Run RED**

Run: `cd backend && yarn test --runInBand test/runtimeStatus.test.js`

Expected: FAIL because `runtimeStatus` does not exist.

- [ ] **Step 3: Implement status helpers and endpoint**

Implement exact state mapping `0 -> disconnected`, `1 -> connected`,
`2 -> connecting`, and `3 -> disconnecting`, without including URI,
credentials, stack traces, or host details in the response. Any unknown state
maps to `unknown` with status `503`. Add `/api/health` before application routers:

```js
app.get('/api/health', (req, res) => {
  const health = getHealth(mongoose.connection.readyState);
  return res.status(health.statusCode).json(health.body);
});
```

Change the final listener to use:

```js
const HOST = resolveListenHost(process.env.HOST);
httpServer.listen(PORT, HOST, () => console.log(`Server listening on ${HOST}:${PORT}`));
```

- [ ] **Step 4: Run GREEN and backend suite**

Run: `cd backend && yarn test --runInBand test/runtimeStatus.test.js`

Expected: 2 tests pass.

Run: `cd backend && yarn test --runInBand`

Expected: entire suite passes.

- [ ] **Step 5: Commit**

```bash
git add backend/utils/runtimeStatus.js backend/test/runtimeStatus.test.js backend/server.js
git commit -m "feat: expose backend readiness status"
```

### Task 4: Versioned deployment configuration

**Files:**
- Create: `deploy/nginx/rentalroom.conf`
- Create: `deploy/systemd/rentalroom-backend.service`
- Create: `deploy/env/backend.production.env.example`
- Create: `deploy/scripts/install-production.sh`
- Create: `deploy/scripts/verify-production.sh`

**Interfaces:**
- Nginx serves `/var/www/rentalroom` and proxies to `http://127.0.0.1:8000`.
- systemd loads `/etc/rentalroom/backend.env` and runs `/usr/bin/node server.js` from the repository backend directory.
- Install script accepts `PROJECT_ROOT`, defaulting to the current repository root after path validation.

- [ ] **Step 1: Create a failing static configuration test**

Run before files exist:

```bash
test -f deploy/nginx/rentalroom.conf \
  && test -f deploy/systemd/rentalroom-backend.service \
  && test -f deploy/scripts/install-production.sh
```

Expected: non-zero exit status.

- [ ] **Step 2: Add Nginx and systemd templates**

Nginx requirements:

```nginx
server {
    listen 80 default_server;
    server_name 161.248.81.124 _;
    root /var/www/rentalroom;
    index index.html;
    client_max_body_size 25m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 65s;
    }

    location ~ /\. { deny all; }
    location = /index.html { add_header Cache-Control "no-store"; }
    location / { try_files $uri $uri/ /index.html; }
}
```

The systemd unit uses `User=codexproxy`, `Group=codexproxy`, `EnvironmentFile=/etc/rentalroom/backend.env`, `Restart=on-failure`, `RestartSec=5`, `NoNewPrivileges=true`, `PrivateTmp=true`, and `WantedBy=multi-user.target`.

- [ ] **Step 3: Add idempotent install and verification scripts**

The install script must use `set -euo pipefail`; validate that `backend/server.js` and `frontend/package.json` exist; install Nginx only if absent; build the frontend; synchronize build output to `/var/www/rentalroom`; install versioned Nginx/systemd files; run `nginx -t`; reload systemd; enable/restart both services; preserve SSH in UFW before optionally enabling it; and never create or print the secret environment file.

The verification script must use `curl --fail --show-error` against `/`, `/api/health`, and the loopback backend; check systemd active/enabled state; run `nginx -t`; and return non-zero on any failure.

- [ ] **Step 4: Validate configuration without installation**

Run:

```bash
bash -n deploy/scripts/install-production.sh
bash -n deploy/scripts/verify-production.sh
systemd-analyze verify deploy/systemd/rentalroom-backend.service
test -f deploy/nginx/rentalroom.conf && test -f deploy/systemd/rentalroom-backend.service
```

Expected: every command exits `0`. Run `nginx -t` after Nginx installation in Task 6.

- [ ] **Step 5: Commit**

```bash
git add deploy
git commit -m "ops: add production deployment configuration"
```

### Task 5: Product README and operations wiki

**Files:**
- Create: `README.md`
- Create: `docs/wiki/operations.md`
- Modify: `backend/README.md`

**Interfaces:**
- Root README links to the design, plan, backend guide, frontend guide, and operations wiki.
- Operations wiki is the canonical runbook for status, logs, restart, deploy, rollback, secrets, and roadmap.

- [ ] **Step 1: Create failing documentation checks**

Run:

```bash
test -f README.md && test -f docs/wiki/operations.md
```

Expected: non-zero exit status.

- [ ] **Step 2: Write README and wiki**

Document:

- product functions and frontend/backend architecture;
- deployment status and public URL;
- exact install, status, restart, logs, health, rebuild, and rollback commands;
- all required environment-variable names with placeholder values only;
- current work, next work, HTTP security limitation, and credential rotation;
- mandatory Git management, Superpowers workflow, surgical changes, TDD, two audit rounds, desktop/mobile browser checks, screenshot evidence, and 24-hour screenshot deletion policy.

Correct `backend/README.md` to use `REFRESH_JWT_SECRET`, production-safe placeholder examples, and Yarn commands matching the repository.

- [ ] **Step 3: Check documentation for secret leakage and broken local links**

Run:

```bash
rg -n 'mongodb\+srv://[^:]+:[^@]+@|AIza[0-9A-Za-z_-]{20,}|SMTP_PASS=[^<]|API_SECRET=[^<]' README.md docs backend/README.md && exit 1 || true
test -f docs/wiki/operations.md
test -f docs/superpowers/specs/2026-09-05-public-ip-production-deployment-design.md
test -f docs/superpowers/plans/2026-09-05-public-ip-production-deployment.md
```

Expected: no secret pattern is found and all linked local files exist.

- [ ] **Step 4: Commit**

```bash
git add README.md backend/README.md docs/wiki/operations.md
git commit -m "docs: add product and production operations guide"
```

### Task 6: Install runtime services and secrets

**Files outside Git:**
- Create: `/etc/rentalroom/backend.env` with owner `codexproxy:codexproxy`, mode `0600`.
- Install: `/etc/nginx/sites-available/rentalroom`.
- Install: `/etc/systemd/system/rentalroom-backend.service`.
- Publish: `/var/www/rentalroom/`.

**Interfaces:**
- Backend environment includes the supplied values plus `NODE_ENV=production`, `PORT=8000`, `HOST=127.0.0.1`, and `FRONTEND_URL=http://161.248.81.124`.

- [ ] **Step 1: Create the environment file without printing it**

Use `sudo install -d -m 0750 -o codexproxy -g codexproxy /etc/rentalroom`, create the file through `apply_patch` in a private staging path, install it with `sudo install -m 0600 -o codexproxy -g codexproxy`, and immediately remove the staging copy. Do not include inline comments after values.

- [ ] **Step 2: Prove secrets are excluded from Git**

Run `git status --short` and `git grep -n` for unique fragments of each supplied secret.

Expected: no secret appears in tracked or staged content.

- [ ] **Step 3: Allow Atlas access and test connectivity**

Attempt backend startup with the protected environment file and inspect only sanitized connection output. If Atlas returns an IP allow-list error, report that `161.248.81.124/32` must be added in Atlas and stop; do not replace Atlas or alter data.

- [ ] **Step 4: Run the install script**

Run: `sudo PROJECT_ROOT="$PWD" bash deploy/scripts/install-production.sh`

Expected: frontend build succeeds; Nginx syntax passes; backend and Nginx are active and enabled.

- [ ] **Step 5: Verify port exposure and service ownership**

Run:

```bash
ss -ltnp | rg ':80|:8000'
sudo systemctl is-active rentalroom-backend nginx
sudo systemctl is-enabled rentalroom-backend nginx
stat -c '%U:%G %a %n' /etc/rentalroom/backend.env
```

Expected: Nginx listens publicly on `80`; backend listens only on `127.0.0.1:8000`; services are active/enabled; environment permissions are `codexproxy:codexproxy 600`.

### Task 7: Verification round 1 — build and service audit

**Files:**
- No source changes unless a failing check exposes a separately diagnosed defect.

- [ ] **Step 1: Run complete automated checks**

```bash
cd backend && yarn test --runInBand
cd ../frontend && CI=true yarn test --watchAll=false
yarn build
cd .. && bash -n deploy/scripts/*.sh
sudo nginx -t
sudo systemctl is-active rentalroom-backend nginx
sudo systemctl is-enabled rentalroom-backend nginx
```

Expected: all commands exit `0`, with no failed tests.

- [ ] **Step 2: Probe every local component boundary**

```bash
curl --fail --show-error http://127.0.0.1:8000/api/health
curl --fail --show-error http://127.0.0.1/api/health
curl --fail --show-error http://127.0.0.1/
curl --fail --show-error 'http://127.0.0.1/socket.io/?EIO=4&transport=polling'
```

Expected: health is `200` and database is `connected`; homepage contains the React root; Socket.IO returns an Engine.IO open packet.

- [ ] **Step 3: Restart and re-probe**

Run: `sudo systemctl restart rentalroom-backend nginx && deploy/scripts/verify-production.sh`

Expected: restart completes and all probes pass without manual intervention.

- [ ] **Step 4: Audit Git and logs**

Run `git diff --check`, `git status --short`, secret-pattern scans, and `sudo journalctl -u rentalroom-backend --since '10 minutes ago' --no-pager`.

Expected: no secrets in Git, no unplanned source changes, no MongoDB connection errors, uncaught exceptions, or restart loops.

### Task 8: Verification round 2 — public, stress, and browser audit

**Files:**
- Create temporarily: `screenshots/production-desktop.png`
- Create temporarily: `screenshots/production-mobile.png`

- [ ] **Step 1: Probe the public path**

Run:

```bash
curl --fail --show-error --max-time 15 http://161.248.81.124/
curl --fail --show-error --max-time 15 http://161.248.81.124/api/health
curl --fail --show-error --max-time 15 'http://161.248.81.124/socket.io/?EIO=4&transport=polling'
```

Expected: homepage, database-ready health, and Socket.IO handshake all succeed through Nginx.

- [ ] **Step 2: Run bounded concurrency tests**

Use 200 requests with concurrency 20 against `/` and `/api/health` using `ab` if installed, otherwise parallel `curl`. Capture request count, failed requests, non-2xx responses, and latency.

Expected: zero connection failures and zero unexpected HTTP statuses. This is a bounded smoke load, not a capacity certification.

- [ ] **Step 3: Test desktop Chromium**

Open `http://161.248.81.124` in headless Chromium at `1440x900`, record browser console and failed network requests, wait for network idle plus the app's loading state to settle, then save `screenshots/production-desktop.png`.

Expected: no console exceptions, no failed first-party API requests, no visible loading deadlock, overlap, clipping, or horizontal overflow.

- [ ] **Step 4: Test mobile Chromium**

Repeat at `390x844` and save `screenshots/production-mobile.png`.

Expected: same functional criteria, readable navigation/content, and no horizontal overflow.

- [ ] **Step 5: Verify authentication transport**

Use a non-destructive test account if one already exists. Confirm login returns a refresh cookie with `HttpOnly`, `SameSite=Lax`, and without `Secure` on HTTP; refresh succeeds; logout expires the same cookie. Do not create or modify a real user's data without separate authorization.

- [ ] **Step 6: Schedule screenshot deletion**

Install a transient systemd timer or `at` job that deletes only the two explicit production screenshot paths after 24 hours. Verify the scheduled unit/job exists. Do not use a broad glob or recursive deletion.

- [ ] **Step 7: Record evidence and final status**

Update `docs/wiki/operations.md` with the deployment timestamp, commit SHA, two-round results, known HTTP risk, public URL, and next action (domain plus TLS). Link the two screenshots in the handoff, report any unmet acceptance criterion as a blocker, and never claim pass unless every required check has fresh evidence.

- [ ] **Step 8: Commit final operational status**

```bash
git add docs/wiki/operations.md
git commit -m "docs: record production deployment verification"
```
