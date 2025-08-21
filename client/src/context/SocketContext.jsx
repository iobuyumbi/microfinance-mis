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

    // Initialize socket connection
    const socketInstance = io(process.env.REACT_APP_API_URL || "", {
      withCredentials: true,
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
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
