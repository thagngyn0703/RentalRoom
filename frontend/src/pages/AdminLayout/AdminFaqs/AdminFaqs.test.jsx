import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminFaqs from './AdminFaqs';
import { getAdminFaqs } from '../../../services/api/faqChatbotApi';

jest.mock('../../../services/api/faqChatbotApi', () => ({
  getAdminFaqs: jest.fn(),
  createFaq: jest.fn(),
  updateFaq: jest.fn(),
  updateFaqStatus: jest.fn(),
  deleteFaq: jest.fn(),
}));

test('loads FAQs into the admin management table', async () => {
  getAdminFaqs.mockResolvedValue({
    data: [{
      _id: 'faq-1',
      question: 'Thanh toán tiền thuê thế nào?',
      answer: 'Quét mã QR.',
      keywords: ['thanh toán'],
      category: 'payment',
      priority: 5,
      isActive: true,
    }],
    pagination: { page: 1, pages: 1, total: 1 },
  });

  render(<AdminFaqs />);

  expect(await screen.findByText('Thanh toán tiền thuê thế nào?')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /quản lý faq/i })).toBeInTheDocument();
});
