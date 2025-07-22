# Microfinance MIS - Complete MERN Stack Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

A comprehensive, production-ready **Microfinance Management Information System** built with the MERN stack. This application demonstrates modern full-stack development practices, real-time features, comprehensive testing, and enterprise-grade deployment configurations.

## Features

### Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, Officer, Member)
- Password reset functionality
- Session management with Redis

### Member Management
- Complete CRUD operations for members
- Advanced search and filtering
- Member profile management
- Status tracking and analytics
- Document upload and management

### Loan Management
- Loan application processing
- Approval/rejection workflows
- Interest calculation and scheduling
- Payment tracking and reminders
- Loan portfolio analytics

### Savings Management
- Multiple account types support
- Interest rate management
- Balance tracking and history
- Automated calculations

### Transaction Management
- Multi-type transaction support
- Real-time balance updates
- Transaction history and reporting
- Payment method tracking

### Reports & Analytics
- Interactive dashboards with charts
- Financial reports and insights
- Export functionality (PDF, Excel)
- Real-time data visualization

### Real-time Features
- Live notifications with Socket.io
- Real-time data updates
- Online user tracking
- System alerts and reminders

### Modern UI/UX
- Responsive design with Tailwind CSS
- ShadCN UI components
- Dark/light mode support
- Accessibility compliance
- Mobile-first approach

## Architecture

```
microfinance-mis/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API service layer
│   │   ├── context/          # React contexts
│   │   ├── lib/              # Utilities and configurations
│   │   ├── tests/            # Test files
│   │   └── assets/           # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── server/                    # Express Backend
│   ├── src/
│   │   ├── controllers/      # Route controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Helper functions
│   │   └── tests/            # Test files
│   ├── package.json
│   └── Dockerfile
├── nginx/                     # Reverse proxy config
├── monitoring/                # Monitoring configs
├── docker-compose.yml        # Multi-container setup
├── WORKFLOWS.md              # Business workflows
└── README.md                 # This file
```

## Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (v6.0 or higher)
- **Redis** (v7.0 or higher)
- **Docker** (optional, for containerized deployment)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/microfinance-mis.git
   cd microfinance-mis
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Configuration:**
   
   **Backend (.env in server/):**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/microfinance_mis
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   BCRYPT_SALT_ROUNDS=12
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # SMS Configuration (optional)
   SMS_API_KEY=your-sms-api-key
   SMS_API_SECRET=your-sms-secret
   
   # File Upload (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Frontend (.env in client/):**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Microfinance MIS
   VITE_APP_VERSION=1.0.0
   ```

4. **Start the application:**
   ```bash
   # Terminal 1: Start backend
   cd server
   npm run dev
   
   # Terminal 2: Start frontend
   cd client
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Docker Deployment

1. **Using Docker Compose:**
   ```bash
   # Build and start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

2. **Access services:**
   - Application: http://localhost
   - API: http://localhost/api
   - Monitoring (Grafana): http://localhost:3001
   - Logs (Kibana): http://localhost:5601

## Testing

### Frontend Testing
```bash
cd client

# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Backend Testing
```bash
cd server

# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run all tests with coverage
npm run test:coverage
```

## Monitoring & Observability

### Included Monitoring Stack
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **ELK Stack**: Log management
- **Health Checks**: Application monitoring

### Key Metrics Tracked
- API response times
- Database query performance
- User activity patterns
- System resource usage
- Error rates and types

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/me           # Get current user
POST /api/auth/forgot       # Password reset request
POST /api/auth/reset        # Password reset
```

### Core Resource Endpoints
```
# Members
GET    /api/members         # List members
POST   /api/members         # Create member
GET    /api/members/:id     # Get member
PUT    /api/members/:id     # Update member
DELETE /api/members/:id     # Delete member

# Loans
GET    /api/loans           # List loans
POST   /api/loans           # Create loan
GET    /api/loans/:id       # Get loan
PUT    /api/loans/:id       # Update loan
POST   /api/loans/:id/approve # Approve loan
POST   /api/loans/:id/reject  # Reject loan

# Transactions
GET    /api/transactions    # List transactions
POST   /api/transactions    # Create transaction
GET    /api/transactions/:id # Get transaction

# Reports
GET    /api/reports/dashboard # Dashboard stats
GET    /api/reports/loans     # Loan reports
GET    /api/reports/members   # Member reports
```

## Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Input Validation** using Joi schemas
- **SQL Injection Protection** via Mongoose ODM
- **XSS Protection** with sanitization
- **HTTPS Enforcement** in production

## Deployment Options

### Cloud Platforms
- **Heroku**: Easy deployment with add-ons
- **AWS**: EC2, ECS, or Lambda deployment
- **DigitalOcean**: Droplet or App Platform
- **Vercel**: Frontend deployment
- **Netlify**: Static site deployment

### Self-Hosted
- **Docker Compose**: Multi-container setup
- **Kubernetes**: Orchestrated deployment
- **PM2**: Process management
- **Nginx**: Reverse proxy and load balancing

## Documentation

- [**API Documentation**](./docs/API.md) - Complete API reference
- [**User Guide**](./docs/USER_GUIDE.md) - End-user documentation
- [**Developer Guide**](./docs/DEVELOPER.md) - Development guidelines
- [**Deployment Guide**](./docs/DEPLOYMENT.md) - Production deployment
- [**Workflows**](./WORKFLOWS.md) - Business process workflows

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **MERN Stack Community** for excellent documentation
- **ShadCN UI** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **MongoDB** for flexible data modeling
- **Socket.io** for real-time capabilities

## Support

For support, email support@microfinance-mis.com or join our Slack channel.

---

**Built with ❤️ using the MERN Stack**

*This project demonstrates modern full-stack development practices and serves as a comprehensive example of building production-ready web applications.*
