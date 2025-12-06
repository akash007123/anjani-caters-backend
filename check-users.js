const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        
        const User = require('./models/User');
        const users = await User.find({}, { email: 1, firstName: 1, lastName: 1, role: 1, createdAt: 1 });
        
        console.log('\n=== USERS IN DATABASE ===');
        if (users.length === 0) {
            console.log('❌ No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - ${user.role} - Created: ${user.createdAt}`);
            });
        }
        
        console.log(`\n📊 Total users: ${users.length}`);
        
        // Check if we need to create a test user
        const testUserExists = await User.findOne({ email: 'admin@test.com' });
        if (!testUserExists) {
            console.log('\n⚠️  Creating test user...');
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
        
        // Also create a simpler test user
        const adminUserExists = await User.findOne({ email: 'admin@anjanicaters.com' });
        if (!adminUserExists) {
            console.log('\n⚠️  Creating admin user...');
            const adminUser = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@anjanicaters.com',
                mobile: '+1987654321',
                password: 'admin123',
                role: 'Admin'
            });
            await adminUser.save();
            console.log('✅ Admin user created: admin@anjanicaters.com / admin123');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
    }
}

checkUsers();