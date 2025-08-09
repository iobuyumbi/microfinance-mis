# Frontend Installation Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm package manager
- Git

## Quick Installation

### Option 1: Using the batch file (Windows)

```bash
# Run the provided batch file
install.bat
```

### Option 2: Manual installation

#### Step 1: Navigate to the client directory

```bash
cd client
```

#### Step 2: Install dependencies

```bash
npm install
# or if you prefer pnpm
pnpm install
```

#### Step 3: Start the development server

```bash
npm run dev
# or
pnpm dev
```

## Troubleshooting

### PowerShell Execution Policy Error

If you encounter this error:

```
File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

**Solution:**

1. Open PowerShell as Administrator
2. Run the following command:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

3. Type 'Y' to confirm
4. Try running `npm install` again

### Port Already in Use

If you get a port conflict error:

```bash
# Kill the process using the port (usually 5173 for Vite)
npx kill-port 5173
# Then start the dev server again
npm run dev
```

### Node Modules Issues

If you encounter module-related errors:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Missing Dependencies

If you see missing dependency errors:

```bash
# Install missing dependencies manually
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip @reduxjs/toolkit @tailwindcss/vite @tanstack/react-query @tanstack/react-table axios class-variance-authority clsx cmdk date-fns embla-carousel-react framer-motion input-otp lucide-react next-themes react react-day-picker react-dom react-error-boundary react-hook-form react-redux react-resizable-panels react-router-dom recharts redux redux-persist socket.io socket.io-client sonner tailwind-merge tailwindcss vaul zod
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Microfinance MIS
VITE_APP_VERSION=1.0.0
```

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── layouts/       # Layout components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API services
│   ├── context/       # React context providers
│   ├── utils/         # Utility functions
│   └── assets/        # Static assets
├── public/            # Public assets
├── package.json       # Dependencies and scripts
└── vite.config.js     # Vite configuration
```

## Development Notes

- The project uses Vite as the build tool
- Tailwind CSS for styling
- Radix UI for accessible components
- React Router for navigation
- Redux Toolkit for state management
- React Query for server state management

## Support

If you encounter any issues during installation, please:

1. Check the troubleshooting section above
2. Ensure you have the correct Node.js version
3. Try clearing npm cache and reinstalling
4. Check the console for specific error messages

For additional help, refer to the main project documentation or create an issue in the repository.
