// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import { groupService } from "../services/groupService"; // Import groupService
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
      const allGroupsResponse = await groupService.getAll(); // Fetch all groups
      const allGroups = Array.isArray(allGroupsResponse.data)
        ? allGroupsResponse.data
        : Array.isArray(allGroupsResponse)
          ? allGroupsResponse
          : [];

      // Filter groups where the user is a member or creator
      const userGroups = allGroups.filter(
        (g) =>
          (g.members && g.members.some((m) => (m._id || m.id) === userId)) ||
          (g.createdBy && (g.createdBy._id || g.createdBy.id) === userId)
      );
      setGroups(userGroups);
      // Optionally store groups in localStorage if needed for persistence across sessions
      // localStorage.setItem("userGroups", JSON.stringify(userGroups));
    } catch (err) {
      console.error("Failed to fetch user groups in AuthContext:", err);
      setGroups([]);
      // Do not toast error here to avoid spamming if it's a common 403 for non-admins
    }
  }, []);

  const getMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const fetchedUser = res.user || res.data || res;

      if (fetchedUser) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));
        await fetchUserGroups(fetchedUser._id || fetchedUser.id); // Fetch groups after user is set
        return fetchedUser;
      } else {
        throw new Error(
          "Invalid user data received from authentication check."
        );
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      logout();
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
