import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserSidebar from '../UserSidebar';
import axiosJWT from '../../../config/axiosJWT';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

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
  it('loads balance and islandor badge', async () => {
    // mock history/mine
    axiosJWT.get.mockImplementation((url) => {
      if (url === '/api/payments/history/mine') {
        return Promise.resolve({ data: { success: true, items: [
          { status: 'completed', type: 'in', amount: 100000 },
          { status: 'completed', type: 'out', amount: 20000 }
        ] } });
      }
      if (url === '/api/payments/islandor') {
        const future = new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString();
        return Promise.resolve({ data: { success: true, isActive: true, expiresAt: future } });
      }
      return Promise.resolve({ data: {} });
    });

    renderWithStore(<UserSidebar />);

    // wallet chip should show computed balance 80000
    await screen.findByText(/Số dư:/i);
    expect(screen.getByText(/80,000/)).toBeInTheDocument();

    // islandor badge should appear (text like '5h' or 'Đang hoạt động')
    await screen.findByText(/Đang hoạt động|h|m/);
  });
});
