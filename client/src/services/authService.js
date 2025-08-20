import { api } from "./api/client";

class AuthService {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    // Server returns { success, message, token, user }
    const { token, user } = response.data;

    // Store token in localStorage
    localStorage.setItem("token", token);

    // Set default authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return { user, token };
  }

  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data.data;
  }

  async updateProfile(profileData) {
    const response = await api.put("/users/profile", profileData);
    return response.data.data;
  }

  async forgotPassword(email) {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  }

  async resetPassword(token, password) {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  }

  logout() {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  // Get stored token
  getToken() {
    return localStorage.getItem("token");
  }
}

export const authService = new AuthService();
