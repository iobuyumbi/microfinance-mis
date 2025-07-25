import api from './api';
import { handleRequest } from './handleRequest';

export const authService = {
  register: (data) =>
    handleRequest(() => api.post('/auth/register', data), 'Failed to register'),

  login: async (credentials) => {
    const data = await handleRequest(
      () => api.post('/auth/login', credentials),
      'Failed to login'
    );

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getMe: () =>
    handleRequest(() => api.get('/auth/me'), 'Failed to fetch authenticated user'),

  forgotPassword: (data) =>
    handleRequest(() => api.post('/auth/forgot-password', data), 'Failed to send reset email'),

  resetPassword: (token, data) =>
    handleRequest(() => api.post(`/auth/reset-password/${token}`, data), 'Failed to reset password'),
};
