const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Change password validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// Delete account validation
const validateAccountDeletion = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  
  handleValidationErrors
];

router.put('/password', protect, validatePasswordChange, changePassword);
router.delete('/account', protect, validateAccountDeletion, deleteAccount);

module.exports = router;