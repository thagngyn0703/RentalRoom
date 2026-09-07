const { GoogleGenAI } = require('@google/genai');

const withTimeout = (promise, timeoutMs) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini timeout')), timeoutMs)),
]);

async function generateGroundedAnswer({ question, faqs }) {
  const apiKey = process.env.APIGeminiKey;
  if (!apiKey) throw new Error('Gemini is not configured');

  const approvedContext = faqs.map(({ question: faqQuestion, answer, category }) => ({
    question: faqQuestion,
    answer,
    category,
  }));
  const prompt = `Bạn là trợ lý FAQ của nền tảng phòng trọ. Chỉ được trả lời bằng thông tin trong FAQ đã duyệt bên dưới. Không suy đoán, không tư vấn pháp lý và không xác nhận giao dịch. Nếu FAQ không đủ thông tin, trả lời đúng chuỗi KHONG_DU_THONG_TIN.\n\nCâu hỏi: ${JSON.stringify(question)}\nFAQ đã duyệt: ${JSON.stringify(approvedContext)}\n\nTrả lời ngắn gọn bằng tiếng Việt, không dùng Markdown.`;
  const ai = new GoogleGenAI({ apiKey });
  const result = await withTimeout(ai.models.generateContent({
    model: process.env.CHATBOT_GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
  }), Number(process.env.CHATBOT_GEMINI_TIMEOUT_MS) || 8000);
  const text = typeof result?.text === 'string' ? result.text.trim() : '';
  if (!text || text === 'KHONG_DU_THONG_TIN') throw new Error('Gemini returned no grounded answer');
  return text;
}

module.exports = { generateGroundedAnswer };
