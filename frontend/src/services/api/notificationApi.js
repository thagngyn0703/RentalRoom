// ...existing code...
import axiosJWT from '../../config/axiosJWT';

export async function getUnreadCount() {
  const res = await axiosJWT.get('/api/notifications/unread-count');
  return res.data?.count ?? 0;
}

export async function getNotifications(params = {}) {
  const { limit = 50, skip = 0, unreadOnly = false } = params;
  const res = await axiosJWT.get('/api/notifications', {
    params: { limit, skip, unreadOnly: unreadOnly ? 'true' : 'false' },
  });
  return res.data;
}

export async function markNotificationRead(id) {
  const res = await axiosJWT.patch(`/api/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await axiosJWT.patch('/api/notifications/read-all');
  return res.data;
}
