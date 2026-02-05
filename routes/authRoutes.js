const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  refreshToken
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
