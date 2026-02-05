const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/logout', logout);

// Role-based routes (only admin can manage other users)
router.get('/users', protect, authorize('admin', 'sub-admin'), async (req, res) => {
  try {
    const AdminUser = require('../models/AdminUser');
    const users = await AdminUser.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get single user by ID (admin only)
router.get('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const AdminUser = require('../models/AdminUser');
    const user = await AdminUser.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// Update user by ID (admin only)
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const AdminUser = require('../models/AdminUser');
    const { name, email, username, mobile, dateOfBirth, gender, address, country, state, city, role, profilePic } = req.body;
    
    // Check if user exists
    let user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email/username/mobile is already taken by another user
    const existingUser = await AdminUser.findOne({
      $or: [
        { email: email.toLowerCase(), _id: { $ne: req.params.id } },
        { username: username, _id: { $ne: req.params.id } },
        { mobile: mobile, _id: { $ne: req.params.id } }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, username, or mobile already exists'
      });
    }
    
    // Update user
    user = await AdminUser.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        username,
        mobile,
        dateOfBirth,
        gender,
        address,
        country,
        state,
        city,
        role,
        profilePic
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// Delete user by ID (admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const AdminUser = require('../models/AdminUser');
    
    // Check if user exists
    const user = await AdminUser.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await AdminUser.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

router.patch('/update-role/:id', authorize('admin'), async (req, res) => {
  try {
    const AdminUser = require('../models/AdminUser');
    const { role } = req.body;
    
    if (!['admin', 'sub-admin', 'manager'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    const user = await AdminUser.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

module.exports = router;
