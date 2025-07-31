import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        return rejectWithValue(data.message || "Failed to fetch settings");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (settingsData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settingsData),
        }
      );
      const data = await response.json();
      if (!response.ok)
        return rejectWithValue(data.message || "Failed to update settings");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network error");
    }
  }
);

const initialState = {
  settings: {
    theme: "light",
    language: "en",
    currency: "KES",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTheme: (state, action) => {
      state.settings.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.settings.language = action.payload;
    },
    setCurrency: (state, action) => {
      state.settings.currency = action.payload;
    },
    toggleNotification: (state, action) => {
      const { type } = action.payload;
      state.settings.notifications[type] = !state.settings.notifications[type];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to fetch settings");
      })
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = { ...state.settings, ...action.payload };
        toast.success("Settings updated successfully");
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to update settings");
      });
  },
});

export const {
  clearError,
  setTheme,
  setLanguage,
  setCurrency,
  toggleNotification,
} = settingsSlice.actions;
export default settingsSlice.reducer;
