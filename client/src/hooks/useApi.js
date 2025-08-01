import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

/**
 * Custom hook for API calls with loading states and error handling
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export const useApi = (apiCall, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
    immediate = false,
    initialData = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use ref to prevent stale closure issues
  const abortControllerRef = useRef(null);

  const execute = useCallback(
    async (...args) => {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const result = await apiCall(...args);
        setData(result);

        if (showSuccessToast && successMessage) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        // Don't set error if request was cancelled
        if (err.name === "AbortError") {
          return;
        }

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
        abortControllerRef.current = null;
      }
    },
    [
      apiCall,
      onSuccess,
      onError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
    ]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [initialData]);

  // Execute immediately if requested
  if (immediate && !loading && !data && !error) {
    execute();
  }

  return {
    data,
    loading,
    error,
    execute,
    reset,
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
