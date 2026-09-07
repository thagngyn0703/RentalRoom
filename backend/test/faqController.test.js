const { createFaqController } = require('../controllers/faqController');

const makeResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('FAQ controller', () => {
  test('public list only returns active FAQs', async () => {
    const query = {
      sort: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue([{ question: 'Đặt phòng thế nào?' }]),
    };
    const Faq = { find: jest.fn(() => query) };
    const controller = createFaqController({ Faq, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.listPublic({}, res);

    expect(Faq.find).toHaveBeenCalledWith({ isActive: true });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ question: 'Đặt phòng thế nào?' }] });
  });

  test('rejects an empty chatbot question', async () => {
    const controller = createFaqController({ Faq: {}, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.ask({ body: { question: '   ' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('rejects a chatbot question longer than 500 characters', async () => {
    const controller = createFaqController({ Faq: {}, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.ask({ body: { question: 'a'.repeat(501) } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('creates a normalized FAQ for an admin', async () => {
    const created = { _id: 'faq-1' };
    const Faq = { create: jest.fn().mockResolvedValue(created) };
    const controller = createFaqController({ Faq, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.create({
      user: { id: 'admin-1' },
      body: {
        question: '  Thanh toán thế nào? ',
        answer: '  Quét mã QR. ',
        keywords: [' QR ', 'qr', ' thanh toán '],
        category: ' payment ',
        priority: 3,
      },
    }, res);

    expect(Faq.create).toHaveBeenCalledWith(expect.objectContaining({
      question: 'Thanh toán thế nào?',
      answer: 'Quét mã QR.',
      keywords: ['QR', 'thanh toán'],
      category: 'payment',
      createdBy: 'admin-1',
      updatedBy: 'admin-1',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('rejects admin FAQ creation without question or answer', async () => {
    const Faq = { create: jest.fn() };
    const controller = createFaqController({ Faq, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.create({ user: { id: 'admin-1' }, body: { question: '', answer: '' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Faq.create).not.toHaveBeenCalled();
  });

  test('rejects admin FAQ fields outside their supported limits', async () => {
    const Faq = { create: jest.fn() };
    const controller = createFaqController({ Faq, generateGroundedAnswer: jest.fn() });
    const res = makeResponse();

    await controller.create({
      user: { id: 'admin-1' },
      body: { question: 'q'.repeat(301), answer: 'answer', priority: 101 },
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Faq.create).not.toHaveBeenCalled();
  });
});
