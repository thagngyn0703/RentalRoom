# Public-IP Production Deployment Design

## Objective

Deploy the existing RentalRoom application as a persistent service at
`http://161.248.81.124`, using the supplied MongoDB Atlas data and restarting
automatically after application failures or server reboots.

This is an interim public-IP deployment. It is not considered secure for real
credentials or personal data until a domain and trusted HTTPS certificate are
added.

## Current constraints

- The server is Ubuntu 24.04 with public IPv4 address `161.248.81.124`.
- Node.js 22 and Yarn 1.22 are installed; Nginx is not installed.
- The application is a Create React App frontend and an Express/Socket.IO
  backend backed by MongoDB Atlas.
- No domain is available, so trusted browser HTTPS cannot be provided in this
  phase.
- The supplied secrets have appeared in conversation history. They must be
  rotated before treating this deployment as production-safe.
- Existing unrelated working-tree changes and screenshots must not be included
  in deployment commits.

## Architecture

Nginx will be the only public application listener on TCP port 80. It will:

- serve the compiled React application from a release directory;
- fall back to `index.html` for client-side routes;
- proxy `/api/` to the Express service on `127.0.0.1:8000`;
- proxy `/socket.io/` with WebSocket upgrade headers to the same service;
- add baseline security and caching headers without caching `index.html`.

The backend will run as a dedicated systemd service under the existing
unprivileged `codexproxy` account. It will bind only to loopback, load secrets
from an owner-readable environment file outside Git, restart on failure, and
start after networking is available.

The production frontend build will use the browser origin for HTTP API and
Socket.IO traffic. This keeps frontend and backend same-origin and avoids
shipping the obsolete Render URL into the bundle.

## Application changes

Changes must stay limited to deployment correctness:

1. Make the frontend production API fallback same-origin. An explicit
   `REACT_APP_API_URL` remains supported.
2. Make authentication-cookie security depend on whether the request is
   actually HTTPS, instead of setting `Secure` solely because
   `NODE_ENV=production`. This permits the approved interim HTTP deployment.
   The cookie remains `HttpOnly`; `SameSite=Lax` is used over HTTP and
   `SameSite=None; Secure` over HTTPS.
3. Add a lightweight backend health endpoint that reports process readiness
   and MongoDB connection state without revealing secrets.
4. Make the backend listener honor `HOST`, defaulting to the current all-host
   behavior for development and using `127.0.0.1` in production deployment.
5. Add versioned deployment templates and scripts for Nginx/systemd plus an
   environment-variable example containing placeholders only.

Behavior changes require tests first. Pure host configuration is verified by
syntax checks and live integration probes.

## Configuration and secrets

The supplied `.env` values will be installed into a non-versioned production
environment file owned by `codexproxy` with mode `0600`. Comments embedded
after values will be removed. Production overrides are:

- `NODE_ENV=production`
- `PORT=8000`
- `HOST=127.0.0.1`
- `FRONTEND_URL=http://161.248.81.124`

No secret value may appear in Git history, service definitions, Nginx
configuration, test logs, screenshots, or final reporting. MongoDB Atlas must
allow inbound database access from `161.248.81.124/32`. If Atlas rejects the
connection, deployment stops at a clearly reported database blocker rather
than claiming the product is healthy.

Before real users are invited, rotate at least the MongoDB password, both JWT
secrets, Gemini key, Gmail app password, Cloudinary secret, and any other token
included in the supplied file.

## Service lifecycle

The frontend is built into a timestamp-independent release directory owned by
the deployment user. Nginx reads the build but cannot modify source files.

The backend systemd unit will use restart-on-failure, a bounded restart delay,
and journal logging. Deployment commands must be idempotent: a second run may
rebuild/restart services but must not duplicate configuration or lose data.

The MongoDB database remains in Atlas; the deployment does not seed, migrate,
delete, or rewrite existing data.

## Network and security

- Public listeners: SSH `22/tcp` and Nginx `80/tcp` only.
- Backend `8000/tcp`: loopback only and not exposed by the firewall.
- Nginx rejects hidden files and serves only the compiled frontend directory.
- Request-body limits and proxy timeouts are explicit.
- Secrets are never committed.
- HTTP is an accepted temporary risk. Passwords, cookies, messages, and payment
  data can be observed or modified by an on-path attacker until HTTPS exists.

Firewall changes must preserve the active SSH path before enabling rules. If an
upstream/cloud firewall blocks port 80, local service health can pass while
external access remains blocked; both paths must therefore be tested.

## Error handling and observability

- Nginx returns a clear `502` when the backend is unavailable while continuing
  to serve the frontend shell.
- `/api/health` distinguishes an alive process from a database-ready process
  and uses a non-success readiness status while MongoDB is disconnected.
- Backend logs go to journald and Nginx access/error logs use the system log
  rotation defaults.
- Deployment documentation includes status, restart, log, rollback, and secret
  rotation commands.

## Verification and acceptance criteria

The deployment is accepted only after two independent verification rounds.

### Round 1: build and service audit

- Backend automated tests pass.
- Frontend automated tests pass in non-watch mode.
- Frontend production build exits successfully.
- Nginx configuration syntax check passes.
- systemd reports the backend and Nginx active.
- Local frontend, health endpoint, API proxy, and WebSocket handshake are
  probed.
- Service restart and reboot-survival configuration are inspected.
- Git diff contains no secret material.

### Round 2: public-path and browser audit

- A request to `http://161.248.81.124` from the public path returns the React
  application.
- Health and representative read-only APIs respond through Nginx.
- A bounded concurrency test checks the homepage and health endpoint for
  connection failures and unexpected status codes.
- Chromium tests desktop `1440x900` and mobile `390x844` views.
- Browser console, failed requests, responsive overflow, loading, empty, and
  error states are inspected.
- Desktop and mobile screenshots are saved, linked in the report, and scheduled
  for deletion after 24 hours.

No pass claim is permitted if the database is disconnected, authentication is
nonfunctional, the public route cannot be reached, tests fail, or browser/API
errors remain.

## Documentation and rollback

The repository root `README.md` will become the product entry point and link to
`docs/wiki/operations.md`. Both documents will record implemented features,
current deployment status, known HTTP risk, work in progress, next steps, the
two-round verification requirement, and screenshot-retention policy.

Rollback restores the previous Nginx site and systemd unit from timestamped
backups, restores the previous frontend build directory, reloads systemd and
Nginx, and verifies the last known-good health response. Database data is not
modified by deployment or rollback.

## Deferred work

- Acquire or point a domain to `161.248.81.124`.
- Issue and automatically renew a trusted TLS certificate.
- Force HTTP-to-HTTPS redirects and permanently require Secure cookies.
- Rotate all exposed credentials and revoke the old values.
- Configure monitoring, alerting, and off-host backup policies if the service
  becomes business-critical.
