// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // Ensure crypto is imported for token generation
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      unique: true, // Assuming phone numbers are unique
      sparse: true, // Allows null/undefined values for unique constraint
    },
    nationalID: {
      type: String,
      unique: true, // Assuming National IDs are unique
      sparse: true, // Allows null/undefined values for unique constraint
    },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      // Merged roles: 'user' for general users, 'member' for active microfinance participants,
      // 'leader' for group leaders, 'officer' for loan officers, 'admin' for administrators.
      enum: ['user', 'member', 'leader', 'officer', 'admin'],
      default: 'user', // Default to 'user' for new registrations, then upgraded to 'member'/'leader' etc.
    },
    status: {
      type: String,
      // Merged statuses: 'pending' added for initial states, 'active', 'inactive', 'suspended'
      enum: ['active', 'inactive', 'suspended', 'pending'],
      default: 'active',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // New fields for member-specific attributes
    isMember: {
      type: Boolean,
      default: false, // True if the user is an active participant in microfinance activities
    },
    memberId: {
      // A unique ID for microfinance members, if different from _id
      type: String,
      unique: true,
      sparse: true, // Allows null values, so not all users need a memberId
    },
  },
  {
    timestamps: true, // Keep your existing timestamps
    toJSON: { virtuals: true }, // Enable virtuals for JSON output
    toObject: { virtuals: true }, // Enable virtuals for Object output
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token (using your method name)
UserSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Virtual for user's group memberships (fetched via UserGroupMembership model)
UserSchema.virtual('groupMemberships', {
  ref: 'UserGroupMembership',
  localField: '_id',
  foreignField: 'user',
  justOne: false,
});

module.exports = mongoose.model('User', UserSchema);
