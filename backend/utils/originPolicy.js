function normalizeOrigin(origin) {
  return typeof origin === 'string' ? origin.replace(/\/+$/g, '') : origin;
}

function isAllowedOrigin(origin, whitelist) {
  if (!origin) return true;
  return whitelist.includes(normalizeOrigin(origin));
}

module.exports = { isAllowedOrigin, normalizeOrigin };
