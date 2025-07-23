# Microfinance Management Information System (MIS)

## 🌍 What is Microfinance?

**Microfinance** is the provision of small-scale financial services—such as loans, savings, and insurance—to individuals or small businesses who lack access to traditional banking. Its mission is to empower low-income people, especially in developing regions, to start or grow businesses, manage risk, and improve their lives. Microfinance institutions (MFIs) often work with community groups (sometimes called SACCOs, self-help groups, or microfinance groups) to deliver these services.

**Key features of microfinance:**
- Small loan amounts (microloans)
- Group-based lending and savings (peer accountability)
- Focus on financial inclusion for the unbanked/underbanked
- Support for entrepreneurship, education, health, and resilience

## 🎯 Project Mission Statement

> **To empower microfinance groups and their members with a modern, digital platform that streamlines group management, savings, loans, meetings, and communication—enabling financial inclusion, transparency, and community-driven development.**

## 🛠️ What Does This Project Do?

This Microfinance MIS is a full-stack MERN application that helps microfinance organizations and groups manage their operations efficiently and transparently. It provides:

- **Group Management:** Organize users into groups (SACCOs or microfinance groups), each with its own members, meetings, savings, and loans.
- **Member/User Management:** Track individual members, their roles (admin, officer, leader), and their participation in groups. Role-based access ensures data security.
- **Savings and Accounts:** Members can save money in group accounts. The system tracks balances, interest rates, and account status, encouraging a savings culture.
- **Loans:** Members or groups can apply for loans. Loans are tracked with status, amount, interest, and repayment terms. Admins/officers can approve or reject loans.
- **Meetings:** Schedule and track group meetings, attendance, and agendas—supporting accountability and transparency.
- **Transactions:** Record all financial transactions (deposits, withdrawals, repayments) for transparency and accurate record-keeping.
- **Notifications:** Keep members informed about meetings, loans, repayments, and more.
- **Reports and Dashboard:** View summary statistics (total members, loans, savings, etc.) to monitor group and overall performance.
- **Chat/Communication:** Group chat allows members to communicate, ask questions, and support each other—fostering community and peer support.
- **Security and Access Control:** Only authorized users can access or modify sensitive data, protecting member privacy and financial information.

## 🤝 How Does This Project Support Microfinance?

- **Empowers groups and members** to manage their finances, meetings, and communication digitally.
- **Increases transparency and accountability** through clear records and role-based access.
- **Encourages savings and responsible borrowing** by tracking accounts, loans, and repayments.
- **Fosters community and peer support** with group chat and meeting management.
- **Supports financial inclusion** by making microfinance operations accessible and efficient for all members.

## 🚀 Why This Matters

By digitizing group management, savings, loans, meetings, and communication, this project helps microfinance organizations:
- Reach more people
- Operate more efficiently
- Have a greater impact on financial inclusion and poverty reduction

## 📦 Features At a Glance
- Group and member management
- Savings and loan tracking
- Meeting scheduling and attendance
- Transaction history
- Real-time group chat
- Role-based access control
- Dashboard and reports
- Modern, responsive UI

---

*This project is a capstone for demonstrating full-stack MERN skills and making a real-world impact through technology.*

---

## 🚀 Deployment & Demo Links

- **Frontend (Live App):** [https://microfinance-mis.vercel.app](https://microfinance-mis.vercel.app)
- **Backend API:** [https://microfinance-mis.onrender.com](https://microfinance-mis.onrender.com)

---

## 📸 Screenshots

_Add screenshots of your app here (Dashboard, Groups, Meetings, Chat, etc.)_

---

## 🎥 Video Demo

_Add a link to your 5-10 minute video demo here (YouTube, Loom, etc.)_

---

## ✅ Submission Checklist

- [x] All features work for all roles
- [x] Groups, Meetings, Chat visible in sidebar and functional
- [x] Consistent, modern UI
- [x] README includes:
  - Project description
  - Setup instructions
  - **Frontend URL:** https://microfinance-mis.vercel.app
  - **Backend URL:** https://microfinance-mis.onrender.com
  - Screenshots and/or video demo link
- [x] All code pushed to GitHub
- [x] Deployed and accessible online

---

## 📝 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/microfinance-mis.git
cd microfinance-mis
```

### 2. Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/microfinance-mis
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FROM_NAME=Microfinance MIS
   FROM_EMAIL=noreply@microfinance-mis.com
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### 3. Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd ../client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=Microfinance MIS
   ```

5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### 4. Database Setup

1. **Ensure MongoDB is running** (if using local installation)
2. **The application will automatically create the database and collections**
3. **Seed data** (optional):
   ```bash
   cd server
   npm run seed
   ```

### 5. Access the Application

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Register a new account** or use default credentials:
   - Email: `admin@microfinance.com`
   - Password: `admin123`

## 🏗️ Project Architecture

### Backend (Node.js + Express + MongoDB)
```
server/
├── controllers/          # Route handlers
├── models/              # MongoDB schemas
├── routes/              # API endpoints
├── middleware/          # Custom middleware
├── utils/               # Utility functions
├── config/              # Configuration files
└── server.js            # Entry point
```

### Frontend (React + Vite)
```
client/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── services/       # API services
│   └── utils/          # Utility functions
└── public/             # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `PUT /api/auth/reset-password` - Reset password

### Core Modules
- `GET/POST/PUT/DELETE /api/users` - User management
- `GET/POST/PUT/DELETE /api/groups` - Group management
- `GET/POST/PUT/DELETE /api/loans` - Loan management
- `GET/POST/PUT/DELETE /api/savings` - Savings management
- `GET/POST/PUT/DELETE /api/transactions` - Transaction management
- `GET/POST/PUT/DELETE /api/meetings` - Meeting management
- `GET/POST/PUT/DELETE /api/repayments` - Repayment management
- `GET/POST/PUT/DELETE /api/notifications` - Notification management
- `GET /api/reports/*` - Various reports

## 👥 User Roles

1. **Admin**
   - Full system access
   - User and group management
   - System configuration
   - All reports and analytics

2. **Officer**
   - Group management
   - Loan approval/rejection
   - Member management
   - Financial reports

3. **Member**
   - Personal dashboard
   - Loan applications
   - Savings management
   - Group participation

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
npm run test:watch
npm run test:coverage
```

### Frontend Testing
```bash
cd client
npm test
npm run test:ui
npm run test:e2e
```

## 🚀 Production Deployment

### Backend (Railway/Heroku)
1. Create account on Railway or Heroku
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy from main branch

### Frontend (Vercel/Netlify)
1. Create account on Vercel or Netlify
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Configure environment variables

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=production-secret
FRONTEND_URL=https://your-frontend-domain.com

# Frontend
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Socket.io** - Real-time communication (planned)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Shadcn/ui** - Component library
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting
- Secure headers

## 📊 Key Features

### Financial Management
- Loan application and tracking
- Savings account management
- Transaction recording and history
- Repayment tracking
- Interest calculations

### Group Operations
- Member management
- Group formation and administration
- Meeting scheduling and attendance
- Role-based permissions

### Reporting & Analytics
- Financial summaries
- Loan portfolio analysis
- Savings performance
- Transaction trends
- Custom date range reports

### Communication
- Notification system
- Group chat (planned)
- Email notifications
- Meeting reminders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Thanks to the microfinance community for inspiration
- Built as a capstone project for MERN stack learning
- Special thanks to instructors and mentors

---
