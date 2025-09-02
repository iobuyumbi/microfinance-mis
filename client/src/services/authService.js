
import { apiRequest } from './api/client';
import { ENDPOINTS } from './api/endpoints';
import { toast } from 'sonner';

class AuthService {
  constructor() {
    this.tokenKey = 'token';
    this.userKey = 'user';
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user
  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      this.logout();
      return null;
    }
  }

  // Store auth data
  setAuthData(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Clear auth data
  clearAuthData() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // Check user role
  hasRole(requiredRole) {
    const user = this.getUser();
    if (!user) return false;

    const roleHierarchy = {
      admin: 4,
      officer: 3,
      leader: 2,
      member: 1
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Login
  async login(credentials) {
    try {
      console.log('AuthService.login - Sending credentials:', credentials);
      const response = await apiRequest.post(ENDPOINTS.AUTH.LOGIN, credentials);
      console.log('AuthService.login - Raw response:', response);
      
      if (response.success && response.token && response.user) {
        console.log('AuthService.login - Success, setting auth data');
        this.setAuthData(response.token, response.user);
        toast.success(`Welcome back, ${response.user.name}!`);
        return { success: true, user: response.user };
      } else {
        console.log('AuthService.login - Response missing required fields:', { 
          success: response.success, 
          hasToken: !!response.token, 
          hasUser: !!response.user 
        });
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiRequest.post(ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.success && response.token && response.user) {
        this.setAuthData(response.token, response.user);
        toast.success(`Welcome to Microfinance MIS, ${response.user.name}!`);
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Logout
  async logout() {
    try {
      // Attempt to logout on server (optional, don't block on failure)
      await apiRequest.post(ENDPOINTS.AUTH.LOGOUT).catch(console.warn);
    } finally {
      this.clearAuthData();
      toast.success('Logged out successfully');
      window.location.href = '/auth/login';
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await apiRequest.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      
      if (response.success) {
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await apiRequest.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password
      });
      
      if (response.success) {
        toast.success('Password reset successfully. Please login with your new password.');
        return { success: true };
      } else {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await apiRequest.put(ENDPOINTS.AUTH.PROFILE, profileData);
      
      if (response.success && response.user) {
        // Update stored user data
        this.setAuthData(this.getToken(), response.user);
        toast.success('Profile updated successfully');
        return { success: true, user: response.user };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiRequest.get(ENDPOINTS.AUTH.PROFILE);
      
      if (response.success && response.data) {
        // Update stored user data
        this.setAuthData(this.getToken(), response.data);
        return { success: true, user: response.data };
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (error) {
      console.error('Get current user error:', error);
      // Don't show toast for this - might be called frequently
      return { success: false, error: error.message };
    }
  }

  // Validate token
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const result = await this.getCurrentUser();
      return result.success;
    } catch (error) {
      console.warn('Token validation failed:', error);
      this.clearAuthData();
      return false;
    }
  }
}

// Export singleton instance
export default new AuthService();

// Named export for backward compatibility
export const authService = new AuthService();
