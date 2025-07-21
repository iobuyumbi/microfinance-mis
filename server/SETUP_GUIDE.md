# Microfinance MIS Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- MongoDB database (local or cloud)
- Email service (Gmail, SendGrid, etc.)

## Installation

### 1. Clone and Install Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/microfinance-mis
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/microfinance-mis

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FROM_NAME=Microfinance MIS
FROM_EMAIL=noreply@microfinance-mis.com
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Local MongoDB

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it to your `.env` file

### 4. Email Service Setup

#### Gmail Setup

1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in your `.env` file

#### SendGrid Setup

1. Create account at [SendGrid](https://sendgrid.com)
2. Get API key
3. Update `.env`:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key
   ```

## Running the Application

### Development Mode

```bash
pnpm run dev
```

### Production Mode

```bash
pnpm start
```

## API Testing

### 1. Test Server Health

```bash
curl http://localhost:5000/
```

### 2. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 4. Test Protected Route

```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Route handlers
│   ├── index.js             # Controller exports
│   ├── authController.js    # Authentication
│   ├── userController.js    # User management
│   ├── groupController.js   # Group management
│   ├── loanController.js    # Loan management
│   ├── repaymentController.js # Repayment tracking
│   ├── meetingController.js # Meeting management
│   ├── reportController.js  # Reports and analytics
│   └── ...                  # Other controllers
├── middleware/              # Express middleware
│   ├── index.js            # Middleware exports
│   ├── auth.js             # Authentication middleware
│   ├── validate.js         # Validation middleware
│   ├── errorHandler.js     # Error handling
│   └── asyncHandler.js     # Async error wrapper
├── models/                  # Mongoose models
│   ├── index.js            # Model exports
│   ├── User.js             # User schema
│   ├── Group.js            # Group schema
│   ├── Loan.js             # Loan schema
│   └── ...                 # Other models
├── routes/                  # API routes
│   ├── index.js            # Route exports
│   ├── authRoutes.js       # Auth routes
│   ├── userRoutes.js       # User routes
│   ├── groupRoutes.js      # Group routes
│   └── ...                 # Other routes
├── utils/                   # Utility functions
│   ├── index.js            # Utility exports
│   ├── jwt.js              # JWT functions
│   └── sendEmail.js        # Email functions
├── server.js               # Main server file
├── package.json            # Dependencies
├── API_DOCUMENTATION.md    # API documentation
├── ENV_SETUP.md           # Environment variables guide
└── SETUP_GUIDE.md         # This file
```

## Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (admin, officer, leader)
- Password reset functionality
- Email notifications

### User Management

- User registration and login
- Profile management
- Role and status management

### Group Management

- Create and manage groups
- Add/remove group members
- Group-based access control

### Loan Management

- Loan applications
- Loan approval workflow
- Repayment tracking
- Interest calculation

### Financial Management

- Savings tracking
- Transaction history
- Account management
- Financial reports

### Meeting Management

- Schedule meetings
- Attendance tracking
- Meeting notes

### Reporting

- Financial summaries
- Loan performance reports
- Group savings reports
- Defaulters tracking

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Error handling
- CORS configuration
- Environment variable protection

## Error Handling

The application uses centralized error handling:

- All errors are caught and processed by `errorHandler.js`
- Consistent error response format
- Detailed error logging in development
- Safe error messages in production

## Validation

Input validation is handled by:

- Mongoose schema validation
- Custom validation middleware
- Required field checking
- ObjectId validation
- Pagination validation

## Testing

### Manual Testing

Use tools like:

- Postman
- Insomnia
- curl commands
- Browser developer tools

### Automated Testing (Future)

```bash
# Install testing dependencies
pnpm add -D jest supertest

# Run tests
pnpm test
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
EMAIL_HOST=your-production-email-host
EMAIL_USER=your-production-email-user
EMAIL_PASSWORD=your-production-email-password
```

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "microfinance-mis"

# Monitor
pm2 monit

# Logs
pm2 logs microfinance-mis
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

2. **Email Not Sending**

   - Verify email credentials
   - Check if 2FA is enabled for Gmail
   - Verify app password is correct

3. **JWT Token Issues**

   - Check JWT_SECRET in `.env`
   - Verify token expiration settings
   - Check token format in requests

4. **Port Already in Use**
   - Change PORT in `.env`
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

### Logs

Check application logs for detailed error information:

```bash
# Development logs
pnpm run dev

# Production logs
pm2 logs microfinance-mis
```

## Support

For issues and questions:

1. Check the API documentation
2. Review error logs
3. Verify environment setup
4. Test with provided examples

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test thoroughly
