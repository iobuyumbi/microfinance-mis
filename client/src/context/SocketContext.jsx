import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { chatService } from "../services/chatService";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection with better error handling
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"], // Fallback to polling if websocket fails
      timeout: 20000, // 20 second timeout
      forceNew: true, // Force new connection
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    let connectionTimeout;

    socketInstance.on("connect", () => {
      console.log("Socket connected successfully");
      setIsConnected(true);
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      
      // Only show error for unexpected disconnections
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        console.log("Socket disconnected by server or client");
      } else {
        console.log("Socket disconnected due to:", reason);
      }
    });

    socketInstance.on("connect_error", (error) => {
      console.log("Socket connection error (this is normal during initial connection):", error.message);
      setIsConnected(false);
      
      // Clear any existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Set a timeout to retry connection
      connectionTimeout = setTimeout(() => {
        if (socketInstance && !socketInstance.connected) {
          console.log("Retrying socket connection...");
          socketInstance.connect();
        }
      }, 5000); // Retry after 5 seconds
    });

    socketInstance.on("notification", (data) => {
      console.log("Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
      
      // Show toast notification
      toast(data.title, {
        description: data.message,
      });
    });

    socketInstance.on("new_message", (data) => {
      // This is handled in the ChatInterface component
      console.log("New message received:", data);
    });

    setSocket(socketInstance);

    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const sendMessage = async (messageData) => {
    if (!socket || !isConnected) {
      throw new Error("Socket not connected");
    }

    try {
      const response = await chatService.sendMessage(messageData);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const joinGroup = (groupId) => {
    if (!socket || !isConnected) return;
    socket.emit("join-group", { groupId });
  };

  const leaveGroup = (groupId) => {
    if (!socket || !isConnected) return;
    socket.emit("leave-group", { groupId });
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

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        sendMessage,
        joinGroup,
        leaveGroup,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
