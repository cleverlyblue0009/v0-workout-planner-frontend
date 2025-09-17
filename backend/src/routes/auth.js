const express = require('express');
const {
  setupProfile,
  syncUser,
  getMe,
  updateProfile,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateProfileSetup,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

// Protected routes (all require Firebase authentication)
router.post('/setup-profile', protect, validateProfileSetup, setupProfile);
router.post('/sync', protect, syncUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.delete('/account', protect, deleteAccount);

module.exports = router;