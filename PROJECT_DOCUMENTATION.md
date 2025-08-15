# 📚 Microfinance MIS - Project Documentation

## 🏗️ Technical Architecture

### System Overview

The Microfinance MIS is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with real-time capabilities powered by Socket.io. The application is currently in active development with core features implemented and some known issues being addressed.

### Current Implementation Status

#### ✅ Implemented Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: CRUD operations for users with role management (admin, officer, leader, member)
- **Group Management**: Create, view, and manage microfinance groups
- **Member Management**: Add/remove members from groups, role management within groups
- **Loan Management**: Basic loan application and management system
- **Savings Management**: Savings account creation and transaction tracking
- **Transaction Tracking**: Financial transaction recording and history
- **Real-time Chat**: Socket.io based chat system for group communication
- **Dashboard**: Overview of key metrics and recent activities
- **Reports**: Basic reporting functionality
- **Settings Management**: Application and user settings
- **Profile Management**: User profile updates and management

#### 🔧 Current Issues Being Addressed

- **API Response Structure**: Inconsistent handling of API responses (some components expect `response.data` while API returns `response.data.data`)
- **Socket Connection**: Socket connections are being established but may have intermittent disconnections
- **Error Handling**: Some components need better error boundaries and error handling
- **Data Validation**: Frontend validation needs alignment with backend validation

#### 🚧 In Progress

- **Advanced Loan Features**: Loan assessment, guarantor management, repayment scheduling
- **Enhanced Reporting**: More comprehensive financial reports and analytics
- **Mobile Responsiveness**: Improving mobile user experience
- **Performance Optimization**: Code splitting and lazy loading implementation

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React 19)    │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ - User Interface│    │ - REST API      │    │ - User Data     │
│ - State Mgmt    │    │ - Authentication│    │ - Financial Data│
│ - Real-time UI  │    │ - Business Logic│    │ - Audit Logs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Socket.io     │◄─────────────┘
                        │   (Real-time)   │
                        │                 │
                        │ - Notifications │
                        │ - Live Chat     │
                        │ - Status Updates│
                        └─────────────────┘
```

### Technology Stack Details

#### Frontend (React 19 + Vite)

- **React 19**: Modern UI library with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Modern component library built on Radix UI primitives
- **Radix UI**: Underlying accessible component primitives (used by shadcn/ui)
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Socket.io Client**: Real-time communication
- **Recharts**: Data visualization library
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

#### Backend (Node.js + Express)

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL document database
- **Mongoose**: Object Data Modeling (ODM) for MongoDB
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing and verification
- **Socket.io**: Real-time bidirectional communication
- **Nodemailer**: Email functionality
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library

#### DevOps & Infrastructure

- **GitHub Actions**: CI/CD pipelines (planned)
- **Vercel**: Frontend hosting and deployment (planned)
- **Render**: Backend hosting and deployment (planned)
- **MongoDB Atlas**: Cloud database service
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

## 🔐 Security Architecture

### Authentication & Authorization

- **JWT-based Authentication**: Stateless token-based authentication
- **Role-based Access Control (RBAC)**: Four-tier role system
  - Admin: Full system access
  - Officer: Group and financial management
  - Leader: Group member management
  - Member: Basic access to own data and group activities
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: JWT token expiration and refresh

### Data Protection

- **Input Validation**: Mongoose schema validation on all inputs
- **SQL Injection Prevention**: Mongoose ODM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS Configuration**: Whitelisted origins for cross-origin requests
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS Enforcement**: SSL/TLS encryption in production

### Security Headers

```javascript
// Security middleware configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
```

## 📊 Database Design

### Core Entities

#### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String,
  nationalID: String,
  gender: Enum ['male', 'female', 'other'],
  password: String (hashed),
  role: Enum ['admin', 'officer', 'leader', 'member'],
  status: Enum ['active', 'suspended'],
  isMember: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Group Model

```javascript
{
  name: String (required),
  description: String,
  leader: ObjectId (ref: 'User'),
  members: [ObjectId] (ref: 'User'),
  status: Enum ['active', 'inactive'],
  meetingSchedule: String,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Loan Model

```javascript
{
  borrower: ObjectId (ref: 'User'),
  group: ObjectId (ref: 'Group'),
  amount: Number (required),
  interestRate: Number,
  term: Number (months),
  status: Enum ['pending', 'approved', 'rejected', 'active', 'completed'],
  guarantors: [ObjectId] (ref: 'User'),
  repaymentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Savings Model

```javascript
{
  member: ObjectId (ref: 'User'),
  group: ObjectId (ref: 'Group'),
  balance: Number (default: 0),
  interestRate: Number,
  status: Enum ['active', 'inactive'],
  transactions: [ObjectId] (ref: 'Transaction'),
  createdAt: Date,
  updatedAt: Date
}
```

#### Transaction Model

```javascript
{
  type: Enum ['deposit', 'withdrawal', 'loan_repayment', 'interest'],
  amount: Number (required),
  member: ObjectId (ref: 'User'),
  group: ObjectId (ref: 'Group'),
  description: String,
  reference: String,
  status: Enum ['pending', 'completed', 'failed'],
  createdAt: Date,
  updatedAt: Date
}
```

### Database Relationships

- **One-to-Many**: User → Groups (as leader)
- **Many-to-Many**: Users ↔ Groups (as members)
- **One-to-Many**: Group → Loans
- **One-to-Many**: Group → Savings
- **One-to-Many**: User → Transactions
- **One-to-Many**: Loan → Repayments

## 🔄 API Design

### RESTful API Principles

- **Resource-based URLs**: `/api/users`, `/api/groups`, `/api/loans`
- **HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations
- **Status Codes**: Proper HTTP status codes for responses
- **Consistent Response Format**: Standardized JSON response structure

### API Response Format

```javascript
// Success Response
{
  success: true,
  message: "Operation completed successfully",
  data: { /* response data */ },
  count: number, // for list responses
  pagination: { /* pagination info */ }
}

// Error Response
{
  success: false,
  message: "Error description",
  error: "Error code",
  details: { /* additional error details */ }
}
```

### Authentication Flow

1. **Registration**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` → Returns JWT token
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Token Refresh**: Automatic token refresh mechanism

### API Rate Limiting

```javascript
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP",
});
```

## 🔄 Real-time Features

### Socket.io Implementation

- **Connection Management**: User authentication and room joining
- **Real-time Notifications**: Instant updates for system events
- **Live Chat**: Group-based chat functionality
- **Status Updates**: Real-time status changes for loans, transactions

### Event Types

```javascript
// Client to Server Events
"socket.authenticate"; // User authentication
"socket.join_room"; // Join group room
"socket.leave_room"; // Leave group room
"socket.send_message"; // Send chat message
"socket.typing"; // Typing indicator

// Server to Client Events
"socket.notification"; // System notifications
"socket.message"; // Chat messages
"socket.status_update"; // Status changes
"socket.user_joined"; // User joined chat
"socket.user_left"; // User left chat
```

### Current Socket Issues

- **Connection Stability**: Intermittent socket disconnections being investigated
- **Error Handling**: Need better error handling for socket connection failures
- **Reconnection Logic**: Automatic reconnection mechanism needs improvement

## 🧪 Testing Strategy

### Testing Pyramid

```
        /\
       /  \     E2E Tests (Planned)
      /____\
     /      \   Integration Tests (API)
    /________\
   /          \ Unit Tests (Jest)
  /____________\
```

### Unit Testing

- **Backend**: Jest + Supertest for API endpoints
- **Frontend**: Testing framework setup in progress
- **Coverage**: Target 80% code coverage

### Integration Testing

- **API Testing**: End-to-end API workflow testing
- **Database Testing**: MongoDB integration tests
- **Authentication Testing**: JWT token validation

### E2E Testing

- **User Flows**: Complete user journey testing (planned)
- **Cross-browser**: Chrome, Firefox, Safari testing (planned)
- **Mobile Testing**: Responsive design validation (planned)

### Test Examples

```javascript
// Unit Test Example
describe("User Authentication", () => {
  test("should register new user successfully", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🚀 Deployment Architecture

### Frontend Deployment (Planned - Vercel)

- **Build Process**: Vite build optimization
- **CDN**: Global content delivery network
- **Environment Variables**: Secure environment configuration
- **Preview Deployments**: Automatic preview for pull requests

### Backend Deployment (Planned - Render)

- **Container Deployment**: Docker-based deployment
- **Auto-scaling**: Automatic scaling based on traffic
- **Health Checks**: Application health monitoring
- **Log Management**: Centralized logging system

### Database (MongoDB Atlas)

- **Cloud Hosting**: Managed MongoDB service
- **Backup Strategy**: Automated daily backups
- **Monitoring**: Database performance monitoring
- **Security**: Network access control and encryption

### CI/CD Pipeline (Planned)

```yaml
# GitHub Actions Workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        run: curl -X POST $RENDER_DEPLOY_URL

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
```

## 📈 Performance Optimization

### Frontend Optimization

- **Code Splitting**: Route-based code splitting (planned)
- **Lazy Loading**: Component lazy loading (planned)
- **Image Optimization**: WebP format and compression (planned)
- **Bundle Analysis**: Webpack bundle analyzer (planned)
- **Caching Strategy**: Service worker caching (planned)

### Backend Optimization

- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis caching for frequently accessed data (planned)
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Database connection optimization

### Monitoring & Analytics

- **Application Monitoring**: Error tracking and performance monitoring (planned)
- **User Analytics**: User behavior and engagement metrics (planned)
- **Database Monitoring**: Query performance and optimization
- **Uptime Monitoring**: Service availability tracking (planned)

## 🔧 Development Workflow

### Git Workflow

1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: Code review and testing
3. **Conventional Commits**: Standardized commit messages
4. **Automated Testing**: CI/CD pipeline validation (planned)
5. **Deployment**: Automatic deployment on merge (planned)

### Code Quality

- **ESLint**: JavaScript/React code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Type safety (future enhancement)

### Documentation

- **API Documentation**: OpenAPI/Swagger documentation (planned)
- **Code Comments**: Inline code documentation
- **README**: Project setup and usage guide
- **Architecture Docs**: System design documentation

## 🐛 Known Issues & Solutions

### Current Issues

1. **API Response Structure Inconsistency**

   - **Issue**: Some frontend components expect `response.data` while API returns `response.data.data`
   - **Status**: Being fixed - UsersPage, MembersPage, LoansPage, GroupsPage updated
   - **Solution**: Standardize API response handling across all components

2. **Socket Connection Stability**

   - **Issue**: Intermittent socket disconnections
   - **Status**: Under investigation
   - **Solution**: Implement better reconnection logic and error handling

3. **Error Boundaries**
   - **Issue**: Missing error boundaries for React components
   - **Status**: Planned
   - **Solution**: Implement comprehensive error boundaries

### Recent Fixes

- Fixed UsersPage API response handling
- Fixed MembersPage API response handling
- Fixed LoansPage API response handling
- Fixed GroupsPage API response handling

## 🔮 Future Enhancements

### Planned Features

- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Machine learning insights
- **Multi-language Support**: Internationalization
- **Blockchain Integration**: Transparent transaction ledger
- **AI Chatbot**: Automated customer support

### Technical Improvements

- **Microservices**: Service-oriented architecture
- **GraphQL**: Alternative to REST API
- **Real-time Analytics**: Live dashboard updates
- **Advanced Security**: Two-factor authentication
- **Performance**: Server-side rendering (SSR)

### Immediate Priorities

1. **Fix remaining API response issues**
2. **Improve socket connection stability**
3. **Add comprehensive error boundaries**
4. **Implement proper loading states**
5. **Add input validation and error handling**
6. **Improve mobile responsiveness**

---

This documentation reflects the current state of the Microfinance MIS application as of the latest development iteration. The system is actively being developed with core features implemented and ongoing improvements to stability and user experience.
