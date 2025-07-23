import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { groupService } from "@/services/groupService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user groups
  const fetchUserGroups = async (userId) => {
    try {
      // Get all groups where user is a member
      const allGroups = await groupService.getAll();
      // Filter groups where user is a member
      const userGroups = (allGroups.data || allGroups || []).filter(g => g.members && g.members.some(m => m._id === userId || m.id === userId));
      setGroups(userGroups);
      localStorage.setItem("groups", JSON.stringify(userGroups));
    } catch (err) {
      setGroups([]);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      // If we have both token and stored user, set user first then validate
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserGroups(parsedUser._id || parsedUser.id);
      
      // Try to refresh user data from server
      authService
        .getMe()
        .then((data) => {
          if (data.data) {
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            fetchUserGroups(data.data._id || data.data.id);
          }
        })
        .catch((error) => {
          console.warn('Failed to refresh user data:', error.message);
          // Don't clear user on API failure - keep using stored data
          // Only clear if it's a 401 (handled by axios interceptor)
        })
        .finally(() => setLoading(false));
    } else if (token) {
      // If we have token but no stored user, try to get user from server
      authService
        .getMe()
        .then((data) => {
          if (data.data) {
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            fetchUserGroups(data.data._id || data.data.id);
          } else {
            // Invalid response, clear token
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch((error) => {
          console.warn('Failed to get user data:', error.message);
          // Clear token on failure since we have no fallback user data
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else if (storedUser) {
      // If we have stored user but no token, clear everything
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
    } else {
      // No token and no stored user
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    await fetchUserGroups(data.user._id || data.user.id);
    return data;
  };

  const register = async (info) => {
    const data = await authService.register(info);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        groups,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
