const { admin } = require('../config/firebase');
const User = require('../models/User');

// Protect routes middleware using Firebase ID tokens
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Get or create user from Firebase UID
      let user = await User.findOne({ firebaseUid: decodedToken.uid }).select('-password');
      
      if (!user) {
        // If user doesn't exist in our database, create a minimal user record
        // This handles cases where users sign up via Firebase but haven't completed profile setup
        user = await User.create({
          firebaseUid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
          profile: {},
          preferences: {}
        });
      }

      req.user = user;
      req.firebaseUser = decodedToken; // Also store Firebase user data
      next();
    } catch (error) {
      console.error('Firebase token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied - Admin only'
    });
  }
};

module.exports = { protect, adminOnly };