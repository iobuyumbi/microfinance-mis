// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { toast } from "sonner";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]); // Add groups state

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setGroups([]); // Clear groups on logout
    toast.info("Logged out successfully.");
  }, []);

  // Function to fetch user's groups
  const fetchUserGroups = useCallback(async (userId) => {
    if (!userId) {
      setGroups([]);
      return;
    }
    try {
      // Check if user is authenticated first
      const token = localStorage.getItem("token");
      if (!token) {
        setGroups([]);
        return;
      }

      // Use the proper endpoint to get user's groups
      const userGroupsResponse = await userService.getUserGroups(userId);
      const userGroups = Array.isArray(userGroupsResponse.data)
        ? userGroupsResponse.data
        : Array.isArray(userGroupsResponse)
          ? userGroupsResponse
          : [];
      setGroups(userGroups);
    } catch (err) {
      console.error("Failed to fetch user groups in AuthContext:", err);
      // Only set empty groups if it's an authentication error
      if (err.message === "Access denied" || err.message.includes("403")) {
        setGroups([]);
      }
      // Don't throw the error to prevent authentication failure
    }
  }, []);

  const getMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const fetchedUser = res.user || res.data || res;

      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        // Fetch groups after user is set, but don't fail if groups can't be fetched
        try {
          await fetchUserGroups(fetchedUser._id || fetchedUser.id);
        } catch (groupError) {
          console.warn("Could not fetch user groups:", groupError);
          // Don't fail authentication if groups can't be fetched
        }
        return fetchedUser;
      } else {
        throw new Error(
          "Invalid user data received from authentication check."
        );
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      // Only logout if it's an authentication error, not a network error
      if (
        error.message === "Session expired. Please login again." ||
        error.message === "Access denied" ||
        error.response?.status === 401
      ) {
        logout();
      }
      throw error;
    }
  }, [logout, fetchUserGroups]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        await getMe();
      } else {
        setUser(null);
        setGroups([]); // Ensure groups are cleared if no token
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setLoading(false);
    };

    initializeAuth();
  }, [getMe]);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const data = await authService.login(credentials);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        await fetchUserGroups(data.user._id || data.user.id); // Fetch groups after login
        toast.success("Logged in successfully!");
        return data;
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed.");
        setUser(null);
        setGroups([]); // Clear groups on login failure
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserGroups]
  );

  const value = {
    user,
    groups, // Expose groups here
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
