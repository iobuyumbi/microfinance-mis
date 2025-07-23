# Microfinance MIS - Frontend Client

React frontend application for the Microfinance Management Information System built with Vite, React, and modern UI components.

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Shadcn/ui** - Beautiful, reusable components
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layouts/          # Layout components (PageLayout, MainLayout)
│   │   ├── ui/              # Reusable UI components
│   │   └── custom/          # Custom components
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Loans.jsx
│   │   ├── Savings.jsx
│   │   ├── Members.jsx
│   │   └── Reports.jsx
│   ├── contexts/            # React contexts
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/            # API service functions
│   ├── utils/               # Utility functions
│   └── App.jsx              # Main app component
├── public/                  # Static assets
└── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. **Navigate to client directory:**
   ```bash
   cd client
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

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open in browser:**
   Navigate to `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🎨 UI Components

### Layout System
The app uses a consistent layout system with reusable components:

- **PageLayout** - Main page wrapper with title and actions
- **PageSection** - Structured sections with consistent spacing
- **StatsGrid** - Responsive grid for metrics
- **FiltersSection** - Uniform filter layouts
- **ContentCard** - Consistent padded content blocks

### Theme Support
- Light/Dark mode toggle
- Consistent color scheme
- Responsive design for all screen sizes

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (Admin, Officer, Member)
- Protected routes with automatic redirects
- Persistent login state

## 📱 Features

- **Dashboard** - Overview statistics and quick actions
- **Transactions** - Financial transaction management
- **Loans** - Loan application and tracking
- **Savings** - Savings account management
- **Members** - User and group member management
- **Reports** - Analytics and reporting
- **Meetings** - Group meeting scheduling
- **Chat** - Real-time group communication

## 🌐 API Integration

The frontend connects to the backend API with:
- Axios interceptors for authentication
- Error handling and user feedback
- Loading states and optimistic updates
- Real-time updates via Socket.io (planned)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload `dist/` folder to Netlify
3. Configure environment variables in Netlify dashboard

## 🔧 Development Guidelines

- Use functional components with hooks
- Follow consistent file naming (PascalCase for components)
- Implement proper error boundaries
- Use TypeScript for better type safety (future enhancement)
- Write accessible components with proper ARIA labels

## 📝 Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Microfinance MIS
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
```

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend server is running
   - Check `VITE_API_BASE_URL` in `.env.local`
   - Verify CORS configuration in backend

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Vite cache: `npm run dev -- --force`

3. **Styling Issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS classes

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
