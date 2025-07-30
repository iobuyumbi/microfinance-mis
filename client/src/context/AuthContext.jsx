// src/context/AuthContext.jsx (REVISED)
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
import socketService from "../lib/socket"; // Import your socketService singleton

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]); // Add groups state

  const logout = useCallback(() => {
    authService.logout(); // Call backend logout (if it exists and clears server-side session/cookies)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setGroups([]); // Clear groups on logout

    // --- SOCKET.IO INTEGRATION: Disconnect socket on logout ---
    socketService.disconnect();
    // -----------------------------------------------------------

    toast.info("Logged out successfully.");
  }, []);

  // Function to fetch user's groups
  const fetchUserGroups = useCallback(
    async (userId) => {
      if (!userId) {
        setGroups([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setGroups([]);
          return;
        }

        const userGroupsResponse = await userService.getUserGroups(userId);
        const userGroups = Array.isArray(userGroupsResponse.data)
          ? userGroupsResponse.data
          : Array.isArray(userGroupsResponse)
            ? userGroupsResponse
            : [];
        setGroups(userGroups);
      } catch (err) {
        console.error("Failed to fetch user groups in AuthContext:", err);
        // Ensure error handling aligns with your API's error structure
        if (err.response?.status === 401 || err.message.includes("403")) {
          // Use err.response?.status for Axios errors
          setGroups([]);
          toast.error("Access to groups denied. Please re-login.");
          logout(); // Automatically log out if groups fetch fails due to auth
        }
      }
    },
    [logout]
  ); // Include logout in dependency array

  const getMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      const fetchedUser = res.user || res.data || res; // Be explicit about expected response structure

      if (fetchedUser && fetchedUser._id) {
        // Ensure user object has an _id for group fetching
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        // --- SOCKET.IO INTEGRATION: Connect socket after successful getMe ---
        const token = localStorage.getItem("token");
        if (token) {
          socketService.connect(token);
        }
        // -------------------------------------------------------------------

        await fetchUserGroups(fetchedUser._id); // Use _id which is typical for MongoDB/Mongoose
        return fetchedUser;
      } else {
        throw new Error(
          "Invalid user data received from authentication check or missing _id."
        );
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      // More specific error checks for logout trigger
      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.message === "Session expired. Please login again." // From api.js interceptor
      ) {
        toast.error("Session expired or invalid. Please login again.");
        logout();
      }
      throw error; // Re-throw to propagate the error if needed by components
    }
  }, [logout, fetchUserGroups]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        try {
          await getMe(); // This will connect the socket on success
        } catch (error) {
          // getMe already handles logout on auth errors, so no explicit logout here
          console.log(
            "Initialization failed, user might be logged out by getMe error."
          );
        }
      } else {
        setUser(null);
        setGroups([]);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // --- SOCKET.IO INTEGRATION: Ensure socket is disconnected if no token ---
        socketService.disconnect();
        // -----------------------------------------------------------------------
      }
      setLoading(false);
    };

    initializeAuth();
  }, [getMe]); // getMe is a useCallback, so it's stable.

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const data = await authService.login(credentials);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);

        // --- SOCKET.IO INTEGRATION: Connect socket after successful login ---
        socketService.connect(data.token);
        // -------------------------------------------------------------------

        await fetchUserGroups(data.user._id || data.user.id); // Fetch groups after login
        toast.success("Logged in successfully!");
        return data;
      } catch (err) {
        toast.error(err.response?.data?.message || "Login failed.");
        setUser(null);
        setGroups([]);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // --- SOCKET.IO INTEGRATION: Ensure socket is disconnected on login failure ---
        socketService.disconnect();
        // ---------------------------------------------------------------------------
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserGroups] // fetchUserGroups is a useCallback, so it's stable.
  );

  const value = {
    user,
    groups, // Expose groups here
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Provide a way to manually re-fetch user details and groups if needed (e.g., after profile update)
    refreshUser: getMe,
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
