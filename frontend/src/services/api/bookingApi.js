import axiosJWT from '../../config/axiosJWT';

export const checkAvailability = async ({ roomId, startDate, endDate }) => {
  const params = new URLSearchParams({ roomId, startDate, endDate });
  const res = await axiosJWT.get(`/api/bookings/availability?${params.toString()}`);
  return res.data;
};

export const getMyBookings = async () => {
  const res = await axiosJWT.get('/api/bookings/my');
  return res.data;
};

export const getMyBookingById = async (bookingId) => {
  const res = await axiosJWT.get(`/api/bookings/my/${bookingId}`);
  return res.data;
};
