import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { loanService } from "@/services/loanService";

// Async thunks
export const fetchLoans = createAsyncThunk(
  "loan/fetchLoans",
  async (params, { rejectWithValue }) => {
    try {
      const response = await loanService.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch loans");
    }
  }
);

export const fetchLoanById = createAsyncThunk(
  "loan/fetchLoanById",
  async (loanId, { rejectWithValue }) => {
    try {
      const response = await loanService.getById(loanId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch loan");
    }
  }
);

export const createLoan = createAsyncThunk(
  "loan/createLoan",
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await loanService.create(loanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create loan");
    }
  }
);

export const updateLoan = createAsyncThunk(
  "loan/updateLoan",
  async ({ loanId, loanData }, { rejectWithValue }) => {
    try {
      const response = await loanService.update(loanId, loanData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update loan");
    }
  }
);

export const deleteLoan = createAsyncThunk(
  "loan/deleteLoan",
  async (loanId, { rejectWithValue }) => {
    try {
      await loanService.remove(loanId);
      return loanId;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete loan");
    }
  }
);

const initialState = {
  loans: [],
  currentLoan: null,
  isLoading: false,
  error: null,
  totalLoans: 0,
  filters: {
    status: "",
    type: "",
    search: "",
  },
};

const loanSlice = createSlice({
  name: "loan",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "",
        type: "",
        search: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch loans
      .addCase(fetchLoans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans = action.payload.data;
        state.totalLoans = action.payload.total;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch loans");
      })
      // Fetch loan by ID
      .addCase(fetchLoanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLoanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLoan = action.payload;
      })
      .addCase(fetchLoanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch loan");
      })
      // Create loan
      .addCase(createLoan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLoan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans.push(action.payload);
        state.totalLoans += 1;
        toast.success("Loan created successfully");
      })
      .addCase(createLoan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to create loan");
      })
      // Update loan
      .addCase(updateLoan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLoan.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.loans.findIndex(
          (loan) => loan._id === action.payload._id
        );
        if (index !== -1) {
          state.loans[index] = action.payload;
        }
        if (state.currentLoan && state.currentLoan._id === action.payload._id) {
          state.currentLoan = action.payload;
        }
        toast.success("Loan updated successfully");
      })
      .addCase(updateLoan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update loan");
      })
      // Delete loan
      .addCase(deleteLoan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteLoan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loans = state.loans.filter((loan) => loan._id !== action.payload);
        state.totalLoans -= 1;
        toast.success("Loan deleted successfully");
      })
      .addCase(deleteLoan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to delete loan");
      });
  },
});

export const { clearError, setFilters, clearFilters } = loanSlice.actions;
export default loanSlice.reducer;
