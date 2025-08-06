import { useState, useCallback, useRef } from "react";
import { api } from "@/services/api/client";
import { ENDPOINTS, buildUrl } from "@/services/api/endpoints";
import { toast } from "sonner";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const executeRequest = useCallback(async (requestFn, options = {}) => {
    const { showToast = true, toastMessage = null } = options;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await requestFn(abortControllerRef.current.signal);

      if (showToast && toastMessage) {
        toast.success(toastMessage);
      }

      return { success: true, data: response };
    } catch (err) {
      if (err.name === "AbortError") {
        return { success: false, aborted: true };
      }

      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);

      if (showToast) {
        toast.error(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Generic CRUD operations
  const get = useCallback(
    (endpoint, params = {}, options = {}) => {
      return executeRequest(
        (signal) => api.get(buildUrl(endpoint, params), { signal }),
        options
      );
    },
    [executeRequest]
  );

  const post = useCallback(
    (endpoint, data = {}, options = {}) => {
      return executeRequest(
        (signal) => api.post(endpoint, data, { signal }),
        options
      );
    },
    [executeRequest]
  );

  const put = useCallback(
    (endpoint, data = {}, options = {}) => {
      return executeRequest(
        (signal) => api.put(endpoint, data, { signal }),
        options
      );
    },
    [executeRequest]
  );

  const patch = useCallback(
    (endpoint, data = {}, options = {}) => {
      return executeRequest(
        (signal) => api.patch(endpoint, data, { signal }),
        options
      );
    },
    [executeRequest]
  );

  const del = useCallback(
    (endpoint, options = {}) => {
      return executeRequest(
        (signal) => api.delete(endpoint, { signal }),
        options
      );
    },
    [executeRequest]
  );

  const upload = useCallback(
    (endpoint, file, onProgress, options = {}) => {
      return executeRequest(
        (signal) => api.upload(endpoint, file, onProgress, { signal }),
        options
      );
    },
    [executeRequest]
  );

  // Entity-specific API methods
  const apiMethods = {
    // Users
    getUsers: (params) => get(ENDPOINTS.USERS.BASE, params),
    getUser: (id) => get(ENDPOINTS.USERS.BY_ID(id)),
    createUser: (data) =>
      post(ENDPOINTS.USERS.BASE, data, {
        toastMessage: "User created successfully",
      }),
    updateUser: (id, data) =>
      put(ENDPOINTS.USERS.BY_ID(id), data, {
        toastMessage: "User updated successfully",
      }),
    deleteUser: (id) =>
      del(ENDPOINTS.USERS.BY_ID(id), {
        toastMessage: "User deleted successfully",
      }),

    // Members
    getMembers: (params) => get(ENDPOINTS.MEMBERS.BASE, params),
    getMember: (id) => get(ENDPOINTS.MEMBERS.BY_ID(id)),
    createMember: (data) =>
      post(ENDPOINTS.MEMBERS.BASE, data, {
        toastMessage: "Member created successfully",
      }),
    updateMember: (id, data) =>
      put(ENDPOINTS.MEMBERS.BY_ID(id), data, {
        toastMessage: "Member updated successfully",
      }),
    deleteMember: (id) =>
      del(ENDPOINTS.MEMBERS.BY_ID(id), {
        toastMessage: "Member deleted successfully",
      }),

    // Groups
    getGroups: (params) => get(ENDPOINTS.GROUPS.BASE, params),
    getGroup: (id) => get(ENDPOINTS.GROUPS.BY_ID(id)),
    createGroup: (data) =>
      post(ENDPOINTS.GROUPS.BASE, data, {
        toastMessage: "Group created successfully",
      }),
    updateGroup: (id, data) =>
      put(ENDPOINTS.GROUPS.BY_ID(id), data, {
        toastMessage: "Group updated successfully",
      }),
    deleteGroup: (id) =>
      del(ENDPOINTS.GROUPS.BY_ID(id), {
        toastMessage: "Group deleted successfully",
      }),
    getGroupMembers: (groupId) => get(ENDPOINTS.GROUPS.MEMBERS(groupId)),

    // Loans
    getLoans: (params) => get(ENDPOINTS.LOANS.BASE, params),
    getLoan: (id) => get(ENDPOINTS.LOANS.BY_ID(id)),
    createLoan: (data) =>
      post(ENDPOINTS.LOANS.APPLY, data, {
        toastMessage: "Loan application submitted successfully",
      }),
    updateLoan: (id, data) =>
      put(ENDPOINTS.LOANS.BY_ID(id), data, {
        toastMessage: "Loan updated successfully",
      }),
    deleteLoan: (id) =>
      del(ENDPOINTS.LOANS.BY_ID(id), {
        toastMessage: "Loan deleted successfully",
      }),
    approveLoan: (id) =>
      post(
        ENDPOINTS.LOANS.APPROVE(id),
        {},
        { toastMessage: "Loan approved successfully" }
      ),
    rejectLoan: (id) =>
      post(
        ENDPOINTS.LOANS.REJECT(id),
        {},
        { toastMessage: "Loan rejected successfully" }
      ),
    disburseLoan: (id) =>
      post(
        ENDPOINTS.LOANS.DISBURSE(id),
        {},
        { toastMessage: "Loan disbursed successfully" }
      ),

    // Savings
    getSavings: (params) => get(ENDPOINTS.SAVINGS.BASE, params),
    getSaving: (id) => get(ENDPOINTS.SAVINGS.BY_ID(id)),
    createSaving: (data) =>
      post(ENDPOINTS.SAVINGS.BASE, data, {
        toastMessage: "Savings account created successfully",
      }),
    updateSaving: (id, data) =>
      put(ENDPOINTS.SAVINGS.BY_ID(id), data, {
        toastMessage: "Savings updated successfully",
      }),
    deleteSaving: (id) =>
      del(ENDPOINTS.SAVINGS.BY_ID(id), {
        toastMessage: "Savings deleted successfully",
      }),
    depositSavings: (id, data) =>
      post(ENDPOINTS.SAVINGS.DEPOSIT(id), data, {
        toastMessage: "Deposit successful",
      }),
    withdrawSavings: (id, data) =>
      post(ENDPOINTS.SAVINGS.WITHDRAW(id), data, {
        toastMessage: "Withdrawal successful",
      }),

    // Transactions
    getTransactions: (params) => get(ENDPOINTS.TRANSACTIONS.BASE, params),
    getTransaction: (id) => get(ENDPOINTS.TRANSACTIONS.BY_ID(id)),
    createTransaction: (data) =>
      post(ENDPOINTS.TRANSACTIONS.BASE, data, {
        toastMessage: "Transaction created successfully",
      }),
    updateTransaction: (id, data) =>
      put(ENDPOINTS.TRANSACTIONS.BY_ID(id), data, {
        toastMessage: "Transaction updated successfully",
      }),
    deleteTransaction: (id) =>
      del(ENDPOINTS.TRANSACTIONS.BY_ID(id), {
        toastMessage: "Transaction deleted successfully",
      }),

    // Accounts
    getAccounts: (params) => get(ENDPOINTS.ACCOUNTS.BASE, params),
    getAccount: (id) => get(ENDPOINTS.ACCOUNTS.BY_ID(id)),
    createAccount: (data) =>
      post(ENDPOINTS.ACCOUNTS.CREATE, data, {
        toastMessage: "Account created successfully",
      }),
    updateAccount: (id, data) =>
      put(ENDPOINTS.ACCOUNTS.UPDATE(id), data, {
        toastMessage: "Account updated successfully",
      }),
    deleteAccount: (id) =>
      del(ENDPOINTS.ACCOUNTS.DELETE(id), {
        toastMessage: "Account deleted successfully",
      }),

    // Meetings
    getMeetings: (params) => get(ENDPOINTS.MEETINGS.BASE, params),
    getMeeting: (id) => get(ENDPOINTS.MEETINGS.BY_ID(id)),
    createMeeting: (data) =>
      post(ENDPOINTS.MEETINGS.BASE, data, {
        toastMessage: "Meeting created successfully",
      }),
    updateMeeting: (id, data) =>
      put(ENDPOINTS.MEETINGS.BY_ID(id), data, {
        toastMessage: "Meeting updated successfully",
      }),
    deleteMeeting: (id) =>
      del(ENDPOINTS.MEETINGS.BY_ID(id), {
        toastMessage: "Meeting deleted successfully",
      }),
    markAttendance: (id, data) =>
      post(ENDPOINTS.MEETINGS.MARK_ATTENDANCE(id), data, {
        toastMessage: "Attendance marked successfully",
      }),

    // Notifications
    getNotifications: (params) => get(ENDPOINTS.NOTIFICATIONS.BASE, params),
    getNotification: (id) => get(ENDPOINTS.NOTIFICATIONS.BY_ID(id)),
    markNotificationRead: (id) =>
      post(
        ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        {},
        { toastMessage: "Notification marked as read" }
      ),
    markAllNotificationsRead: () =>
      post(
        ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        {},
        { toastMessage: "All notifications marked as read" }
      ),
    getUnreadCount: () => get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),

    // Reports
    getReports: (params) => get(ENDPOINTS.REPORTS.BASE, params),
    getDashboardReport: () => get(ENDPOINTS.REPORTS.DASHBOARD),
    getLoanReport: (params) => get(ENDPOINTS.REPORTS.LOANS, params),
    getSavingsReport: (params) => get(ENDPOINTS.REPORTS.SAVINGS, params),
    getTransactionReport: (params) =>
      get(ENDPOINTS.REPORTS.TRANSACTIONS, params),
    getMemberReport: (params) => get(ENDPOINTS.REPORTS.MEMBERS, params),
    getGroupReport: (params) => get(ENDPOINTS.REPORTS.GROUPS, params),
    exportReport: (type, format) =>
      get(ENDPOINTS.REPORTS.EXPORT(type), { format }),

    // Settings
    getSettings: () => get(ENDPOINTS.SETTINGS.BASE),
    updateSettings: (data) =>
      put(ENDPOINTS.SETTINGS.BASE, data, {
        toastMessage: "Settings updated successfully",
      }),

    // Chat
    getChatMessages: (chatId, params) =>
      get(ENDPOINTS.CHAT.MESSAGES(chatId), params),
    sendMessage: (chatId, data) =>
      post(ENDPOINTS.CHAT.SEND_MESSAGE(chatId), data, {
        toastMessage: "Message sent successfully",
      }),
    markChatRead: (chatId) =>
      post(ENDPOINTS.CHAT.MARK_READ(chatId), {}, { showToast: false }),

    // Guarantors
    getGuarantors: (params) => get(ENDPOINTS.GUARANTORS.BASE, params),
    getGuarantor: (id) => get(ENDPOINTS.GUARANTORS.BY_ID(id)),
    createGuarantor: (data) =>
      post(ENDPOINTS.GUARANTORS.BASE, data, {
        toastMessage: "Guarantor added successfully",
      }),
    updateGuarantor: (id, data) =>
      put(ENDPOINTS.GUARANTORS.BY_ID(id), data, {
        toastMessage: "Guarantor updated successfully",
      }),
    deleteGuarantor: (id) =>
      del(ENDPOINTS.GUARANTORS.BY_ID(id), {
        toastMessage: "Guarantor removed successfully",
      }),
    approveGuarantor: (id) =>
      post(
        ENDPOINTS.GUARANTORS.APPROVE(id),
        {},
        { toastMessage: "Guarantor approved successfully" }
      ),
    rejectGuarantor: (id) =>
      post(
        ENDPOINTS.GUARANTORS.REJECT(id),
        {},
        { toastMessage: "Guarantor rejected successfully" }
      ),

    // Contributions
    getContributions: (params) => get(ENDPOINTS.CONTRIBUTIONS.BASE, params),
    getContribution: (id) => get(ENDPOINTS.CONTRIBUTIONS.BY_ID(id)),
    createContribution: (data) =>
      post(ENDPOINTS.CONTRIBUTIONS.BASE, data, {
        toastMessage: "Contribution recorded successfully",
      }),
    updateContribution: (id, data) =>
      put(ENDPOINTS.CONTRIBUTIONS.BY_ID(id), data, {
        toastMessage: "Contribution updated successfully",
      }),
    deleteContribution: (id) =>
      del(ENDPOINTS.CONTRIBUTIONS.BY_ID(id), {
        toastMessage: "Contribution deleted successfully",
      }),
    getGroupContributions: (groupId) =>
      get(ENDPOINTS.CONTRIBUTIONS.BY_GROUP(groupId)),
    getMemberContributions: (memberId) =>
      get(ENDPOINTS.CONTRIBUTIONS.BY_MEMBER(memberId)),
    bulkImportContributions: (groupId, data) =>
      post(ENDPOINTS.CONTRIBUTIONS.BULK_IMPORT(groupId), data, {
        toastMessage: "Contributions imported successfully",
      }),

    // Repayments
    getRepayments: (params) => get(ENDPOINTS.REPAYMENTS.BASE, params),
    getRepayment: (id) => get(ENDPOINTS.REPAYMENTS.BY_ID(id)),
    createRepayment: (data) =>
      post(ENDPOINTS.REPAYMENTS.BASE, data, {
        toastMessage: "Repayment recorded successfully",
      }),
    updateRepayment: (id, data) =>
      put(ENDPOINTS.REPAYMENTS.BY_ID(id), data, {
        toastMessage: "Repayment updated successfully",
      }),
    deleteRepayment: (id) =>
      del(ENDPOINTS.REPAYMENTS.BY_ID(id), {
        toastMessage: "Repayment deleted successfully",
      }),
    getLoanRepayments: (loanId) => get(ENDPOINTS.REPAYMENTS.BY_LOAN(loanId)),
    getRepaymentSchedule: (loanId) =>
      get(ENDPOINTS.REPAYMENTS.SCHEDULE(loanId)),
    voidRepayment: (id) =>
      post(
        ENDPOINTS.REPAYMENTS.VOID(id),
        {},
        { toastMessage: "Repayment voided successfully" }
      ),

    // Loan Assessments
    getLoanAssessments: (params) =>
      get(ENDPOINTS.LOAN_ASSESSMENTS.BASE, params),
    getLoanAssessment: (id) => get(ENDPOINTS.LOAN_ASSESSMENTS.BY_ID(id)),
    createLoanAssessment: (data) =>
      post(ENDPOINTS.LOAN_ASSESSMENTS.BASE, data, {
        toastMessage: "Assessment created successfully",
      }),
    updateLoanAssessment: (id, data) =>
      put(ENDPOINTS.LOAN_ASSESSMENTS.BY_ID(id), data, {
        toastMessage: "Assessment updated successfully",
      }),
    deleteLoanAssessment: (id) =>
      del(ENDPOINTS.LOAN_ASSESSMENTS.BY_ID(id), {
        toastMessage: "Assessment deleted successfully",
      }),
    getAssessmentStats: () => get(ENDPOINTS.LOAN_ASSESSMENTS.STATS),
    quickAssessment: (data) =>
      post(ENDPOINTS.LOAN_ASSESSMENTS.QUICK, data, {
        toastMessage: "Quick assessment completed",
      }),

    // Health
    getHealthStatus: () => get(ENDPOINTS.HEALTH.STATUS),
  };

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    loading,
    error,
    ...apiMethods,
    cancelRequest,
    // Generic methods
    get,
    post,
    put,
    patch,
    del,
    upload,
  };
};

/**
 * Custom hook for paginated API calls
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, loadMore, hasMore, reset }
 */
export const usePaginatedApi = (apiCall, options = {}) => {
  const {
    pageSize = 10,
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const execute = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      setPage(1);

      try {
        const result = await apiCall({ ...params, page: 1, limit: pageSize });

        const newData = result.data || result;
        const totalCount = result.total || result.count || newData.length;

        setData(newData);
        setTotal(totalCount);
        setHasMore(newData.length === pageSize);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMsg = errorMessage || err.message || "An error occurred";
        setError(errorMsg);

        if (showErrorToast) {
          toast.error(errorMsg);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiCall,
      pageSize,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
    ]
  );

  const loadMore = useCallback(
    async (params = {}) => {
      if (loading || !hasMore) return;

      setLoading(true);
      setError(null);

      try {
        const nextPage = page + 1;
        const result = await apiCall({
          ...params,
          page: nextPage,
          limit: pageSize,
        });

        const newData = result.data || result;
        const totalCount =
          result.total || result.count || data.length + newData.length;

        setData((prev) => [...prev, ...newData]);
        setPage(nextPage);
        setTotal(totalCount);
        setHasMore(newData.length === pageSize);

        return result;
      } catch (err) {
        const errorMsg = errorMessage || err.message || "An error occurred";
        setError(errorMsg);

        if (showErrorToast) {
          toast.error(errorMsg);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      apiCall,
      page,
      pageSize,
      data.length,
      hasMore,
      loading,
      onError,
      showErrorToast,
      errorMessage,
    ]
  );

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setPage(1);
    setHasMore(true);
    setTotal(0);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    loadMore,
    hasMore,
    total,
    page,
    reset,
  };
};

/**
 * Custom hook for infinite scroll
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, loadMore, hasMore, reset }
 */
export const useInfiniteScroll = (apiCall, options = {}) => {
  const paginatedApi = usePaginatedApi(apiCall, options);

  return {
    ...paginatedApi,
    // Add infinite scroll specific methods if needed
  };
};

export default useApi;
