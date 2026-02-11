const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');
const User = require('../models/User');
require('dotenv').config();

// Set Google DNS to bypass local DNS issues with SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedAdmin = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri, { family: 4 });
        console.log('MongoDB Connected...');

        const adminEmail = 'aman@daamrideals.com';
        const adminPassword = 'Aman.DD@1212';

        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user already exists. Updating credentials...');
        } else {
            console.log('Creating admin user...');
            admin = new User({
                name: 'Admin Aman',
                email: adminEmail,
                phone: '0000000000',
                city: 'AdminCity',
                userType: 'Other',
                isVerified: true,
                isAdmin: true
            });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(adminPassword, salt);

        // Remove PIN if it exists to ensure password is the primary login for admin
        admin.pin = undefined;

        await admin.save();
        console.log('Admin user seeded successfully!');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
};

seedAdmin();
