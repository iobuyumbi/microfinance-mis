import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const fetchSavings = createAsyncThunk(
  "savings/fetchSavings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/savings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        return rejectWithValue(data.message || "Failed to fetch savings");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const initialState = {
  savings: [],
  currentSaving: null,
  isLoading: false,
  error: null,
  totalSavings: 0,
};

const savingsSlice = createSlice({
  name: "savings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savings = action.payload.data;
        state.totalSavings = action.payload.total;
      })
      .addCase(fetchSavings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch savings");
      });
  },
});

export const { clearError } = savingsSlice.actions;
export default savingsSlice.reducer;
