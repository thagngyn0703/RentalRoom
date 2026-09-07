const {
  answerFaqQuestion,
  normalizeText,
  rankFaqs,
} = require('../services/chatbot/faqChatbotService');

const faqs = [
  {
    _id: 'pay-1',
    question: 'Tôi thanh toán tiền thuê như thế nào?',
    answer: 'Mở mục Thanh toán và quét mã QR của kỳ thuê.',
    keywords: ['thanh toán tiền trọ', 'đóng tiền thuê'],
    category: 'payment',
    priority: 5,
  },
  {
    _id: 'booking-1',
    question: 'Làm thế nào để đặt phòng?',
    answer: 'Chọn phòng còn trống và gửi yêu cầu đặt phòng.',
    keywords: ['thuê phòng', 'đặt chỗ'],
    category: 'booking',
    priority: 1,
  },
];

describe('FAQ chatbot', () => {
  test('normalizes Vietnamese accents and whitespace', () => {
    expect(normalizeText('  Đóng   TIỀN thuê  ')).toBe('dong tien thue');
  });

  test('ranks a semantically related FAQ first', () => {
    const matches = rankFaqs('cách thanh toán tiền phòng hàng tháng', faqs);
    expect(matches[0].faq._id).toBe('pay-1');
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
  });

  test('returns an exact keyword answer without calling Gemini', async () => {
    const generateAnswer = jest.fn();
    const result = await answerFaqQuestion({
      question: 'đóng tiền thuê',
      faqs,
      generateAnswer,
    });

    expect(result.source).toBe('faq_exact');
    expect(result.answer).toBe(faqs[0].answer);
    expect(result.canCreateTicket).toBe(false);
    expect(generateAnswer).not.toHaveBeenCalled();
  });

  test('grounds a related answer in matched FAQs through Gemini', async () => {
    const generateAnswer = jest.fn().mockResolvedValue('Bạn vào mục Thanh toán rồi quét mã QR.');
    const result = await answerFaqQuestion({
      question: 'cách thanh toán tiền phòng hàng tháng',
      faqs,
      generateAnswer,
    });

    expect(result.source).toBe('faq_gemini');
    expect(result.answer).toContain('quét mã QR');
    expect(generateAnswer).toHaveBeenCalledWith(expect.objectContaining({
      question: expect.any(String),
      faqs: expect.arrayContaining([expect.objectContaining({ _id: 'pay-1' })]),
    }));
  });

  test('falls back to the approved FAQ when Gemini fails', async () => {
    const result = await answerFaqQuestion({
      question: 'cách thanh toán tiền phòng hàng tháng',
      faqs,
      generateAnswer: jest.fn().mockRejectedValue(new Error('quota')),
    });

    expect(result.source).toBe('faq_fallback');
    expect(result.answer).toBe(faqs[0].answer);
  });

  test('does not invent an answer when no FAQ is relevant', async () => {
    const generateAnswer = jest.fn();
    const result = await answerFaqQuestion({
      question: 'thời tiết hôm nay ra sao',
      faqs,
      generateAnswer,
    });

    expect(result.source).toBe('unanswered');
    expect(result.answer).toMatch(/chưa tìm thấy/i);
    expect(result.canCreateTicket).toBe(true);
    expect(result.matchedFaqs.length).toBeGreaterThan(0);
    expect(generateAnswer).not.toHaveBeenCalled();
  });
});
