import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ToastProvider } from '../../Components/ToastProvider';
import HomeLanding from './HomeLanding';

jest.mock('../../services/api', () => ({ FavoriteApi: {} }));
jest.mock('../../services/api/postApi', () => ({
  fetchHomeData: async () => ({ latestPosts: [{ id: 'r1', roomId: 'r1', title: 'Phòng mới', thumbnail: '/room.jpg' }] }),
  fetchHomeSummary: async (ids) => {
    if (ids.join() !== 'r1') throw Error('Must request statistics only for visible rooms');
    return { recommendedRooms: [{ id: 'r2', title: 'Phòng gợi ý', rating: 4 }], regions: [], roomStats: { r1: { avgStars: 5, starsVotes: 2 } } };
  },
}));

test('renders home cards from compact responses and defers thumbnail downloads', async () => {
  const store = configureStore({ reducer: () => ({}) });
  render(<Provider store={store}><MemoryRouter><ToastProvider><HomeLanding /></ToastProvider></MemoryRouter></Provider>);
  await waitFor(() => expect(screen.getByText('Phòng gợi ý')).toBeInTheDocument());
  expect(screen.getByText('Phòng mới')).toBeInTheDocument();
  expect(screen.getByAltText('Phòng mới')).toHaveAttribute('loading', 'lazy');
});
