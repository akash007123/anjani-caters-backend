const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Auth
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public (should be restricted in production)
const register = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, role, profilePic } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password manually before creating user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create user
        const user = await User.create({
            firstName,
            lastName,
            email,
            mobile,
            password: hashedPassword,
            role: role || 'Admin',
            profilePic: profilePic || ''
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            res.json({
                success: true,
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    profilePic: user.profilePic,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // For JWT tokens, logout is mainly handled on the client side
        // by removing the token. Here we can add server-side logging if needed.
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, profilePic } = req.body;
        
        // Find user by ID
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }
        
        // Update user fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        if (profilePic !== undefined) user.profilePic = profilePic;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                profilePic: user.profilePic,
                isActive: user.isActive,
                lastLogin: user.lastLogin
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if current password is correct
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update password
        user.password = hashedPassword;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user by admin
// @route   PUT /api/auth/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, role, profilePic, isActive } = req.body;
        const userId = req.params.id;
        
        // Find user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Check if email is already taken by another user
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already exists' });
            }
        }
        
        // Update user fields
        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (mobile !== undefined) user.mobile = mobile;
        if (role !== undefined) user.role = role;
        if (profilePic !== undefined) user.profilePic = profilePic;
        if (isActive !== undefined) user.isActive = isActive;
        
        await user.save();
        
        res.status(200).json({
            success: true,
            data: user,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete user by admin
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Find user by ID
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Prevent deleting the current admin user
        if (userId === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }
        
        await User.findByIdAndDelete(userId);
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    updateProfile,
    updatePassword,
    getAllUsers,
    updateUser,
    deleteUser
};
