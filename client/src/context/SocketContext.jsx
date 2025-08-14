import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Prefer dedicated socket URL, else derive from API and strip trailing /api
      const rawUrl =
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000";
      const serverUrl = rawUrl.replace(/\/?api\/?$/, "");

      const newSocket = io(serverUrl, {
        auth: {
          token: localStorage.getItem("token"),
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      // Align with server event names
      newSocket.on("notification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      newSocket.on("new_message", (message) => {
        // Handle incoming chat messages
        console.log("New chat message:", message);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket && newSocket.connected) {
          newSocket.close();
        }
      };
    }
  }, [isAuthenticated, user]);

  const sendMessage = (payload) => {
    if (socket && isConnected) {
      socket.emit("send-message", payload);
    }
  };

  const joinGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit("join-group", { groupId });
    }
  };

  const leaveGroup = (groupId) => {
    if (socket && isConnected) {
      socket.emit("leave-group", { groupId });
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    isConnected,
    notifications,
    sendMessage,
    joinGroup,
    leaveGroup,
    markNotificationAsRead,
    clearNotifications,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
