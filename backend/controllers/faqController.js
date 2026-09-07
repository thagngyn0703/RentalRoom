const DefaultFaq = require('../models/Faq');
const { answerFaqQuestion } = require('../services/chatbot/faqChatbotService');
const { generateGroundedAnswer: defaultGenerateAnswer } = require('../services/chatbot/geminiFaqService');

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cleanKeywords = (value) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.reduce((items, keyword) => {
    const cleaned = cleanText(keyword);
    const key = cleaned.toLocaleLowerCase('vi');
    if (cleaned && !seen.has(key)) {
      seen.add(key);
      items.push(cleaned);
    }
    return items;
  }, []);
};

const faqPayload = (body = {}, userId) => ({
  question: cleanText(body.question),
  answer: cleanText(body.answer),
  keywords: cleanKeywords(body.keywords),
  category: cleanText(body.category) || 'general',
  priority: Number.isFinite(Number(body.priority)) ? Number(body.priority) : 0,
  isActive: typeof body.isActive === 'boolean' ? body.isActive : true,
  updatedBy: userId,
});

const validateFaqPayload = (payload) => {
  if (!payload.question || !payload.answer) return 'Câu hỏi và câu trả lời là bắt buộc.';
  if (payload.question.length > 300 || payload.answer.length > 5000) return 'Nội dung FAQ vượt quá độ dài cho phép.';
  if (payload.category.length > 60) return 'Danh mục vượt quá độ dài cho phép.';
  if (payload.priority < 0 || payload.priority > 100) return 'Độ ưu tiên phải nằm trong khoảng 0 đến 100.';
  if (payload.keywords.length > 20 || payload.keywords.some((keyword) => keyword.length > 100)) {
    return 'Danh sách từ khóa không hợp lệ.';
  }
  return null;
};

function createFaqController({ Faq = DefaultFaq, generateGroundedAnswer = defaultGenerateAnswer } = {}) {
  return {
    listPublic: async (_req, res) => {
      try {
        const data = await Faq.find({ isActive: true })
          .sort({ priority: -1, updatedAt: -1 })
          .select('question answer keywords category priority');
        return res.json({ success: true, data });
      } catch (_error) {
        return res.status(503).json({ success: false, message: 'Chatbot tạm thời không khả dụng.' });
      }
    },

    ask: async (req, res) => {
      const question = cleanText(req.body?.question);
      if (!question || question.length > 500) {
        return res.status(400).json({ success: false, message: 'Câu hỏi phải có từ 1 đến 500 ký tự.' });
      }
      try {
        const faqs = await Faq.find({ isActive: true }).sort({ priority: -1 }).lean();
        const data = await answerFaqQuestion({ question, faqs, generateAnswer: generateGroundedAnswer });
        return res.json({ success: true, ...data });
      } catch (_error) {
        return res.status(503).json({ success: false, message: 'Chatbot tạm thời không khả dụng.' });
      }
    },

    listAdmin: async (req, res) => {
      try {
        const page = Math.max(1, Number.parseInt(req.query?.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, Number.parseInt(req.query?.limit, 10) || 20));
        const filter = {};
        if (req.query?.category) filter.category = cleanText(req.query.category);
        if (req.query?.status === 'active') filter.isActive = true;
        if (req.query?.status === 'inactive') filter.isActive = false;
        const search = cleanText(req.query?.search);
        if (search) {
          const pattern = new RegExp(escapeRegex(search), 'i');
          filter.$or = [{ question: pattern }, { answer: pattern }, { keywords: pattern }];
        }
        const [data, total] = await Promise.all([
          Faq.find(filter).sort({ priority: -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
          Faq.countDocuments(filter),
        ]);
        return res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
      } catch (_error) {
        return res.status(500).json({ success: false, message: 'Không thể tải danh sách FAQ.' });
      }
    },

    create: async (req, res) => {
      const userId = req.user?.id;
      const payload = faqPayload(req.body, userId);
      const validationError = validateFaqPayload(payload);
      if (validationError) return res.status(400).json({ success: false, message: validationError });
      try {
        const data = await Faq.create({ ...payload, createdBy: userId });
        return res.status(201).json({ success: true, data });
      } catch (_error) {
        return res.status(500).json({ success: false, message: 'Không thể tạo FAQ.' });
      }
    },

    update: async (req, res) => {
      const payload = faqPayload(req.body, req.user?.id);
      const validationError = validateFaqPayload(payload);
      if (validationError) return res.status(400).json({ success: false, message: validationError });
      try {
        const data = await Faq.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy FAQ.' });
        return res.json({ success: true, data });
      } catch (_error) {
        return res.status(500).json({ success: false, message: 'Không thể cập nhật FAQ.' });
      }
    },

    updateStatus: async (req, res) => {
      if (typeof req.body?.isActive !== 'boolean') {
        return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
      }
      try {
        const data = await Faq.findByIdAndUpdate(req.params.id, {
          isActive: req.body.isActive,
          updatedBy: req.user?.id,
        }, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy FAQ.' });
        return res.json({ success: true, data });
      } catch (_error) {
        return res.status(500).json({ success: false, message: 'Không thể cập nhật trạng thái FAQ.' });
      }
    },

    remove: async (req, res) => {
      try {
        const data = await Faq.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Không tìm thấy FAQ.' });
        return res.json({ success: true, message: 'Đã xóa FAQ.' });
      } catch (_error) {
        return res.status(500).json({ success: false, message: 'Không thể xóa FAQ.' });
      }
    },
  };
}

module.exports = { createFaqController, faqController: createFaqController() };
