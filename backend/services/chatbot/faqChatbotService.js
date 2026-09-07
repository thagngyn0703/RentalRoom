const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenScore = (left, right) => {
  const leftTokens = new Set(normalizeText(left).split(' ').filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(' ').filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let shared = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) shared += 1;
  });
  return (2 * shared) / (leftTokens.size + rightTokens.size);
};

const faqCandidates = (faq) => [faq.question, ...(Array.isArray(faq.keywords) ? faq.keywords : [])]
  .filter(Boolean);

const rankFaqs = (question, faqs = []) => faqs
  .map((faq) => {
    const score = Math.max(0, ...faqCandidates(faq).map((candidate) => tokenScore(question, candidate)));
    return { faq, score };
  })
  .sort((left, right) => (
    right.score - left.score
    || Number(right.faq.priority || 0) - Number(left.faq.priority || 0)
  ));

const toPublicFaq = (faq, score) => ({
  _id: faq._id,
  question: faq.question,
  answer: faq.answer,
  category: faq.category,
  score,
});

const isExactMatch = (question, faq) => {
  const normalizedQuestion = normalizeText(question);
  return faqCandidates(faq).some((candidate) => normalizeText(candidate) === normalizedQuestion);
};

async function answerFaqQuestion({
  question,
  faqs = [],
  generateAnswer,
  matchThreshold = 0.3,
}) {
  const ranked = rankFaqs(question, faqs);
  const top = ranked[0];
  const suggestions = ranked.slice(0, 3).map(({ faq, score }) => toPublicFaq(faq, score));

  if (!top || top.score < matchThreshold) {
    return {
      answer: 'Tôi chưa tìm thấy câu trả lời chắc chắn. Bạn có thể xem các câu hỏi gần nhất hoặc gửi yêu cầu hỗ trợ.',
      source: 'unanswered',
      matchedFaqs: suggestions,
      canCreateTicket: true,
    };
  }

  if (isExactMatch(question, top.faq) || typeof generateAnswer !== 'function') {
    return {
      answer: top.faq.answer,
      source: 'faq_exact',
      matchedFaqs: [toPublicFaq(top.faq, top.score)],
      canCreateTicket: false,
    };
  }

  const groundedFaqs = ranked
    .filter(({ score }) => score >= matchThreshold)
    .slice(0, 3)
    .map(({ faq }) => faq);

  try {
    const generated = await generateAnswer({ question, faqs: groundedFaqs });
    if (typeof generated !== 'string' || !generated.trim()) throw new Error('Empty Gemini answer');
    return {
      answer: generated.trim(),
      source: 'faq_gemini',
      matchedFaqs: groundedFaqs.map((faq) => toPublicFaq(faq)),
      canCreateTicket: false,
    };
  } catch (_error) {
    return {
      answer: top.faq.answer,
      source: 'faq_fallback',
      matchedFaqs: [toPublicFaq(top.faq, top.score)],
      canCreateTicket: false,
    };
  }
}

module.exports = {
  answerFaqQuestion,
  normalizeText,
  rankFaqs,
};
