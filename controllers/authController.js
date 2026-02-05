const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AdminUser = require('../models/AdminUser');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

// Generate Refresh Token
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Send response with tokens
const createSendToken = (adminUser, statusCode, res) => {
  const token = signToken(adminUser._id);
  const refreshToken = signRefreshToken(adminUser._id);

  // Remove password from output
  adminUser.password = undefined;
  adminUser.refreshToken = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    data: {
      adminUser
    }
  });
};

// @desc    Register new admin user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      username,
      mobile,
      password,
      confirmPassword,
      profilePic,
      dateOfBirth,
      gender,
      address,
      country,
      state,
      city,
      role
    } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if user already exists
    const existingUser = await AdminUser.findOne({
      $or: [{ email }, { username }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, username, or mobile already exists'
      });
    }

    // Create admin user
    const adminUser = await AdminUser.create({
      name,
      email,
      username,
      mobile,
      password,
      profilePic,
      dateOfBirth,
      gender,
      address,
      country,
      state,
      city,
      role: role || 'sub-admin' // Default role if not specified
    });

    createSendToken(adminUser, 201, res);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login admin user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { emailOrUsernameOrMobile, password } = req.body;

    // Validate input
    if (!emailOrUsernameOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username/mobile and password'
      });
    }

    // Find user by email, username, or mobile
    const adminUser = await AdminUser.findOne({
      $or: [
        { email: emailOrUsernameOrMobile.toLowerCase() },
        { username: emailOrUsernameOrMobile },
        { mobile: emailOrUsernameOrMobile }
      ]
    }).select('+password');

    // Check if user exists and password is correct
    if (!adminUser || !(await adminUser.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!adminUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Update last login
    adminUser.lastLogin = new Date();
    await adminUser.save({ validateBeforeSave: false });

    createSendToken(adminUser, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Logout admin user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

// @desc    Get current logged in admin user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const adminUser = await AdminUser.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        adminUser
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const adminUser = await AdminUser.findById(decoded.id).select('+refreshToken');

    if (!adminUser || adminUser.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = signToken(adminUser._id);
    const newRefreshToken = signRefreshToken(adminUser._id);

    // Update refresh token in database
    adminUser.refreshToken = newRefreshToken;
    await adminUser.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    });
  }
};

// @desc    Get user by ID (admin only)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const adminUser = await AdminUser.findById(req.params.id).select('-password');

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        adminUser
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Update user by ID (admin only)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const {
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
    } = req.body;

    // Check if user exists
    let adminUser = await AdminUser.findById(req.params.id);

    if (!adminUser) {
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
    adminUser = await AdminUser.findByIdAndUpdate(
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
      data: {
        adminUser
      },
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
};

// @desc    Delete user by ID (admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Check if user exists
    const adminUser = await AdminUser.findById(req.params.id);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (adminUser._id.toString() === req.user._id.toString()) {
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
};
