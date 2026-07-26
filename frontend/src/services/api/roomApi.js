import axiosJWT from '../../../config/axiosJWT';

export const getMyRooms = async () => {
  const res = await axiosJWT.get('/api/rooms?mine=1');
  return res.data;
};
