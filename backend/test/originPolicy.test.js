const { isAllowedOrigin } = require('../utils/originPolicy');

describe('isAllowedOrigin', () => {
  const allowed = ['http://localhost:3000', 'http://161.248.81.124'];

  test('allows requests without Origin and exact configured origins', () => {
    expect(isAllowedOrigin(undefined, allowed)).toBe(true);
    expect(isAllowedOrigin('http://161.248.81.124/', allowed)).toBe(true);
  });

  test('rejects lookalike localhost and shared-hosting origins', () => {
    expect(isAllowedOrigin('https://localhost.attacker.example', allowed)).toBe(false);
    expect(isAllowedOrigin('https://untrusted.vercel.app', allowed)).toBe(false);
  });
});
