import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FaqChatbot from './FaqChatbot';
import { askChatbot, getPublicFaqs } from '../../services/api/faqChatbotApi';

jest.mock('../../services/api/faqChatbotApi', () => ({
  askChatbot: jest.fn(),
  getPublicFaqs: jest.fn(),
}), { virtual: true });

jest.mock('react-redux', () => ({
  useSelector: (selector) => selector({ auth: { login: { currentUser: null } } }),
}));

const renderChatbot = () => render(
  <MemoryRouter initialEntries={['/rooms']}>
    <Routes>
      <Route path="*" element={<FaqChatbot />} />
      <Route path="/login" element={<div>Trang đăng nhập</div>} />
    </Routes>
  </MemoryRouter>,
);

beforeEach(() => {
  jest.clearAllMocks();
  getPublicFaqs.mockResolvedValue({
    data: [{ _id: 'faq-1', question: 'Thanh toán tiền thuê thế nào?', category: 'payment' }],
  });
});

test('opens from a floating button and answers a suggested FAQ', async () => {
  askChatbot.mockResolvedValue({
    answer: 'Mở mục Thanh toán và quét mã QR.',
    source: 'faq_exact',
    matchedFaqs: [],
    canCreateTicket: false,
  });
  renderChatbot();

  fireEvent.click(screen.getByRole('button', { name: /mở trợ lý/i }));
  const suggestion = await screen.findByRole('button', { name: 'Thanh toán tiền thuê thế nào?' });
  fireEvent.click(suggestion);

  expect(await screen.findByText('Mở mục Thanh toán và quét mã QR.')).toBeInTheDocument();
  expect(askChatbot).toHaveBeenCalledWith('Thanh toán tiền thuê thế nào?');
});

test('routes a guest to login when an unanswered question needs a ticket', async () => {
  askChatbot.mockResolvedValue({
    answer: 'Tôi chưa tìm thấy câu trả lời chắc chắn.',
    source: 'unanswered',
    matchedFaqs: [],
    canCreateTicket: true,
  });
  renderChatbot();

  fireEvent.click(screen.getByRole('button', { name: /mở trợ lý/i }));
  fireEvent.change(screen.getByRole('textbox', { name: /câu hỏi/i }), { target: { value: 'Một câu chưa biết' } });
  fireEvent.click(screen.getByRole('button', { name: /gửi câu hỏi/i }));
  const ticketButton = await screen.findByRole('button', { name: /gửi yêu cầu hỗ trợ/i });
  fireEvent.click(ticketButton);

  await waitFor(() => expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument());
});
