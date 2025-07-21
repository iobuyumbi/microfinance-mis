# Environment Variables Setup

Create a `.env` file in the server directory with the following variables:

## Required Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/microfinance-mis

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Configuration (for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FROM_NAME=Microfinance MIS
FROM_EMAIL=noreply@microfinance-mis.com
FRONTEND_URL=http://localhost:3000
```

## Optional Variables

```env
# CORS Configuration (for production)
CORS_ORIGIN=https://your-frontend-domain.com
```

## Setup Instructions

1. **JWT Secret**: Generate a strong random string for JWT_SECRET
2. **Email Setup**:
   - For Gmail, use an App Password (not your regular password)
   - Enable 2-factor authentication first
   - Generate App Password in Google Account settings
3. **MongoDB**:
   - Use local MongoDB or MongoDB Atlas
   - Update MONGO_URI accordingly

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique JWT secrets
- Use environment-specific configurations
- Regularly rotate sensitive credentials
