import axiosJWT from '../../config/axiosJWT';

export const FavoriteApi = {
  getMyFavorites: async () => {
    const res = await axiosJWT.get('/api/favorites');
    return res.data;
  },
  addFavorite: async (roomId) => {
    const res = await axiosJWT.post(`/api/favorites/${roomId}`);
    return res.data;
  },
  removeFavorite: async (roomId) => {
    const res = await axiosJWT.delete(`/api/favorites/${roomId}`);
    return res.data;
  },
  countMyFavorites: async () => {
    const res = await axiosJWT.get('/api/favorites/count/me');
    return res.data;
  }
};


