// client/src/context/SocketContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import socketService from "@/lib/socket";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

// Create a context for the socket state and functions.
const SocketContext = createContext();

// Custom hook to access the SocketContext.
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// The provider component that wraps the application.
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- Main useEffect for socket lifecycle management ---
  // Connects or disconnects the socket based on the user's authentication state.
  useEffect(() => {
    // Retrieve the token directly from localStorage, as AuthContext is responsible for setting it.
    const token = localStorage.getItem("token");

    if (user && token) {
      // Connect to the socket with the user's authentication token.
      socketService.connect(token);

      // Listener for general connection status.
      const unsubscribeConnection = socketService.on(
        "connection_status",
        ({ connected, reason }) => {
          setIsConnected(connected);
          if (connected) {
            toast.success("Connected to real-time updates");
          } else {
            toast.error(
              `Disconnected from real-time updates: ${reason || "Unknown reason"}`
            );
          }
        }
      );

      // Listener for incoming notifications.
      const unsubscribeNotifications = socketService.on(
        "notification",
        (notification) => {
          if (!notification || !notification.message) {
            console.warn("Received malformed notification:", notification);
            return;
          }
          setNotifications((prev) => [notification, ...prev]);

          const toastOptions = {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => navigate("/notifications"),
            },
            closeButton: true,
          };

          switch (notification.type) {
            case "success":
              toast.success(notification.message, toastOptions);
              break;
            case "warning":
              toast.warning(notification.message, toastOptions);
              break;
            case "error":
              toast.error(notification.message, toastOptions);
              break;
            default:
              toast.info(notification.message, toastOptions);
          }
        }
      );

      // Listener for users coming online.
      const unsubscribeUserOnline = socketService.on(
        "user_online",
        (userData) => {
          if (!userData || !userData.id) {
            console.warn("Received malformed user_online data:", userData);
            return;
          }
          setOnlineUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== userData.id);
            return [...filtered, userData];
          });
        }
      );

      // Listener for users going offline.
      const unsubscribeUserOffline = socketService.on(
        "user_offline",
        (userData) => {
          if (!userData || !userData.id) {
            console.warn("Received malformed user_offline data:", userData);
            return;
          }
          setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.id));
        }
      );

      // Listener for global system alerts.
      const unsubscribeSystemAlert = socketService.on(
        "system_alert",
        (alert) => {
          if (!alert || !alert.message) {
            console.warn("Received malformed system_alert data:", alert);
            return;
          }
          toast.error(alert.message, {
            duration: 10000,
            important: true,
            closeButton: true,
          });
        }
      );

      // The cleanup function for the useEffect hook.
      // This runs when the component unmounts or dependencies change.
      return () => {
        console.log("Cleaning up global socket listeners...");
        unsubscribeConnection();
        unsubscribeNotifications();
        unsubscribeUserOnline();
        unsubscribeUserOffline();
        unsubscribeSystemAlert();
      };
    } else {
      // If the user logs out or the token is invalid, ensure the socket is disconnected.
      socketService.disconnect();
      setIsConnected(false);
      setOnlineUsers([]);
      setNotifications([]);
      console.log("Socket disconnected due to no user/token.");
    }
  }, [user, navigate]); // The useEffect dependencies. It re-runs if `user` or `navigate` changes.

  // Callable function to subscribe to dynamic data updates from components.
  const subscribeToDataUpdates = useCallback((callbacks) => {
    const unsubscribers = [];

    // The socket.js `on` method returns an unsubscribe function, which is perfect for this pattern.
    if (callbacks.onMemberUpdate) {
      unsubscribers.push(
        socketService.on("member_updated", callbacks.onMemberUpdate)
      );
    }
    if (callbacks.onLoanUpdate) {
      unsubscribers.push(
        socketService.on("loan_updated", callbacks.onLoanUpdate)
      );
    }
    if (callbacks.onTransactionCreate) {
      unsubscribers.push(
        socketService.on("transaction_created", callbacks.onTransactionCreate)
      );
    }
    if (callbacks.onSavingsUpdate) {
      unsubscribers.push(
        socketService.on("savings_updated", callbacks.onSavingsUpdate)
      );
    }
    if (callbacks.onMeetingReminder) {
      unsubscribers.push(
        socketService.on("meeting_reminder", callbacks.onMeetingReminder)
      );
    }

    // Return a single cleanup function that unsubscribes all listeners.
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Functions to send events to the server.
  const sendUpdate = useCallback((event, data) => {
    socketService.send(event, data);
  }, []);

  const joinRoom = useCallback((room) => {
    socketService.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room) => {
    socketService.leaveRoom(room);
  }, []);

  // The value object to be provided to consuming components.
  const value = {
    isConnected,
    onlineUsers,
    notifications,
    sendUpdate,
    joinRoom,
    leaveRoom,
    subscribeToDataUpdates,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
