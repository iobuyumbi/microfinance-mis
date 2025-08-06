// server/routes/index.js
const express = require('express');
const router = express.Router();

// Modular route imports
const memberRoutes = require('./memberRoutes');
const groupRoutes = require('./groupRoutes');
const groupMembershipRoutes = require('./groupMembershipRoutes');

// --- API Route Mounts ---
// All member-related endpoints
router.use('/members', memberRoutes);
// All group-related endpoints
router.use('/groups', groupRoutes);
// All group membership endpoints (nested under /members for clarity)
router.use('/members', groupMembershipRoutes);

module.exports = router;
