import { api } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export const chatService = {
  getChatChannels: () => 
    api.get(ENDPOINTS.CHAT.CHANNELS),

  getChatMessages: (params) =>
    api.get(ENDPOINTS.CHAT.MESSAGES, { params }),

  sendMessage: (messageData) =>
    api.post(ENDPOINTS.CHAT.MESSAGES, messageData),

  editMessage: (messageId, messageData) =>
    api.put(ENDPOINTS.CHAT.MESSAGE(messageId), messageData),

  deleteMessage: (messageId) =>
    api.delete(ENDPOINTS.CHAT.MESSAGE(messageId)),

  markAsRead: (readData) =>
    api.post(ENDPOINTS.CHAT.MARK_READ, readData),

  getChatStats: (params) =>
    api.get(ENDPOINTS.CHAT.STATS, { params }),
};
