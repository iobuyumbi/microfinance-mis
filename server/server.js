// server.js - Main server file for the Microfinance MIS application

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");

// Import microfinance MIS routes

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// API routes
// TODO: Import and use your API routes here, e.g.:
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Microfinance MIS API is running." });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
