const { connectDB } = require('./db');

const validateEnv = () => {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET'];
  const missing = requiredVars.filter(
    k => !process.env[k] || String(process.env[k]).trim() === ''
  );
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

module.exports = {
  connectDB,
  validateEnv,
};
