const CONNECTION_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealth = (connectionState) => {
  const database = CONNECTION_STATES[connectionState] || 'unknown';
  const ready = connectionState === 1;
  return {
    statusCode: ready ? 200 : 503,
    body: {
      status: ready ? 'ok' : 'not_ready',
      database,
    },
  };
};

const resolveListenHost = (value) => (value || '0.0.0.0').trim();

module.exports = { getHealth, resolveListenHost };
