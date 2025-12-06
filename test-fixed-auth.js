const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('=== Testing Fixed Auth System ===');

async function testAuthFix() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Test user model loading
        const User = require('./models/User');
        console.log('✅ User model loaded successfully');

        // Test password hashing
        const testUser = new User({
            firstName: 'Test',
            lastName: 'Fix',
            email: 'testfix@test.com',
            mobile: '+1234567890',
            password: 'testpass123',
            role: 'Admin'
        });

        console.log('✅ Test user created (before save)');
        
        // Hash password manually before saving (simulating what the auth controller does)
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        testUser.password = await bcrypt.hash('testpass123', salt);
        
        await testUser.save();
        console.log('✅ User saved successfully with hashed password!');

        // Test password verification
        const passwordMatch = await testUser.matchPassword('testpass123');
        console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');

        if (passwordMatch) {
            console.log('\n🎉 AUTH FIX SUCCESSFUL!');
            console.log('The "next is not a function" error has been resolved.');
        } else {
            console.log('\n❌ Password verification failed');
        }

        // Clean up test user
        await User.deleteOne({ email: 'testfix@test.com' });
        console.log('✅ Test user cleaned up');

    } catch (error) {
        console.error('❌ Auth fix test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
    }
}

testAuthFix();