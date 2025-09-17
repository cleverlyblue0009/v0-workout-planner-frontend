const User = require('../models/User');
const { admin } = require('../config/firebase');

// @desc    Complete user profile setup (called after Firebase auth)
// @route   POST /api/auth/setup-profile
// @access  Private (requires Firebase token)
const setupProfile = async (req, res) => {
  try {
    const { name, profile, preferences } = req.body;
    const firebaseUid = req.firebaseUser.uid;

    // Update the user that was created in the middleware
    const user = req.user;
    
    // Update user information
    if (name) user.name = name;
    if (profile) {
      user.profile = { ...user.profile.toObject(), ...profile };
    }
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    // Calculate initial nutrition goals if profile data is provided
    if (profile?.weight && profile?.height && profile?.age && profile?.gender) {
      const tdee = user.calculateTDEE();
      if (tdee) {
        let targetCalories = tdee;
        
        // Adjust calories based on fitness goal
        switch (profile.fitnessGoal) {
          case 'weight-loss':
            targetCalories = Math.round(tdee * 0.8); // 20% deficit
            break;
          case 'weight-gain':
          case 'muscle-gain':
            targetCalories = Math.round(tdee * 1.1); // 10% surplus
            break;
          default:
            targetCalories = tdee; // maintenance
        }

        user.nutritionGoals.targetCalories = Math.max(1200, Math.min(4000, targetCalories));
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile setup completed successfully',
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          nutritionGoals: user.nutritionGoals,
          streak: user.streak
        }
      }
    });
  } catch (error) {
    console.error('Profile setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile setup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Sync user data with Firebase (called on login)
// @route   POST /api/auth/sync
// @access  Private (requires Firebase token)
const syncUser = async (req, res) => {
  try {
    const firebaseUser = req.firebaseUser;
    let user = req.user;

    // Update last login and email verification status
    user.lastLogin = new Date();
    user.emailVerified = firebaseUser.email_verified || false;
    
    // Update email if it changed in Firebase
    if (firebaseUser.email && firebaseUser.email !== user.email) {
      user.email = firebaseUser.email;
    }

    // Update name if it changed in Firebase and user hasn't set a custom name
    if (firebaseUser.name && !user.name.includes('@')) {
      user.name = firebaseUser.name;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User synced successfully',
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          nutritionGoals: user.nutritionGoals,
          streak: user.streak,
          achievements: user.achievements,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified
        }
      }
    });
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user sync',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          nutritionGoals: user.nutritionGoals,
          streak: user.streak,
          achievements: user.achievements,
          lastLogin: user.lastLogin,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, profile, preferences } = req.body;
    const user = req.user;

    // Update fields
    if (name) user.name = name;
    if (profile) {
      user.profile = { ...user.profile.toObject(), ...profile };
    }
    if (preferences) {
      user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    // Recalculate nutrition goals if relevant profile data changed
    if (profile && (profile.weight || profile.height || profile.age || profile.gender || profile.activityLevel || profile.fitnessGoal)) {
      const tdee = user.calculateTDEE();
      if (tdee) {
        let targetCalories = tdee;
        
        switch (user.profile.fitnessGoal) {
          case 'weight-loss':
            targetCalories = Math.round(tdee * 0.8);
            break;
          case 'weight-gain':
          case 'muscle-gain':
            targetCalories = Math.round(tdee * 1.1);
            break;
          default:
            targetCalories = tdee;
        }

        user.nutritionGoals.targetCalories = Math.max(1200, Math.min(4000, targetCalories));
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firebaseUid: user.firebaseUid,
          name: user.name,
          email: user.email,
          profile: user.profile,
          preferences: user.preferences,
          nutritionGoals: user.nutritionGoals,
          streak: user.streak
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    const firebaseUid = req.firebaseUser.uid;

    // Delete user from Firebase
    try {
      await admin.auth().deleteUser(firebaseUid);
    } catch (firebaseError) {
      console.error('Firebase user deletion error:', firebaseError);
      // Continue with soft delete even if Firebase deletion fails
    }

    // Soft delete - mark as inactive instead of deleting
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  setupProfile,
  syncUser,
  getMe,
  updateProfile,
  deleteAccount
};