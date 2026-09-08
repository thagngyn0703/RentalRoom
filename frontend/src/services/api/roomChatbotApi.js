import axios from '../../config/axios';

export const askChatbot = async (question) => {
  const response = await axios.post('/api/chatbot/ask', { question });
  return response.data;
};
