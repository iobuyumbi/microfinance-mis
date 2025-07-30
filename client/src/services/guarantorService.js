// src/services/guarantorService.js
import api from "./api";
import { handleRequest } from "./handleRequest"; // Assuming you have this utility

export const guarantorService = {
  /**
   * Creates a new guarantor entry.
   * @param {object} data - The guarantor data (loan, guarantor, amountGuaranteed, status).
   * @returns {Promise<object>} The created guarantor record.
   */
  create: (data) =>
    handleRequest(
      () => api.post("/guarantors", data),
      "Failed to create guarantor record"
    ),

  /**
   * Fetches all guarantor entries, optionally filtered.
   * @param {object} [params] - Query parameters for filtering (e.g., { loan: 'loanId' }).
   * @returns {Promise<Array>} A list of guarantor records.
   */
  getAll: (params) =>
    handleRequest(
      () => api.get("/guarantors", { params }),
      "Failed to fetch guarantor records"
    ),

  /**
   * Fetches a single guarantor entry by ID.
   * @param {string} id - The ID of the guarantor record.
   * @returns {Promise<object>} The guarantor record.
   */
  getById: (id) =>
    handleRequest(
      () => api.get(`/guarantors/${id}`),
      "Failed to fetch guarantor record by ID"
    ),

  /**
   * Updates an existing guarantor entry.
   * @param {string} id - The ID of the guarantor record to update.
   * @param {object} data - The update data (e.g., { status: 'approved' }).
   * @returns {Promise<object>} The updated guarantor record.
   */
  update: (id, data) =>
    handleRequest(
      () => api.put(`/guarantors/${id}`, data),
      "Failed to update guarantor record"
    ),

  /**
   * Soft deletes (revokes/inactivates) a guarantor entry.
   * @param {string} id - The ID of the guarantor record to delete.
   * @returns {Promise<object>} Confirmation of deletion.
   */
  delete: (id) =>
    handleRequest(
      () => api.delete(`/guarantors/${id}`),
      "Failed to delete guarantor record"
    ),
};
