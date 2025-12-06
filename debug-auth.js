const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

dotenv.config();

console.log('=== DEBUG: Starting Auth System Debug ===');
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
console.log('PORT:', process.env.PORT || 5000);
console.log('');

async function testDatabaseConnection() {
    try {
        console.log('Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
        
        // Check if users collection exists and has data
        const User = require('./models/User');
        const userCount = await User.countDocuments();
        console.log(`📊 Users in database: ${userCount}`);
        
        if (userCount === 0) {
            console.log('⚠️  No users found! Creating a test user...');
            const testUser = new User({
                firstName: 'Test',
                lastName: 'Admin',
                email: 'admin@test.com',
                mobile: '+1234567890',
                password: '123456',
                role: 'Admin'
            });
            await testUser.save();
            console.log('✅ Test user created: admin@test.com / 123456');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Database error:', error.message);
        return false;
    }
}

async function testAuthEndpoint() {
    try {
        console.log('Testing auth endpoint...');
        
        const User = require('./models/User');
        const jwt = require('jsonwebtoken');
        
        const user = await User.findOne({ email: 'admin@test.com' });
        if (!user) {
            console.log('❌ Test user not found');
            return;
        }
        
        console.log('✅ Found test user:', user.email);
        console.log('Password hash exists:', !!user.password);
        
        // Test password match
        const passwordMatch = await user.matchPassword('123456');
        console.log('Password match:', passwordMatch);
        
        // Test JWT generation
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        console.log('JWT token generated:', token ? '✅' : '❌');
        
        return true;
    } catch (error) {
        console.error('❌ Auth endpoint test failed:', error.message);
        return false;
    }
}

async function startDebugServer() {
    try {
        console.log('Starting debug server...');
        
        const dbConnected = await testDatabaseConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server without database connection');
            return;
        }
        
        await testAuthEndpoint();
        
        const app = express();
        app.use(cors({ origin: "*" }));
        app.use(express.json());
        
        // Simple test endpoint
        app.get('/api/test', (req, res) => {
            res.json({ message: 'Debug server is running', timestamp: new Date().toISOString() });
        });
        
        // Login endpoint for testing
        app.post('/api/auth/login', async (req, res) => {
            console.log('🔍 Login attempt:', req.body.email);
            
            try {
                const { email, password } = req.body;
                
                const User = require('./models/User');
                const jwt = require('jsonwebtoken');
                
                const user = await User.findOne({ email }).select('+password');
                
                if (user && await user.matchPassword(password)) {
                    console.log('✅ Login successful for:', email);
                    
                    user.lastLogin = Date.now();
                    await user.save();
                    
                    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
                    
                    res.json({
                        success: true,
                        data: {
                            _id: user._id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            token: token
                        }
                    });
                } else {
                    console.log('❌ Invalid credentials for:', email);
                    res.status(401).json({ success: false, message: 'Invalid credentials' });
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                res.status(500).json({ success: false, message: 'Server error', error: error.message });
            }
        });
        
        const PORT = process.env.PORT || 5001; // Use different port to avoid conflicts
        const server = app.listen(PORT, () => {
            console.log(`🚀 Debug server running on port ${PORT}`);
            console.log(`📝 Test login: POST http://localhost:${PORT}/api/auth/login`);
            console.log(`📝 Test endpoint: GET http://localhost:${PORT}/api/test`);
            console.log(`🔑 Test credentials: admin@test.com / 123456`);
        });
        
        return server;
    } catch (error) {
        console.error('❌ Failed to start debug server:', error);
    }
}

// Run the debug process
startDebugServer().catch(console.error);