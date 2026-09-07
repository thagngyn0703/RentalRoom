const { getHealth, resolveListenHost } = require('../utils/runtimeStatus');

test('reports ready only when MongoDB is connected', () => {
  expect(getHealth(1)).toEqual({
    statusCode: 200,
    body: { status: 'ok', database: 'connected' },
  });
  expect(getHealth(0)).toEqual({
    statusCode: 503,
    body: { status: 'not_ready', database: 'disconnected' },
  });
  expect(getHealth(2)).toEqual({
    statusCode: 503,
    body: { status: 'not_ready', database: 'connecting' },
  });
  expect(getHealth(3)).toEqual({
    statusCode: 503,
    body: { status: 'not_ready', database: 'disconnecting' },
  });
});

test('defaults to all interfaces but accepts a loopback override', () => {
  expect(resolveListenHost(undefined)).toBe('0.0.0.0');
  expect(resolveListenHost(' 127.0.0.1 ')).toBe('127.0.0.1');
});
