import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api/client";
import { ENDPOINTS } from "@/services/api/endpoints";
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get(ENDPOINTS.AUTH.ME);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      toast.success("Login successful!");
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);

      toast.success(
        "Registration successful! Please check your email for verification."
      );
      return { success: true, data: response.data };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);

    // Call logout endpoint to invalidate token on server
    api.post(ENDPOINTS.AUTH.LOGOUT).catch(console.error);

    toast.success("Logged out successfully");
  }, []);

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

      toast.success("Password reset email sent! Please check your inbox.");
      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });

      toast.success(
        "Password reset successful! Please login with your new password."
      );
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.put(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        profileData
      );

      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");
      return { success: true, user: updatedUser };
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      await api.put(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);

      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file) => {
    try {
      setLoading(true);
      const response = await api.upload(ENDPOINTS.USERS.UPLOAD_AVATAR, file);

      const updatedUser = { ...user, avatar: response.data.avatar };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Avatar uploaded successfully!");
      return { success: true, avatar: response.data.avatar };
    } catch (error) {
      toast.error(error.response?.data?.message || "Avatar upload failed");
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const hasRole = useCallback(
    (roles) => {
      if (!user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;

      // Admin has all permissions
      if (user.role === "admin") return true;

      // Define permission mappings
      const permissions = {
        officer: [
          "manage_members",
          "manage_groups",
          "approve_loans",
          "view_reports",
        ],
        leader: [
          "view_group_members",
          "manage_group_meetings",
          "view_group_reports",
        ],
        member: ["view_own_profile", "apply_loans", "view_own_transactions"],
      };

      return permissions[user.role]?.includes(permission) || false;
    },
    [user]
  );

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    uploadAvatar,
    hasRole,
    hasPermission,
    checkAuthStatus,
  };
};
