import { api } from "./api/client";
import { ENDPOINTS, buildUrl } from "./api/endpoints";

class AuthService {
  /**
   * Login user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and token
   */
  async login(credentials) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

      // Store token and user data
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  async register(userData) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);

      // Store token and user data
      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGOUT);

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return response;
    } catch (error) {
      // Even if logout fails, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  }

  /**
   * Get current user data
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(ENDPOINTS.AUTH.ME);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token data
   */
  async refreshToken() {
    try {
      const response = await api.post(ENDPOINTS.AUTH.REFRESH);

      if (response.success && response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request response
   */
  async forgotPassword(email) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise<Object>} Reset response
   */
  async resetPassword(token, password) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification response
   */
  async verifyEmail(token) {
    try {
      const response = await api.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getStoredUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  }

  /**
   * Get stored token
   * @returns {string|null} Token or null
   */
  getStoredToken() {
    return localStorage.getItem("token");
  }

  /**
   * Update stored user data
   * @param {Object} userData - Updated user data
   */
  updateStoredUser(userData) {
    localStorage.setItem("user", JSON.stringify(userData));
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
