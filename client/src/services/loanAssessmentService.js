import { api } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export const loanAssessmentService = {
  createAssessment: (assessmentData) =>
    api.post(ENDPOINTS.LOAN_ASSESSMENTS.BASE, assessmentData),

  getAssessments: (params) =>
    api.get(ENDPOINTS.LOAN_ASSESSMENTS.BASE, { params }),

  getAssessmentById: (id) => api.get(ENDPOINTS.LOAN_ASSESSMENTS.BY_ID(id)),

  updateAssessmentStatus: (id, statusData) =>
    api.put(ENDPOINTS.LOAN_ASSESSMENTS.STATUS(id), statusData),

  getAssessmentStats: (params) =>
    api.get(ENDPOINTS.LOAN_ASSESSMENTS.STATS, { params }),

  quickAssessment: (params) =>
    api.get(ENDPOINTS.LOAN_ASSESSMENTS.QUICK, { params }),
};
