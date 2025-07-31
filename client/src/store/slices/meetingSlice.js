import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const fetchMeetings = createAsyncThunk(
  "meeting/fetchMeetings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/meetings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        return rejectWithValue(data.message || "Failed to fetch meetings");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const initialState = {
  meetings: [],
  currentMeeting: null,
  isLoading: false,
  error: null,
  totalMeetings: 0,
};

const meetingSlice = createSlice({
  name: "meeting",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meetings = action.payload.data;
        state.totalMeetings = action.payload.total;
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch meetings");
      });
  },
});

export const { clearError } = meetingSlice.actions;
export default meetingSlice.reducer;
