import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user session
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      toast.success("Welcome back!");
      navigate("/dashboard");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const forgotPassword = async (email) => {
    try {
      await authService.forgotPassword(email);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send reset email"
      );
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await authService.resetPassword(token, password);
      toast.success("Password reset successful! Please log in");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    try {
      const data = await authService.updateProfile(userData);
      setUser(data.user);
      toast.success("Profile updated successfully");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with your loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
