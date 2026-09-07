const { refreshCookieOptions } = require('../utils/cookieOptions');

test('uses Lax non-Secure cookie for an HTTP request in production', () => {
  const options = refreshCookieOptions({ secure: false, headers: {} });
  expect(options).toMatchObject({
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });
});

test('uses None Secure cookie behind an HTTPS proxy', () => {
  const options = refreshCookieOptions({
    secure: false,
    headers: { 'x-forwarded-proto': 'https' },
  });
  expect(options).toMatchObject({ secure: true, sameSite: 'none' });
});
