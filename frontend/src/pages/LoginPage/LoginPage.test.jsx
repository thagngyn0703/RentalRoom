import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginPage from './LoginPage';

// This test exercises the form control, not the network authentication flow.
jest.mock('../../services/api/authApi', () => ({
  loginUser: () => { throw new Error('Password visibility must not submit login'); },
}));

test('password visibility control does not submit the form or clear its value', () => {
  const store = configureStore({ reducer: () => ({}) });
  render(<Provider store={store}><MemoryRouter><LoginPage /></MemoryRouter></Provider>);
  const password = screen.getByLabelText('Mật khẩu');
  fireEvent.change(password, { target: { value: 'example-only' } });
  const reveal = screen.getByRole('button', { name: 'Hiện mật khẩu' });
  expect(reveal).toHaveAttribute('type', 'button');
  fireEvent.click(reveal);
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('example-only');
  fireEvent.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
  expect(password).toHaveAttribute('type', 'password');
});
