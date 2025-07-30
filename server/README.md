# Microfinance MIS - Backend Server

A robust, production-ready backend API for the Microfinance Management Information System built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

### Clean Architecture Structure

```
server/
├── config/           # Configuration files (database, environment)
├── controllers/      # Business logic handlers
├── middleware/       # Custom middleware (auth, validation, error handling)
├── models/          # MongoDB schemas and models
├── routes/          # API route definitions
├── utils/           # Utility functions and helpers
├── scripts/         # Database setup and admin creation scripts
├── tests/           # Test files
└── server.js        # Main application entry point
```

### Key Features

- **🔐 JWT Authentication & Authorization** - Role-based access control
- **🛡️ Security Middleware** - Helmet, CORS, Rate limiting, XSS protection
- **📊 Real-time Communication** - Socket.IO for chat functionality
- **🗄️ MongoDB Integration** - Mongoose ODM with optimized schemas
- **⚡ Performance** - Compression, caching, and optimized queries
- **🧪 Testing Ready** - Jest setup with coverage reporting
- **📝 API Documentation** - Comprehensive endpoint documentation

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- pnpm (recommended) or npm

### Installation

1. **Clone and navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/microfinance-mis
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   ```

4. **Database Setup**

   ```bash
   # Create admin user
   pnpm run create-admin
   ```

5. **Start Development Server**
   ```bash
   pnpm run dev
   ```

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users

- `GET /api/users` - Get all users (Admin/Officer)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)

### Groups

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group (Admin/Officer)
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group (Admin)

### Loans

- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan by ID
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

### Contributions

- `GET /api/contributions` - Get all contributions
- `POST /api/contributions` - Create contribution
- `GET /api/contributions/:id` - Get contribution by ID
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution

### Real-time Chat

- `GET /api/chat/groups/:groupId` - Get group chat messages
- `POST /api/chat/groups/:groupId` - Send message to group

## 🔐 Authentication & Authorization

### Roles

- **Admin** - Full system access
- **Officer** - Loan management, user management
- **Leader** - Group management, member management
- **Member** - Personal data, group participation

### JWT Token Structure

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🗄️ Database Models

### Core Models

- **User** - User accounts and profiles
- **Group** - Microfinance groups
- **Loan** - Loan applications and management
- **Savings** - Savings accounts and transactions
- **Contribution** - Group contribution tracking
- **Transaction** - Financial transaction history
- **Meeting** - Group meeting management
- **Notification** - System notifications

### Relationships

- Users can belong to multiple groups
- Groups have multiple members and loans
- Loans are associated with users and groups
- Transactions track all financial movements

## 🛡️ Security Features

### Middleware Stack

1. **Helmet** - Security headers
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - API request throttling
4. **MongoDB Sanitization** - NoSQL injection prevention
5. **XSS Protection** - Cross-site scripting prevention
6. **Parameter Pollution Protection** - HPP prevention

### Authentication Flow

1. User submits credentials
2. Server validates and generates JWT
3. Client stores JWT in secure storage
4. JWT included in subsequent requests
5. Server validates JWT on protected routes

## 🧪 Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:ci
```

### Test Structure

- Unit tests for controllers
- Integration tests for routes
- Database tests with test environment

## 📊 Monitoring & Logging

### Health Check

- `GET /health` - Server health status

### Logging

- Development: Morgan dev format
- Production: Combined format
- Error logging with stack traces

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret-key
JWT_EXPIRE=30d
CLIENT_URL=https://your-domain.com
```

### Performance Optimizations

- Database indexing on frequently queried fields
- Query optimization with aggregation pipelines
- Response compression
- Rate limiting to prevent abuse

## 🔧 Development Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run create-admin # Create default admin user

# Testing
pnpm test             # Run tests
pnpm run test:watch   # Watch mode
pnpm run test:ci      # CI mode

# Code Quality
pnpm run lint         # ESLint check
pnpm run lint:fix     # Auto-fix linting issues
pnpm run format       # Prettier formatting
pnpm run audit        # Security audit
```

## 📝 API Documentation

For detailed API documentation, see `API_DOCUMENTATION.md` in the server directory.

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow the commit message convention

## 📄 License

MIT License - see LICENSE file for details
