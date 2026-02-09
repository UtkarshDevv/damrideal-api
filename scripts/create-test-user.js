// Create a test user in the database
// Run with: node scripts/create-test-user.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const createTestUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('MongoDB connected');

        // Check if test user exists
        const existingUser = await User.findOne({ email: 'test@test.com' });
        if (existingUser) {
            console.log('Test user already exists!');
            console.log('Email: test@test.com');
            console.log('PIN: 123456');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash the PIN
        const salt = await bcrypt.genSalt(10);
        const hashedPin = await bcrypt.hash('123456', salt);

        // Create test user
        const testUser = new User({
            name: 'Test User',
            email: 'test@test.com',
            phone: '9999999999',
            city: 'Noida',
            userType: 'Buyer',
            pin: hashedPin,
            isVerified: true
        });

        await testUser.save();

        console.log('\n✅ Test user created successfully!');
        console.log('========================================');
        console.log('Email: test@test.com');
        console.log('PIN: 123456');
        console.log('========================================\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createTestUser();
