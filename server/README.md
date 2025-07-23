# Microfinance MIS - Backend Server

Node.js/Express backend API for the Microfinance Management Information System.

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Cors** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting middleware

## 📁 Project Structure

```
server/
├── controllers/          # Route handlers and business logic
│   ├── authController.js
│   ├── userController.js
│   ├── groupController.js
│   ├── loanController.js
│   ├── savingsController.js
│   ├── transactionController.js
│   ├── meetingController.js
│   ├── repaymentController.js
│   ├── notificationController.js
│   └── reportController.js
├── models/              # MongoDB schemas and models
│   ├── User.js
│   ├── Group.js
│   ├── Loan.js
│   ├── Savings.js
│   ├── Transaction.js
│   ├── Meeting.js
│   ├── Repayment.js
│   ├── Notification.js
│   ├── Account.js
│   ├── AccountHistory.js
│   └── Guarantor.js
├── routes/              # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── groupRoutes.js
│   ├── loanRoutes.js
│   ├── savingsRoutes.js
│   ├── transactionRoutes.js
│   ├── meetingRoutes.js
│   ├── repaymentRoutes.js
│   ├── notificationRoutes.js
│   └── reportRoutes.js
├── middleware/          # Custom middleware functions
│   ├── auth.js         # Authentication middleware
│   ├── validate.js     # Input validation
│   ├── errorHandler.js # Error handling
│   └── rateLimiter.js  # Rate limiting
├── utils/               # Utility functions
│   ├── jwt.js          # JWT utilities
│   ├── sendEmail.js    # Email utilities
│   └── index.js        # Utility exports
├── config/              # Configuration files
│   └── database.js     # Database connection
├── tests/               # Test files
├── .env.example         # Environment variables template
├── server.js            # Application entry point
└── package.json         # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see Environment Variables section)

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Server will run on:**
   `http://localhost:5000`

## 📜 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔧 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `POST /forgot-password` - Request password reset
- `PUT /reset-password/:token` - Reset password with token
- `PUT /change-password` - Change password (authenticated)

### Users (`/api/users`)
- `GET /` - Get all users (admin/officer only)
- `GET /:id` - Get user by ID
- `PUT /profile` - Update user profile
- `PUT /:id/role` - Update user role (admin only)
- `DELETE /:id` - Delete user (admin only)

### Groups (`/api/groups`)
- `GET /` - Get all groups
- `POST /` - Create new group
- `GET /:id` - Get group by ID
- `PUT /:id` - Update group
- `DELETE /:id` - Delete group
- `POST /:id/members` - Add member to group
- `DELETE /:id/members/:memberId` - Remove member from group

### Loans (`/api/loans`)
- `GET /` - Get all loans
- `POST /` - Apply for loan
- `GET /:id` - Get loan by ID
- `PUT /:id` - Update loan
- `PUT /:id/approve` - Approve loan (officer/admin)
- `PUT /:id/reject` - Reject loan (officer/admin)
- `DELETE /:id` - Delete loan

### Savings (`/api/savings`)
- `GET /` - Get all savings accounts
- `POST /` - Create savings account
- `GET /:id` - Get savings account by ID
- `PUT /:id` - Update savings account
- `DELETE /:id` - Delete savings account

### Transactions (`/api/transactions`)
- `GET /` - Get all transactions
- `POST /` - Create new transaction
- `GET /:id` - Get transaction by ID
- `PUT /:id` - Update transaction
- `DELETE /:id` - Delete transaction

### Meetings (`/api/meetings`)
- `GET /` - Get all meetings
- `POST /` - Schedule new meeting
- `GET /:id` - Get meeting by ID
- `PUT /:id` - Update meeting
- `DELETE /:id` - Delete meeting
- `POST /:id/attendance` - Record attendance

### Repayments (`/api/repayments`)
- `GET /` - Get all repayments
- `POST /` - Record repayment
- `GET /:id` - Get repayment by ID
- `GET /loan/:loanId` - Get repayments for specific loan
- `DELETE /:id` - Delete repayment

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `POST /` - Create notification
- `PUT /:id` - Mark notification as read
- `DELETE /:id` - Delete notification

### Reports (`/api/reports`)
- `GET /financial-summary` - Financial overview
- `GET /loan-portfolio` - Loan portfolio analysis
- `GET /savings-performance` - Savings account performance
- `GET /transaction-trends` - Transaction trends
- `GET /member-activity` - Member activity reports

## 🔒 Authentication & Authorization

### JWT Authentication
- All protected routes require `Authorization: Bearer <token>` header
- Tokens expire after 30 days (configurable)
- Refresh token mechanism (planned)

### Role-Based Access Control
1. **Admin** - Full system access
2. **Officer** - Group and loan management
3. **Member** - Personal data and group participation

### Middleware
- `protect` - Verify JWT token
- `authorize(...roles)` - Check user roles
- `optionalAuth` - Optional authentication for public endpoints

## 🗄️ Database Models

### Core Models
- **User** - System users with roles and profiles
- **Group** - Microfinance groups with members
- **Loan** - Loan applications and tracking
- **Savings** - Savings accounts and balances
- **Transaction** - Financial transactions
- **Meeting** - Group meetings and attendance
- **Repayment** - Loan repayment records
- **Notification** - System notifications

### Relationships
- Users belong to multiple Groups
- Groups have multiple Users (members)
- Loans belong to Users or Groups
- Savings accounts belong to Users or Groups
- Transactions reference Users, Groups, Loans, or Savings
- Repayments reference Loans
- Meetings belong to Groups

## 🧪 Testing

### Test Structure
```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── fixtures/           # Test data
└── helpers/            # Test utilities
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "User"

# Run tests in watch mode
npm run test:watch
```

## 📝 Environment Variables

See `.env.example` for all available environment variables:

### Required Variables
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

### Optional Variables
- Email configuration for notifications
- CORS settings for production
- Rate limiting configuration
- File upload settings

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas or production database
4. Set up email service (SendGrid, Mailgun, etc.)
5. Configure CORS for your frontend domain

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/microfinance-mis
JWT_SECRET=your-super-secure-production-secret
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

## 🔍 API Documentation

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify `MONGO_URI` in `.env`
   - Check network connectivity

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **CORS Errors**
   - Configure `CORS_ORIGIN` in `.env`
   - Check frontend URL matches

4. **Email Not Sending**
   - Verify email configuration
   - Check email service credentials
   - Test with email service provider

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
