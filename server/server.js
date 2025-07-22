// Microfinance MIS - Main Server Entry

require("dotenv").config(); // Load env vars first

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import all middleware from middleware/index.js
const { errorHandler, notFound } = require("./middleware");
// Import all routes from routes/index.js
const routes = require("./routes");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Route definitions: [path, routeModule]
const routeList = [
  ["/api/auth", routes.authRoutes],
  ["/api/users", routes.userRoutes],
  ["/api/groups", routes.groupRoutes],
  ["/api/loans", routes.loanRoutes],
  ["/api/repayments", routes.repaymentRoutes],
  ["/api/meetings", routes.meetingRoutes],
  ["/api/reports", routes.reportRoutes],
  ["/api/notifications", routes.notificationRoutes],
  ["/api/savings", routes.savingsRoutes],
  ["/api/transactions", routes.transactionRoutes],
  ["/api/accounts", routes.accountRoutes],
  ["/api/account-history", routes.accountHistoryRoutes],
  ["/api/guarantors", routes.guarantorRoutes],
  ["/api/settings", routes.settingsRoutes],
];

// Mount all routes
routeList.forEach(([path, handler]) => app.use(path, handler));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Microfinance MIS API is running.",
    version: "1.0.0",
    endpoints: Object.fromEntries(
      routeList.map(([path]) => [path.replace("/api/", ""), path])
    ),
    documentation: "API documentation coming soon...",
  });
});

// Use notFound middleware for 404s
app.use(notFound);

// Centralized error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', (token) => {
    // You can add JWT verification here if needed
    console.log(`🔐 User authenticated: ${socket.id}`);
    socket.authenticated = true;
  });

  // Join user to their personal room
  socket.on('join_room', (data) => {
    socket.join(data.room);
    console.log(`🏠 User ${socket.id} joined room: ${data.room}`);
  });

  // Leave room
  socket.on('leave_room', (data) => {
    socket.leave(data.room);
    console.log(`🚪 User ${socket.id} left room: ${data.room}`);
  });

  // Handle real-time notifications
  socket.on('send_notification', (data) => {
    io.emit('notification', {
      id: Date.now(),
      message: data.message,
      type: data.type || 'info',
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(data.room).emit('user_typing', { userId: socket.id, typing: true });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.room).emit('user_typing', { userId: socket.id, typing: false });
  });

  // Handle user status updates
  socket.on('status_update', (data) => {
    socket.broadcast.emit('user_status_change', {
      userId: socket.id,
      status: data.status
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`👋 User disconnected: ${socket.id}`);
    socket.broadcast.emit('user_offline', { userId: socket.id });
  });
});

// Make io available to routes
app.set('io', io);

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.io enabled`);
});

module.exports = app;
