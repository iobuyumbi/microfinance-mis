# BlogApp Client

A modern React frontend for the BlogApp MERN stack application, built with Vite, Tailwind CSS, and shadcn/ui components.

## Features

- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- 🔐 User authentication (login/register)
- 📝 Full CRUD operations for blog posts
- 💬 Comments system
- 🔍 Search and filtering functionality
- 📱 Responsive design
- 🌙 Dark/light theme support
- ⚡ Fast development with Vite

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Sonner** - Toast notifications

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Configure environment variables:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Navbar.jsx      # Navigation component
│   └── Footer.jsx      # Footer component
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Home.jsx        # Home page
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── PostList.jsx    # Posts listing page
│   ├── PostDetail.jsx  # Single post view
│   ├── CreatePost.jsx  # Create post form
│   ├── EditPost.jsx    # Edit post form
│   └── Profile.jsx     # User profile page
├── services/           # API services
│   └── api.js          # API client and services
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── assets/             # Static assets
├── App.jsx             # Main app component
└── main.jsx            # App entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The client communicates with the backend API through the `api.js` service file. All API calls are centralized and include:

- Authentication (login, register, logout)
- Post management (CRUD operations)
- Category management
- Comments system

## Styling

The application uses Tailwind CSS for styling with shadcn/ui components for consistent design. The theme supports both light and dark modes.

## Contributing

1. Follow the existing code style
2. Use shadcn/ui components when possible
3. Ensure responsive design
4. Add proper error handling
5. Test your changes thoroughly
