import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const fetchTransactions = createAsyncThunk(
  "transaction/fetchTransactions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        return rejectWithValue(data.message || "Failed to fetch transactions");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const initialState = {
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
  totalTransactions: 0,
};

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
        state.totalTransactions = action.payload.total;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch transactions");
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;
