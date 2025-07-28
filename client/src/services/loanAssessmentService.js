import api from "./api";
import { handleRequest } from "./handleRequest";

export const loanAssessmentService = {
  // Create a new loan assessment
  createAssessment: (assessmentData) =>
    handleRequest(() => api.post("/loan-assessments", assessmentData)),

  // Get all assessments (filtered by role)
  getAssessments: (params) =>
    handleRequest(() => api.get("/loan-assessments", { params })),

  // Get assessment by ID
  getAssessmentById: (id) =>
    handleRequest(() => api.get(`/loan-assessments/${id}`)),

  // Update assessment status
  updateAssessmentStatus: (id, statusData) =>
    handleRequest(() => api.put(`/loan-assessments/${id}/status`, statusData)),

  // Get assessment statistics
  getAssessmentStats: (params) =>
    handleRequest(() => api.get("/loan-assessments/stats", { params })),

  // Quick assessment (real-time calculation)
  quickAssessment: (params) =>
    handleRequest(() => api.get("/loan-assessments/quick", { params })),
};
