import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RoomSearchChatbot from './RoomSearchChatbot';
import { askChatbot } from '../../services/api/roomChatbotApi';

jest.mock('../../services/api/roomChatbotApi', () => ({
  askChatbot: jest.fn(),
}), { virtual: true });

jest.mock('react-redux', () => ({
  useSelector: (selector) => selector({ auth: { login: { currentUser: null } } }),
}));

const renderChatbot = () => render(
  <MemoryRouter initialEntries={['/rooms']}>
    <Routes>
      <Route path="*" element={<RoomSearchChatbot />} />
      <Route path="/login" element={<div>Trang đăng nhập</div>} />
    </Routes>
  </MemoryRouter>,
);

beforeEach(() => jest.clearAllMocks());

test('opens from a floating button and shows Gemini room recommendations', async () => {
  askChatbot.mockResolvedValue({
    answer: 'Tôi tìm thấy 1 phòng phù hợp.',
    rooms: [{
      id: 'room-1',
      title: 'Phòng gần Đại học Quốc gia',
      price: 3500000,
      unit: 'VND',
      area: 28,
      address: '12 đường A, Thủ Đức',
      image: 'room.jpg',
      aiReason: 'Đúng khu vực và có máy lạnh.',
    }],
  });
  renderChatbot();

  fireEvent.click(screen.getByRole('button', { name: /mở trợ lý/i }));
  fireEvent.change(screen.getByRole('textbox', { name: /yêu cầu tìm phòng/i }), { target: { value: 'Tìm phòng gần Đại học Quốc gia' } });
  fireEvent.click(screen.getByRole('button', { name: /tìm phòng/i }));

  expect(await screen.findByText('Tôi tìm thấy 1 phòng phù hợp.')).toBeInTheDocument();
  expect(screen.getByText('Phòng gần Đại học Quốc gia')).toBeInTheDocument();
  expect(screen.getByText('Đúng khu vực và có máy lạnh.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /xem phòng/i })).toHaveAttribute('href', '/room/room-1');
  expect(askChatbot).toHaveBeenCalledWith('Tìm phòng gần Đại học Quốc gia');
});

test('routes a guest to login when Gemini cannot find a room and support is offered', async () => {
  askChatbot.mockResolvedValue({
    answer: 'Chưa tìm thấy phòng phù hợp.',
    rooms: [],
    canCreateTicket: true,
  });
  renderChatbot();

  fireEvent.click(screen.getByRole('button', { name: /mở trợ lý/i }));
  fireEvent.change(screen.getByRole('textbox', { name: /yêu cầu tìm phòng/i }), { target: { value: 'Tìm phòng không tồn tại' } });
  fireEvent.click(screen.getByRole('button', { name: /tìm phòng/i }));
  const ticketButton = await screen.findByRole('button', { name: /gửi yêu cầu hỗ trợ/i });
  fireEvent.click(ticketButton);

  await waitFor(() => expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument());
});
