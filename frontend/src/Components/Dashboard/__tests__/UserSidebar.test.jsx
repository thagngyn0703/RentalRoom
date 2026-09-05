import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserSidebar from '../UserSidebar';
import axiosJWT from '../../../config/axiosJWT';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    defaults: {},
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../../../config/axiosJWT');

const mockAuthReducer = (state = { login: { currentUser: { _id: 'u1', id: 'u1', role: 'admin' } } }, action) => state;

function renderWithStore(ui) {
  const store = configureStore({ reducer: { auth: mockAuthReducer } });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </Provider>
  );
}

describe('UserSidebar', () => {
  it('loads wallet balance and islandor status', async () => {
    axiosJWT.get.mockImplementation((url) => {
      if (url === '/api/payments/wallet') {
        return Promise.resolve({ data: { success: true, wallet: { balance: 80000 } } });
      }
      if (url === '/api/payments/islandor') {
        return Promise.resolve({ data: { success: true, isActive: false, expiresAt: null } });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithStore(<UserSidebar />);

    await waitFor(() => {
      expect(screen.getAllByText(/Số dư:\s*80[.,]000\s*đ/i)).toHaveLength(2);
    });

    expect(axiosJWT.get).toHaveBeenCalledWith('/api/payments/islandor');
  });
});
