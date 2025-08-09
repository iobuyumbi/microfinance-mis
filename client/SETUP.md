# Client Setup Guide

## Environment Configuration

1. Create a `.env` file in the client directory:

   ```bash
   touch .env
   ```

2. Add the following environment variables to your `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_DEBUG=false
   ```

## Installation Steps

1. Install dependencies:

   ```bash
   npm install
   # or
   pnpm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Troubleshooting

### Common Issues

1. **API Connection Error**: Make sure your backend server is running on port 5000
2. **Missing Dependencies**: Run `npm install` to install all required packages
3. **Port Already in Use**: Change the port in `vite.config.js` or kill the process using the port

### Development Tips

- The app uses React Router for navigation
- Authentication state is managed through React Context
- All API calls are centralized in `src/services/api.js`
- UI components are built with shadcn/ui and Tailwind CSS
