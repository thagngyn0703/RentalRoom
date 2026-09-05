const isHttpsRequest = (req) => {
  const forwarded = req.headers?.['x-forwarded-proto'] || '';
  return Boolean(
    req.secure ||
    forwarded.split(',').some((value) => value.trim() === 'https')
  );
};

const refreshCookieOptions = (req, overrides = {}) => {
  const secure = isHttpsRequest(req);
  return {
    httpOnly: true,
    path: '/',
    secure,
    sameSite: secure ? 'none' : 'lax',
    ...overrides,
  };
};

module.exports = { isHttpsRequest, refreshCookieOptions };
