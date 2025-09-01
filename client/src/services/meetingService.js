
import apiClient from './api/client';

const ENDPOINTS = {
  MEETINGS: '/meetings',
  MEETINGS_STATS: '/meetings/stats',
  MEETINGS_BY_ID: (id) => `/meetings/${id}`,
  MEETINGS_STATUS: (id) => `/meetings/${id}/status`,
  MEETINGS_ATTENDANCE: (id) => `/meetings/${id}/attendance`
};

export const meetingService = {
  // Get all meetings
  async getAll(params = {}) {
    const response = await apiClient.get(ENDPOINTS.MEETINGS, { params });
    return response.data;
  },

  // Get meeting statistics
  async getStats() {
    const response = await apiClient.get(ENDPOINTS.MEETINGS_STATS);
    return response.data;
  },

  // Get meeting by ID
  async getById(id) {
    const response = await apiClient.get(ENDPOINTS.MEETINGS_BY_ID(id));
    return response.data;
  },

  // Create new meeting
  async create(meetingData) {
    const response = await apiClient.post(ENDPOINTS.MEETINGS, meetingData);
    return response.data;
  },

  // Update meeting
  async update(id, meetingData) {
    const response = await apiClient.put(ENDPOINTS.MEETINGS_BY_ID(id), meetingData);
    return response.data;
  },

  // Delete meeting
  async delete(id) {
    const response = await apiClient.delete(ENDPOINTS.MEETINGS_BY_ID(id));
    return response.data;
  },

  // Update meeting status
  async updateStatus(id, statusData) {
    const response = await apiClient.patch(ENDPOINTS.MEETINGS_STATUS(id), statusData);
    return response.data;
  },

  // Get meetings by group
  async getByGroup(groupId) {
    const response = await apiClient.get(ENDPOINTS.MEETINGS, { 
      params: { group: groupId } 
    });
    return response.data;
  },

  // Get upcoming meetings
  async getUpcoming() {
    const response = await apiClient.get(ENDPOINTS.MEETINGS, { 
      params: { upcoming: true, status: 'scheduled' } 
    });
    return response.data;
  },

  // Record attendance
  async recordAttendance(id, attendanceData) {
    const response = await apiClient.post(ENDPOINTS.MEETINGS_ATTENDANCE(id), attendanceData);
    return response.data;
  },

  // Get attendance for a meeting
  async getAttendance(id) {
    const response = await apiClient.get(ENDPOINTS.MEETINGS_ATTENDANCE(id));
    return response.data;
  }
};

export default meetingService;
