# Middleware Architecture Explanation

## 🏗️ **Clean Middleware Structure**

Your backend now has a clean, modular middleware architecture that follows best practices for error handling, authentication, and validation.

## 📁 **Middleware Components**

### 1. **Authentication & Authorization** (`middleware/auth.js`)

```javascript
// Core authentication middleware
const { protect, authorize } = require('../middleware/auth');

// Usage:
router.get('/protected', protect, authorize('admin', 'officer'), handler);
```

**Functions:**

- `protect` - Verifies JWT token and attaches user to request
- `authorize(...roles)` - Checks if user has required role(s)

### 2. **Error Handling** (`middleware/errorHandler.js`)

```javascript
// Global error handler - catches all errors
const errorHandler = (err, req, res, next) => {
  // Handles different error types:
  // - Mongoose validation errors
  // - JWT errors
  // - Cast errors (invalid ObjectId)
  // - Duplicate key errors
};
```

**Error Types Handled:**

- ✅ **Mongoose CastError** → 404 "Resource not found"
- ✅ **Mongoose ValidationError** → 400 with field-specific messages
- ✅ **Duplicate Key (11000)** → 400 "Field already exists"
- ✅ **JWT Errors** → 401 "Invalid token" or "Token expired"
- ✅ **Custom ErrorResponse** → Uses provided statusCode and message

### 3. **Async Handler** (`middleware/asyncHandler.js`)

```javascript
// Wraps async route handlers to catch errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage:
router.get(
  '/data',
  asyncHandler(async (req, res) => {
    const data = await someAsyncOperation();
    res.json(data);
  })
);
```

**Purpose:**

- Eliminates try-catch blocks in controllers
- Automatically forwards errors to errorHandler
- Keeps controllers clean and focused

### 4. **Not Found** (`middleware/notFound.js`)

```javascript
// 404 handler for unmatched routes
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
```

**Usage:**

- Placed after all routes in server.js
- Catches any unmatched routes

### 5. **Validation** (`middleware/validate.js`)

```javascript
// Input validation middleware
const {
  validateObjectId,
  validateRequiredFields,
  validatePagination,
} = require('../middleware/validate');

// Usage:
router.get('/:id', validateObjectId, handler);
router.post('/', validateRequiredFields(['name', 'email']), handler);
router.get('/', validatePagination, handler);
```

**Functions:**

- `validateObjectId` - Validates MongoDB ObjectId format
- `validateRequiredFields(fields)` - Checks for required request body fields
- `validatePagination` - Validates page/limit query parameters

## 🔄 **Error Flow Architecture**

### **Request Flow:**

```
1. Request comes in
2. Authentication middleware (protect, authorize)
3. Validation middleware (validateObjectId, validateRequiredFields)
4. Route handler (wrapped in asyncHandler)
5. If error occurs → ErrorHandler middleware
6. Response sent to client
```

### **Error Flow:**

```
1. Error thrown in controller
2. asyncHandler catches it
3. Error passed to next(error)
4. errorHandler processes error
5. Appropriate HTTP status and message sent
```

## 🛠️ **ErrorResponse Utility**

### **Purpose:**

The `ErrorResponse` class provides consistent error handling across the application.

```javascript
// utils/errorResponse.js
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage in controllers:
throw new ErrorResponse('User not found', 404);
throw new ErrorResponse('Invalid credentials', 401);
```

### **Benefits:**

- ✅ Consistent error format
- ✅ Proper HTTP status codes
- ✅ Clean error messages
- ✅ Easy to extend and customize

## 📋 **Middleware Usage Examples**

### **Protected Route with Role Authorization:**

```javascript
router.get(
  '/admin-only',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    // Only admins can access this
    const data = await getAdminData();
    res.json(data);
  })
);
```

### **Route with Validation:**

```javascript
router.post(
  '/users',
  protect,
  authorize('admin'),
  validateRequiredFields(['name', 'email', 'role']),
  asyncHandler(async (req, res) => {
    // Validation ensures required fields exist
    const user = await createUser(req.body);
    res.status(201).json(user);
  })
);
```

### **Route with ObjectId Validation:**

```javascript
router.get(
  '/users/:id',
  protect,
  validateObjectId, // Ensures :id is valid ObjectId
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    res.json(user);
  })
);
```

## 🎯 **Key Benefits**

### **1. Clean Controllers**

- No try-catch blocks needed
- Focus on business logic
- Consistent error handling

### **2. Centralized Error Handling**

- All errors processed in one place
- Consistent error responses
- Easy to modify error behavior

### **3. Reusable Middleware**

- Modular and composable
- Easy to test individually
- Consistent across routes

### **4. Type Safety**

- Proper validation of inputs
- Clear error messages
- Prevents invalid data

## 🔧 **Middleware Stack in server.js**

```javascript
// Security middleware (first)
app.use(helmet());
app.use(cors());
app.use(rateLimit());

// Body parsing
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... other routes

// Error handling (last)
app.use(notFound);
app.use(errorHandler);
```

## ✅ **Verification**

Your middleware architecture is now:

- ✅ **Clean and modular**
- ✅ **Properly structured**
- ✅ **Error handling optimized**
- ✅ **Validation comprehensive**
- ✅ **Authentication secure**
- ✅ **Production ready**

The middleware system provides a robust foundation for your Microfinance MIS backend! 🚀
