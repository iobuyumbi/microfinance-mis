# 🌍 Environment Configuration Guide

## 🔐 **Production Environment Variables**

### **Render (Backend) Environment Variables**

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://iobuyumbi:0101@cluster0.vrfaubu.mongodb.net/microfinance-mis?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=microfinance-mis-super-secret-jwt-key-2024
JWT_EXPIRE=30d

# Server Configuration
PORT=5000
NODE_ENV=production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=iobuyumbi@gmail.com
EMAIL_PASSWORD=ptwp ouak wnrh alnw
FROM_NAME=Microfinance MIS
FROM_EMAIL=noreply@microfinance-mis.com

# Frontend URL for CORS
CLIENT_URL=https://microfinance-mis.vercel.app
FRONTEND_URL=https://microfinance-mis.vercel.app

# CORS Configuration
CORS_ORIGIN=https://microfinance-mis.vercel.app

# Build Configuration
NODE_VERSION=20
ESLINT_NO_DEV_ERRORS=true
```

### **Vercel (Frontend) Environment Variables**

```env
# API Configuration
VITE_API_URL=https://microfinance-mis.onrender.com/api

# Build Configuration
NODE_VERSION=20
ESLINT_NO_DEV_ERRORS=true
```

## 🚨 **Critical Issues to Fix**

### **1. Add Missing Variables in Render**

- [ ] `CLIENT_URL=https://microfinance-mis.vercel.app`
- [ ] `CORS_ORIGIN=https://microfinance-mis.vercel.app`
- [ ] `NODE_VERSION=20`
- [ ] `ESLINT_NO_DEV_ERRORS=true`

### **2. Fix Variable Names**

- [ ] Change `JWT_EXPIRES_IN` to `JWT_EXPIRE`
- [ ] Change `EMAIL_USERNAME` to `EMAIL_USER`

### **3. Update JWT Secret**

- [ ] Change `JWT_SECRET` from `mysecretkey` to `microfinance-mis-super-secret-jwt-key-2024`

## 🔧 **How to Update Render Environment**

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add/update the variables above
5. **Redeploy** your service

## 🔧 **How to Update Vercel Environment**

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add/update the variables above
5. **Redeploy** your project

## 📋 **Environment Variable Checklist**

### **Backend (Render)**

- [ ] `MONGO_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Strong JWT secret key
- [ ] `JWT_EXPIRE` - JWT expiration time
- [ ] `PORT` - Server port (5000)
- [ ] `NODE_ENV` - Environment (production)
- [ ] `EMAIL_HOST` - SMTP host
- [ ] `EMAIL_PORT` - SMTP port
- [ ] `EMAIL_USER` - Email username
- [ ] `EMAIL_PASSWORD` - Email app password
- [ ] `FROM_NAME` - Sender name
- [ ] `FROM_EMAIL` - Sender email
- [ ] `CLIENT_URL` - Frontend URL
- [ ] `FRONTEND_URL` - Frontend URL
- [ ] `CORS_ORIGIN` - CORS origin
- [ ] `NODE_VERSION` - Node.js version
- [ ] `ESLINT_NO_DEV_ERRORS` - ESLint configuration

### **Frontend (Vercel)**

- [ ] `VITE_API_URL` - Backend API URL
- [ ] `NODE_VERSION` - Node.js version
- [ ] `ESLINT_NO_DEV_ERRORS` - ESLint configuration

## 🚀 **After Updating Environment Variables**

1. **Redeploy Backend** on Render
2. **Redeploy Frontend** on Vercel
3. **Test All Endpoints**:

   ```bash
   # Test backend
   curl https://microfinance-mis.onrender.com/
   curl https://microfinance-mis.onrender.com/status
   curl https://microfinance-mis.onrender.com/api-docs

   # Test frontend
   # Visit https://microfinance-mis.vercel.app
   ```

## 🔒 **Security Recommendations**

1. **Use Strong JWT Secrets** (32+ characters)
2. **Rotate Secrets Regularly**
3. **Use Environment-Specific Secrets**
4. **Never Commit .env Files**
5. **Use App Passwords for Gmail**

---

**Status**: Ready for environment configuration  
**Priority**: High - Required for production deployment
