import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme/theme';
import AdminLayout from './AdminLayout';

test('mobile navigation opens, changes page and closes after selection', async () => {
  render(<ThemeProvider theme={theme}><MemoryRouter initialEntries={['/admin/bookings']}>
    <Routes><Route path="/admin" element={<AdminLayout />}>
      <Route path="bookings" element={<p>Danh sách đặt phòng thử nghiệm</p>} />
      <Route path="posts" element={<p>Danh sách bài đăng thử nghiệm</p>} />
    </Route></Routes>
  </MemoryRouter></ThemeProvider>);
  expect(screen.getByText('Danh sách đặt phòng thử nghiệm')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Mở menu quản trị' }));
  fireEvent.click(screen.getByRole('button', { name: 'Quản lý bài đăng' }));
  expect(screen.getByText('Danh sách bài đăng thử nghiệm')).toBeVisible();
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Đóng menu quản trị' })).not.toBeInTheDocument());
});
