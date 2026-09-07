const { chatbotRateLimit, createChatbotRateLimit } = require('../middleware/chatbotRateLimit');

test('limits repeated chatbot requests from one IP', () => {
  const previousLimit = process.env.CHATBOT_RATE_LIMIT;
  process.env.CHATBOT_RATE_LIMIT = '2';
  const req = { ip: 'rate-limit-test-ip' };
  const next = jest.fn();
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  chatbotRateLimit(req, res, next);
  chatbotRateLimit(req, res, next);
  chatbotRateLimit(req, res, next);

  expect(next).toHaveBeenCalledTimes(2);
  expect(res.status).toHaveBeenCalledWith(429);
  if (previousLimit === undefined) delete process.env.CHATBOT_RATE_LIMIT;
  else process.env.CHATBOT_RATE_LIMIT = previousLimit;
});

test('evicts old IP buckets instead of growing memory without a bound', () => {
  const limiter = createChatbotRateLimit({ maxRequests: 1, maxBuckets: 2, windowMs: 60000 });
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  limiter({ ip: 'ip-1' }, res, next);
  limiter({ ip: 'ip-2' }, res, next);
  limiter({ ip: 'ip-3' }, res, next);
  limiter({ ip: 'ip-1' }, res, next);

  expect(next).toHaveBeenCalledTimes(4);
  expect(res.status).not.toHaveBeenCalledWith(429);
});
