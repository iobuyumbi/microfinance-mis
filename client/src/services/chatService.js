import api from "./api";
import { handleRequest } from "./handleRequest";

export const chatService = {
  // Get available chat channels
  getChatChannels: () => handleRequest(() => api.get("/chat/channels")),

  // Get chat messages
  getChatMessages: (params) =>
    handleRequest(() => api.get("/chat/messages", { params })),

  // Send a new message
  sendMessage: (messageData) =>
    handleRequest(() => api.post("/chat/messages", messageData)),

  // Edit a message
  editMessage: (messageId, messageData) =>
    handleRequest(() => api.put(`/chat/messages/${messageId}`, messageData)),

  // Delete a message
  deleteMessage: (messageId) =>
    handleRequest(() => api.delete(`/chat/messages/${messageId}`)),

  // Mark messages as read
  markAsRead: (readData) =>
    handleRequest(() => api.post("/chat/messages/read", readData)),

  // Get chat statistics
  getChatStats: (params) =>
    handleRequest(() => api.get("/chat/stats", { params })),
};
