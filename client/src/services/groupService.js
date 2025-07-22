import api from './api';

export const groupService = {
  getAll: (params) => api.get('/groups', { params }).then(res => res.data),
  getById: (id) => api.get(`/groups/${id}`).then(res => res.data),
  create: (data) => api.post('/groups', data).then(res => res.data),
  update: (id, data) => api.put(`/groups/${id}`, data).then(res => res.data),
  remove: (id) => api.delete(`/groups/${id}`).then(res => res.data),
}; 