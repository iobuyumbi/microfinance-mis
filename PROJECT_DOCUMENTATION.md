# 📚 Microfinance MIS - Project Documentation

## 🏗️ Technical Architecture

### System Overview
The Microfinance MIS is a full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) with real-time capabilities powered by Socket.io.

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
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

#### Frontend (React + Vite)
- **React 19**: Modern UI library with hooks and functional components
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Accessible component primitives
- **React Router**: Client-side routing
- **React Hook Form**: Form state management and validation
- **Zod**: TypeScript-first schema validation
- **Axios**: HTTP client for API communication
- **Socket.io Client**: Real-time communication
- **Recharts**: Data visualization library
- **Vitest**: Unit testing framework

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
- **GitHub Actions**: CI/CD pipelines
- **Vercel**: Frontend hosting and deployment
- **Render**: Backend hosting and deployment
- **MongoDB Atlas**: Cloud database service
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Playwright**: End-to-end testing

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT-based Authentication**: Stateless token-based authentication
- **Role-based Access Control (RBAC)**: Three-tier role system
  - Admin: Full system access
  - Officer: Group and financial management
  - Leader: Group member management
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: JWT token expiration and refresh

### Data Protection
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Prevention**: Mongoose ODM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CORS Configuration**: Whitelisted origins for cross-origin requests
- **Rate Limiting**: API rate limiting to prevent abuse
- **HTTPS Enforcement**: SSL/TLS encryption in production

### Security Headers
```javascript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
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
  role: Enum ['admin', 'officer', 'leader'],
  status: Enum ['active', 'suspended'],
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
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
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
'socket.authenticate'     // User authentication
'socket.join_room'        // Join group room
'socket.leave_room'       // Leave group room
'socket.send_message'     // Send chat message
'socket.typing'           // Typing indicator

// Server to Client Events
'socket.notification'     // System notifications
'socket.message'          // Chat messages
'socket.status_update'    // Status changes
'socket.user_joined'      // User joined chat
'socket.user_left'        // User left chat
```

## 🧪 Testing Strategy

### Testing Pyramid
```
        /\
       /  \     E2E Tests (Playwright)
      /____\    
     /      \   Integration Tests (API)
    /________\  
   /          \ Unit Tests (Jest/Vitest)
  /____________\
```

### Unit Testing
- **Backend**: Jest + Supertest for API endpoints
- **Frontend**: Vitest + React Testing Library for components
- **Coverage**: Minimum 80% code coverage requirement

### Integration Testing
- **API Testing**: End-to-end API workflow testing
- **Database Testing**: MongoDB integration tests
- **Authentication Testing**: JWT token validation

### E2E Testing
- **User Flows**: Complete user journey testing
- **Cross-browser**: Chrome, Firefox, Safari testing
- **Mobile Testing**: Responsive design validation

### Test Examples
```javascript
// Unit Test Example
describe('User Authentication', () => {
  test('should register new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🚀 Deployment Architecture

### Frontend Deployment (Vercel)
- **Build Process**: Vite build optimization
- **CDN**: Global content delivery network
- **Environment Variables**: Secure environment configuration
- **Preview Deployments**: Automatic preview for pull requests

### Backend Deployment (Render)
- **Container Deployment**: Docker-based deployment
- **Auto-scaling**: Automatic scaling based on traffic
- **Health Checks**: Application health monitoring
- **Log Management**: Centralized logging system

### Database (MongoDB Atlas)
- **Cloud Hosting**: Managed MongoDB service
- **Backup Strategy**: Automated daily backups
- **Monitoring**: Database performance monitoring
- **Security**: Network access control and encryption

### CI/CD Pipeline
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
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP format and compression
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching Strategy**: Service worker caching

### Backend Optimization
- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for responses
- **Connection Pooling**: Database connection optimization

### Monitoring & Analytics
- **Application Monitoring**: Error tracking and performance monitoring
- **User Analytics**: User behavior and engagement metrics
- **Database Monitoring**: Query performance and optimization
- **Uptime Monitoring**: Service availability tracking

## 🔧 Development Workflow

### Git Workflow
1. **Feature Branches**: Create feature branches from main
2. **Pull Requests**: Code review and testing
3. **Conventional Commits**: Standardized commit messages
4. **Automated Testing**: CI/CD pipeline validation
5. **Deployment**: Automatic deployment on merge

### Code Quality
- **ESLint**: JavaScript/React code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Type safety (future enhancement)

### Documentation
- **API Documentation**: OpenAPI/Swagger documentation
- **Code Comments**: Inline code documentation
- **README**: Project setup and usage guide
- **Architecture Docs**: System design documentation

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

---

This documentation provides a comprehensive overview of the Microfinance MIS technical architecture, implementation details, and development practices. For specific implementation questions, refer to the codebase or create an issue in the GitHub repository. 