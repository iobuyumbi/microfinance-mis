const mongoose = require('mongoose');

/**
 * Enhanced Database Configuration with ACID Compliance
 * Ensures data integrity and reliability for financial operations
 */
const connectDB = async () => {
  try {
    // Connection options for ACID compliance and production readiness
    const options = {
      // Connection pooling for better performance
      maxPoolSize: 10,
      minPoolSize: 2,

      // ACID compliance settings
      w: 'majority', // Write concern - wait for majority of replica set members
      j: true, // Journal - ensure writes are written to journal before acknowledging
      wtimeout: 10000, // 10 second timeout for write operations

      // Connection settings
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,

      // Retry settings
      retryWrites: true,
      retryReads: true,

      // SSL/TLS for production
      ssl: process.env.NODE_ENV === 'production',

      // Authentication
      authSource: 'admin',

      // Connection monitoring
      heartbeatFrequencyMS: 10000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    };

    await mongoose.connect(process.env.MONGO_URI, options);

    console.log('✅ MongoDB connected successfully');

    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', err => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Connection details:', {
      uri: process.env.MONGO_URI
        ? `${process.env.MONGO_URI.substring(0, 20)}...`
        : 'Not set',
      environment: process.env.NODE_ENV || 'development',
    });
    process.exit(1);
  }
};

/**
 * Get database connection status
 */
const getConnectionStatus = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    isConnected: mongoose.connection.readyState === 1,
  };
};

/**
 * Close database connection gracefully
 */
const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

module.exports = { connectDB, getConnectionStatus, closeConnection };
