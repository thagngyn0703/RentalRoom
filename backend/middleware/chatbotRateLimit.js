const createChatbotRateLimit = (options = {}) => {
  const buckets = new Map();
  const windowMs = options.windowMs || 60 * 1000;
  const maxBuckets = options.maxBuckets || 10000;

  return (req, res, next) => {
    const now = Date.now();
    const maxRequests = options.maxRequests || Number(process.env.CHATBOT_RATE_LIMIT) || 20;
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const bucket = buckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) {
      if (!bucket && buckets.size >= maxBuckets) {
        const oldestKey = buckets.keys().next().value;
        buckets.delete(oldestKey);
      }
      buckets.delete(key);
      buckets.set(key, { count: 1, startedAt: now });
      return next();
    }
    if (bucket.count >= maxRequests) {
      return res.status(429).json({ success: false, message: 'Bạn gửi câu hỏi quá nhanh. Vui lòng thử lại sau.' });
    }
    bucket.count += 1;
    return next();
  };
};

const chatbotRateLimit = createChatbotRateLimit();

module.exports = { chatbotRateLimit, createChatbotRateLimit };
