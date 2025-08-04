// client/src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService"; // Service for auth API calls (login, getMe)
import { userService } from "../services/userService"; // Service for user-related API calls (getUserGroups)
import { toast } from "sonner";
import socketService from "../lib/socket"; // Your Socket.IO singleton instance
import { useNavigate } from "react-router-dom";

// 1. Create a React Context to hold our authentication state.
const AuthContext = createContext(null);

// 2. The AuthProvider component is a wrapper that provides the context value to its children.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Attempt to get user data from localStorage on initial render.
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]); // State to store the user's groups
  const navigate = useNavigate();

  // 3. The logout function:
  //    - It's wrapped in useCallback to prevent unnecessary re-creations.
  //    - It clears local storage, resets state, and disconnects the socket.
  const logout = useCallback(() => {
    // Calling a backend logout endpoint can be useful for clearing server-side sessions.
    // authService.logout();

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setGroups([]); // Clear groups on logout

    // --- SOCKET.IO INTEGRATION: Disconnect socket on logout ---
    // A clean disconnect is crucial for real-time applications.
    socketService.disconnect();
    // -----------------------------------------------------------

    toast.info("Logged out successfully.");
    navigate("/auth/login"); // Redirect to login page after logout
  }, [navigate]);

  // 4. Function to fetch user's groups:
  //    - Uses the userService to make an API call.
  //    - Includes robust error handling and a check for invalid tokens.
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
        // If the API returns a 401/403, it means the token is invalid.
        // We should log the user out to force a new login.
        if (err.response?.status === 401 || err.response?.status === 403) {
          setGroups([]);
          toast.error("Access to groups denied. Please re-login.");
          logout();
        }
      }
    },
    [logout] // `logout` is a dependency, as it's called within this function.
  );

  // 5. Function to fetch the authenticated user's details:
  //    - This is called on initial load or after login to get fresh user data.
  //    - It handles connecting the socket and fetching user groups on success.
  const getMe = useCallback(async () => {
    try {
      const res = await authService.getMe();
      // Ensure we get a consistent user object from the response.
      const fetchedUser = res.user || res.data || res;

      if (fetchedUser && fetchedUser._id) {
        setUser(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        // --- SOCKET.IO INTEGRATION: Connect socket after successful getMe ---
        const token = localStorage.getItem("token");
        if (token) {
          socketService.connect(token);
        }
        // -------------------------------------------------------------------

        await fetchUserGroups(fetchedUser._id); // Fetch groups after getting user data
        return fetchedUser;
      } else {
        throw new Error(
          "Invalid user data received from authentication check or missing _id."
        );
      }
    } catch (error) {
      console.error("Error fetching authenticated user:", error);
      // Log out if there's an authentication error with the token.
      if (
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.message === "Session expired. Please login again."
      ) {
        toast.error("Session expired or invalid. Please login again.");
        logout();
      }
      throw error;
    }
  }, [logout, fetchUserGroups]);

  // 6. The login function:
  //    - Takes credentials, calls the backend, saves token/user, and connects socket.
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
        socketService.disconnect();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserGroups] // `fetchUserGroups` is a dependency
  );

  // 7. The main useEffect hook:
  //    - Runs once on component mount.
  //    - Checks for a token and calls `getMe` if a token exists to validate the session.
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (token) {
        try {
          await getMe();
        } catch (error) {
          // getMe already handles logout, so no explicit logout here.
          console.log(
            "Initialization failed, user might be logged out by getMe error."
          );
        }
      } else {
        setUser(null);
        setGroups([]);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // --- SOCKET.IO INTEGRATION: Disconnect if no token ---
        socketService.disconnect();
        // ---------------------------------------------------
      }
      setLoading(false);
    };

    initializeAuth();
  }, [getMe]); // `getMe` is a dependency

  // 8. The value object to be passed to the context's consumers.
  const value = {
    user,
    groups, // Expose groups here
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    // Provide a way to manually re-fetch user details and groups.
    refreshUser: getMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 9. A custom hook for easy access to the context.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
