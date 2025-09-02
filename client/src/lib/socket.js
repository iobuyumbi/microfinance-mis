// client\src\lib\socket.js (REVISED)
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      console.log("Socket already connected. Returning existing instance.");
      return this.socket;
    }

    // Resolve server URL from envs, stripping trailing /api if present
    const base =
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.VITE_API_BASE_URL) ||
      "http://localhost:5000/api";
    const serverUrl = base.replace(/\/?api\/?$/, "");

    this.socket = io(serverUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket.id);
      this.isConnected = true;
      this.emit("connection_status", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.isConnected = false;
      this.emit("connection_status", { connected: false, reason });
      // Important: if you want to automatically reconnect on certain disconnect reasons, implement logic here
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket Connection error:", error);
      this.emit("connection_error", error);
      // Potentially try to reconnect after a delay, or show a user-friendly message
    });

    // Real-time notification events
    this.socket.on("notification", (data) => {
      console.log("Received notification:", data); // Add logging for debugging
      this.emit("notification", data);
    });

    // Real-time data updates
    this.socket.on("member_updated", (data) => {
      console.log("Received member_updated:", data);
      this.emit("member_updated", data);
    });

    this.socket.on("loan_updated", (data) => {
      console.log("Received loan_updated:", data);
      this.emit("loan_updated", data);
    });

    this.socket.on("transaction_created", (data) => {
      console.log("Received transaction_created:", data);
      this.emit("transaction_created", data);
    });

    this.socket.on("savings_updated", (data) => {
      console.log("Received savings_updated:", data);
      this.emit("savings_updated", data);
    });

    // Meeting and collaboration events
    this.socket.on("meeting_reminder", (data) => {
      console.log("Received meeting_reminder:", data);
      this.emit("meeting_reminder", data);
    });

    this.socket.on("user_online", (data) => {
      console.log("Received user_online:", data);
      this.emit("user_online", data);
    });

    this.socket.on("user_offline", (data) => {
      console.log("Received user_offline:", data);
      this.emit("user_offline", data);
    });

    // System events
    this.socket.on("system_alert", (data) => {
      console.log("Received system_alert:", data);
      this.emit("system_alert", data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear(); // Clear all listeners on disconnect
      console.log("SocketService disconnected and listeners cleared.");
    }
  }

  // Event emitter functionality
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const callbacks = this.listeners.get(event);
    if (!callbacks.includes(callback)) {
      // Prevent adding duplicate callbacks
      callbacks.push(callback);
    }

    // Return unsubscribe function for easy cleanup in React components
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          this.listeners.delete(event); // Clean up empty listener arrays
        }
      }
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      // Create a copy to prevent issues if listeners are removed during iteration
      [...callbacks].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in socket event callback for event "${event}":`,
            error
          );
        }
      });
    }
  }

  // Send events to server
  send(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected. Cannot send event: "${event}"`, data);
      // You might want to queue events or attempt reconnection here
    }
  }

  // Join/leave rooms
  joinRoom(room) {
    this.send("join_room", { room });
    console.log(`Attempting to join room: ${room}`);
  }

  leaveRoom(room) {
    this.send("leave_room", { room });
    console.log(`Attempting to leave room: ${room}`);
  }

  // Typing indicators
  startTyping(room) {
    this.send("typing_start", { room });
  }

  stopTyping(room) {
    this.send("typing_stop", { room });
  }

  // Online status
  updateStatus(status) {
    this.send("status_update", { status });
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
