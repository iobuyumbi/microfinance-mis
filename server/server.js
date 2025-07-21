// Microfinance MIS - Main Server Entry

require("dotenv").config(); // Load env vars first

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import all middleware from middleware/index.js
const { errorHandler, notFound } = require("./middleware");
// Import all routes from routes/index.js
const routes = require("./routes");

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
