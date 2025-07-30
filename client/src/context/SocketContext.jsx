// src/context/SocketContext.jsx (REVISED)
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import socketService from "@/lib/socket";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate hook

  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (user && token) {
      // Connect if not already connected or re-connect if forceNew was true
      socketService.connect(token);

      // Set up connection status listener
      const unsubscribeConnection = socketService.on(
        "connection_status",
        ({ connected, reason }) => {
          setIsConnected(connected);
          if (connected) {
            toast.success("Connected to real-time updates");
          } else {
            // You might want to be more specific with error messages based on 'reason'
            toast.error(
              `Disconnected from real-time updates: ${reason || "Unknown reason"}`
            );
          }
        }
      );

      // Set up notification listener
      const unsubscribeNotifications = socketService.on(
        "notification",
        (notification) => {
          // Ensure notification is an object and has a message
          if (typeof notification !== "object" || !notification.message) {
            console.warn("Received malformed notification:", notification);
            return;
          }
          setNotifications((prev) => [notification, ...prev]);

          // Show toast notification
          const toastOptions = {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => {
                // Navigate to notifications page using useNavigate
                navigate("/notifications");
              },
            },
            // Add closeButton for better UX
            closeButton: true,
          };

          // Determine toast type based on notification.type
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

      // Set up online users listener
      const unsubscribeUserOnline = socketService.on(
        "user_online",
        (userData) => {
          if (!userData || !userData.id) {
            // Basic validation
            console.warn("Received malformed user_online data:", userData);
            return;
          }
          setOnlineUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== userData.id);
            return [...filtered, userData];
          });
        }
      );

      const unsubscribeUserOffline = socketService.on(
        "user_offline",
        (userData) => {
          if (!userData || !userData.id) {
            // Basic validation
            console.warn("Received malformed user_offline data:", userData);
            return;
          }
          setOnlineUsers((prev) => prev.filter((u) => u.id !== userData.id));
        }
      );

      // Set up system alerts
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

      // Cleanup function for useEffect
      return () => {
        console.log("Cleaning up global socket listeners...");
        unsubscribeConnection();
        unsubscribeNotifications();
        unsubscribeUserOnline();
        unsubscribeUserOffline();
        unsubscribeSystemAlert();
      };
    } else {
      // If user logs out or token is invalid, ensure disconnection and state reset
      socketService.disconnect();
      setIsConnected(false);
      setOnlineUsers([]);
      setNotifications([]);
      console.log("Socket disconnected due to no user/token.");
    }
  }, [user, token, navigate]); // Add navigate to dependency array

  // Real-time data update handlers
  const subscribeToDataUpdates = useCallback((callbacks) => {
    const unsubscribers = [];

    // All these `on` methods now return an unsubscribe function.
    // Ensure `socketService.on` always returns a cleanup function as per socket.js
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

    // Return cleanup function
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Send real-time updates
  const sendUpdate = useCallback((event, data) => {
    socketService.send(event, data);
  }, []);

  // Join/leave rooms for targeted updates
  const joinRoom = useCallback((room) => {
    socketService.joinRoom(room);
  }, []);

  const leaveRoom = useCallback((room) => {
    socketService.leaveRoom(room);
  }, []);

  // Typing indicators
  const startTyping = useCallback((room) => {
    socketService.startTyping(room);
  }, []);

  const stopTyping = useCallback((room) => {
    socketService.stopTyping(room);
  }, []);

  // Update user status
  const updateStatus = useCallback((status) => {
    socketService.updateStatus(status);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const value = {
    isConnected,
    onlineUsers,
    notifications,
    // Functions to interact with the socket service
    subscribeToDataUpdates,
    sendUpdate,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    updateStatus,
    clearNotifications,
    markNotificationAsRead,
    // Expose the socketService itself if direct access is ever needed (though generally discouraged)
    socket: socketService,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
