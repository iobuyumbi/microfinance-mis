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
    if (token) {
      authService
        .getMe()
        .then((data) => {
          setUser(data.data || null);
          if (data.data) {
            localStorage.setItem("user", JSON.stringify(data.data));
            fetchUserGroups(data.data._id || data.data.id);
          }
        })
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserGroups(parsedUser._id || parsedUser.id);
      setLoading(false);
    } else {
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
