import { renderHook, act } from "@testing-library/react";
import { useApi, usePaginatedApi, useInfiniteScroll } from "../useApi";
import { toast } from "sonner";

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API call function
const mockApiCall = jest.fn();

describe("useApi Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiCall.mockClear();
  });

  describe("useApi", () => {
    test("should handle successful API call", async () => {
      const mockData = { id: 1, name: "Test" };
      mockApiCall.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useApi(mockApiCall));

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });

    test("should handle API call error", async () => {
      const errorMessage = "API Error";
      mockApiCall.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApi(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(errorMessage);
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });

    test("should show success toast when enabled", async () => {
      const mockData = { id: 1, name: "Test" };
      mockApiCall.mockResolvedValue({ data: mockData });

      const { result } = renderHook(() =>
        useApi(mockApiCall, {
          showSuccessToast: true,
          successMessage: "Success!",
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(toast.success).toHaveBeenCalledWith("Success!");
    });

    test("should handle request cancellation", async () => {
      const { result } = renderHook(() => useApi(mockApiCall));

      const promise = act(async () => {
        return result.current.execute();
      });

      act(() => {
        result.current.cancel();
      });

      await promise;

      expect(result.current.loading).toBe(false);
    });
  });

  describe("usePaginatedApi", () => {
    test("should handle paginated data", async () => {
      const mockData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 20 },
      };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => usePaginatedApi(mockApiCall));

      await act(async () => {
        await result.current.fetchData({ page: 1, limit: 10 });
      });

      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.pagination).toEqual(mockData.pagination);
      expect(result.current.loading).toBe(false);
    });

    test("should handle next page", async () => {
      const mockData = {
        data: [{ id: 3 }, { id: 4 }],
        pagination: { page: 2, limit: 10, total: 20 },
      };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => usePaginatedApi(mockApiCall));

      await act(async () => {
        await result.current.fetchNextPage();
      });

      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.pagination.page).toBe(2);
    });

    test("should handle refresh", async () => {
      const mockData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 20 },
      };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => usePaginatedApi(mockApiCall));

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.pagination.page).toBe(1);
    });
  });

  describe("useInfiniteScroll", () => {
    test("should handle infinite scroll data", async () => {
      const mockData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 20, hasMore: true },
      };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => useInfiniteScroll(mockApiCall));

      await act(async () => {
        await result.current.fetchData({ page: 1, limit: 10 });
      });

      expect(result.current.data).toEqual(mockData.data);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.loading).toBe(false);
    });

    test("should append data for next page", async () => {
      const initialData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 20, hasMore: true },
      };
      const nextPageData = {
        data: [{ id: 3 }, { id: 4 }],
        pagination: { page: 2, limit: 10, total: 20, hasMore: false },
      };

      mockApiCall
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(nextPageData);

      const { result } = renderHook(() => useInfiniteScroll(mockApiCall));

      await act(async () => {
        await result.current.fetchData({ page: 1, limit: 10 });
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(result.current.data).toEqual([
        ...initialData.data,
        ...nextPageData.data,
      ]);
      expect(result.current.hasMore).toBe(false);
    });

    test("should handle no more data", async () => {
      const mockData = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, limit: 10, total: 20, hasMore: false },
      };
      mockApiCall.mockResolvedValue(mockData);

      const { result } = renderHook(() => useInfiniteScroll(mockApiCall));

      await act(async () => {
        await result.current.fetchData({ page: 1, limit: 10 });
      });

      expect(result.current.hasMore).toBe(false);
    });
  });
});
