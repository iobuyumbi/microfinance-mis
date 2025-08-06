import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import authService from "@/services/authService";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response; // Return the entire response
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response; // Return the entire response
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      // Even if logout fails, we want to clear the state
      authService.clearAuth();
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response; // Return the response directly
    } catch (error) {
      return rejectWithValue(error.message || "Failed to get user data");
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response; // Return the response directly
    } catch (error) {
      return rejectWithValue(error.message || "Token refresh failed");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Password reset request failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Password reset failed");
    }
  }
);

const initialState = {
  user: authService.getStoredUser(),
  token: authService.getStoredToken(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  isRefreshing: false,
  isPasswordResetRequested: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update stored user data
      authService.updateStoredUser(state.user);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isPasswordResetRequested = false;
      authService.clearAuth();
    },
    setPasswordResetRequested: (state, action) => {
      state.isPasswordResetRequested = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Login payload:", action.payload); // Debug log

        // Handle the response structure properly
        const responseData = action.payload;

        // Check if we have the expected data structure
        if (responseData && responseData.user && responseData.token) {
          state.user = responseData.user;
          state.token = responseData.token;
          state.isAuthenticated = true;
          state.error = null;

          // Store auth data in localStorage
          localStorage.setItem("token", responseData.token);
          localStorage.setItem("user", JSON.stringify(responseData.user));

          toast.success("Login successful!");
        } else {
          console.error("Invalid login response structure:", responseData);
          state.error = "Invalid response from server";
          toast.error("Login failed: Invalid response from server");
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Login failed");
      })

      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        // Store auth data in localStorage
        if (action.payload.token && action.payload.user) {
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("user", JSON.stringify(action.payload.user));
        }
        toast.success("Registration successful!");
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Registration failed");
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isPasswordResetRequested = false;
        toast.success("Logged out successfully");
      })
      .addCase(logout.rejected, (state, action) => {
        // Even if logout fails, clear the state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isPasswordResetRequested = false;
        toast.error(action.payload || "Logout failed");
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Update stored user data
        authService.updateStoredUser(action.payload);
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        // Clear stored data on failure
        authService.clearAuth();
      })

      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isRefreshing = false;
        if (action.payload?.token) {
          state.token = action.payload.token;
        }
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = action.payload;
        // If token refresh fails, logout user
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        authService.clearAuth();
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isPasswordResetRequested = true;
        state.error = null;
        toast.success("Password reset email sent successfully");
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to send password reset email");
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isPasswordResetRequested = false;
        state.error = null;
        toast.success("Password reset successfully");
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || "Password reset failed");
      });
  },
});

export const {
  clearError,
  setCredentials,
  updateUser,
  clearAuth,
  setPasswordResetRequested,
} = authSlice.actions;

export default authSlice.reducer;
