# Troubleshooting Guide - Microfinance MIS

## Issue: 403 Forbidden Errors

You're experiencing 403 Forbidden errors when trying to access the API. This guide will help you resolve these issues.

## Quick Diagnosis

### 1. Check Backend Server Status

First, verify if your backend server is running:

```bash
# Navigate to server directory
cd server

# Check if server is running
npm start
# or
node server.js
```

**Expected Output:**
```
Server running on port 5000
Connected to MongoDB
```

### 2. Test API Connection

Use the built-in connection diagnostic tool:

1. Go to the landing page (`/`)
2. Click the "Connection Test" button in the header
3. Review the diagnostic results

## Common Solutions

### Solution 1: Backend Server Not Running

**Problem:** Backend server is not started or crashed

**Fix:**
```bash
# Navigate to server directory
cd server

# Install dependencies (if not done)
npm install

# Start the server
npm start
```

**Verify:** Server should show "Server running on port 5000"

### Solution 2: Environment Variables

**Problem:** Missing or incorrect environment variables

**Fix:** Create/update `.env` file in server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/microfinance
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

### Solution 3: CORS Configuration

**Problem:** CORS errors preventing frontend from accessing backend

**Fix:** Update server CORS configuration in `server/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
```

### Solution 4: Authentication Issues

**Problem:** Invalid or expired authentication tokens

**Fix:**
1. Clear browser storage:
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. Log in again with valid credentials

### Solution 5: Database Connection

**Problem:** MongoDB not running or connection issues

**Fix:**
```bash
# Start MongoDB (if using local installation)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

## Development Mode Solutions

### Option 1: Use Mock Data (Recommended for Development)

If you want to continue development without the backend:

1. **Update service files** to use mock data when API fails:

```javascript
// Example: userService.js
import { mockUsers, simulateApiDelay, createMockResponse } from './mockData';

export const userService = {
  getAll: async () => {
    try {
      const response = await api.get('/users');
      return response;
    } catch (error) {
      console.warn('Using mock data due to API error:', error.message);
      await simulateApiDelay();
      return createMockResponse(mockUsers);
    }
  },
  // ... other methods
};
```

2. **Enable mock mode** by setting environment variable:

```env
# In client/.env
VITE_USE_MOCK_DATA=true
```

### Option 2: Disable Authentication Temporarily

For development, you can temporarily disable authentication checks:

```javascript
// In AuthContext.jsx, temporarily bypass authentication
const getMe = useCallback(async () => {
  // For development only
  if (process.env.NODE_ENV === 'development') {
    const mockUser = {
      _id: "1",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      status: "active"
    };
    setUser(mockUser);
    return mockUser;
  }
  // ... rest of the function
}, []);
```

## Step-by-Step Resolution

### Step 1: Check Server Status
```bash
cd server
npm start
```

### Step 2: Verify Database
```bash
# Check if MongoDB is running
mongo
# or
mongosh
```

### Step 3: Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test authentication endpoint
curl http://localhost:5000/api/auth/status
```

### Step 4: Check Frontend Configuration
Verify `client/src/services/api.js` has correct base URL:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ...
});
```

### Step 5: Clear Browser Cache
1. Open browser developer tools
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

## Environment Setup Checklist

### Backend Requirements:
- [ ] Node.js (v14 or higher)
- [ ] MongoDB (local or Atlas)
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Server running on port 5000

### Frontend Requirements:
- [ ] Node.js (v14 or higher)
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Development server running

### Network Requirements:
- [ ] Port 5000 accessible
- [ ] CORS properly configured
- [ ] No firewall blocking requests

## Debugging Tools

### 1. Browser Developer Tools
- Check Network tab for failed requests
- Check Console for error messages
- Check Application tab for localStorage

### 2. Server Logs
```bash
# Check server logs
cd server
npm start
# Look for error messages in terminal
```

### 3. API Testing
```bash
# Test with curl
curl -X GET http://localhost:5000/api/health
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Common Error Messages

### "Request failed with status code 403"
- **Cause:** Authentication required or insufficient permissions
- **Solution:** Check authentication token and user permissions

### "Network error – please check your internet connection"
- **Cause:** Backend server not running or network issues
- **Solution:** Start backend server and check network connectivity

### "Access denied"
- **Cause:** User doesn't have permission for the requested resource
- **Solution:** Check user role and resource permissions

### "Session expired. Please login again"
- **Cause:** JWT token expired or invalid
- **Solution:** Log in again to get a new token

## Getting Help

If you're still experiencing issues:

1. **Check the diagnostic tool** on the landing page
2. **Review server logs** for specific error messages
3. **Verify all environment variables** are set correctly
4. **Test with a simple API call** using curl or Postman
5. **Check if the issue is specific to certain endpoints**

## Quick Fix Commands

```bash
# Restart everything
cd server && npm start &
cd client && npm run dev

# Clear all data
localStorage.clear()
npm run build && npm start

# Reset to default state
git checkout -- .
npm install
npm start
```

This troubleshooting guide should help you resolve the 403 errors and get your microfinance application running properly. 