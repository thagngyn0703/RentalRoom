import axios from '../../config/axios';
import axiosJWT from '../../config/axiosJWT';

export const getPublicFaqs = async () => {
  const response = await axios.get('/api/faqs');
  return response.data;
};

export const askChatbot = async (question) => {
  const response = await axios.post('/api/chatbot/ask', { question });
  return response.data;
};

export const getAdminFaqs = async (params = {}) => {
  const response = await axiosJWT.get('/api/admin/faqs', { params });
  return response.data;
};

export const createFaq = async (payload) => {
  const response = await axiosJWT.post('/api/admin/faqs', payload);
  return response.data;
};

export const updateFaq = async (id, payload) => {
  const response = await axiosJWT.put(`/api/admin/faqs/${id}`, payload);
  return response.data;
};

export const updateFaqStatus = async (id, isActive) => {
  const response = await axiosJWT.patch(`/api/admin/faqs/${id}/status`, { isActive });
  return response.data;
};

export const deleteFaq = async (id) => {
  const response = await axiosJWT.delete(`/api/admin/faqs/${id}`);
  return response.data;
};
