/**
 * Seed Admin Credential Script
 * 
 * Usage: node admin/scripts/seedAdmin.js
 * 
 * This will create the default admin account in the "Admin-credential" collection.
 * If an admin with the same email already exists, it will skip creation.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the root of damrideal-api
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AdminCredential = require('../models/AdminCredential');

const ADMIN_EMAIL = 'admin@damrideal.com';
const ADMIN_PASSWORD = 'Admin@123';  // Change this in production!
const ADMIN_NAME = 'Damrideal Admin';

async function seedAdmin() {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/damrideals';

        await mongoose.connect(MONGO_URI, { family: 4 });
        console.log('✅ MongoDB connected');

        // Check if admin already exists
        const existingAdmin = await AdminCredential.findOne({ email: ADMIN_EMAIL });

        if (existingAdmin) {
            console.log(`⚠️  Admin with email "${ADMIN_EMAIL}" already exists. Skipping.`);
            await mongoose.disconnect();
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

        // Create admin
        const admin = new AdminCredential({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            name: ADMIN_NAME,
            role: 'super-admin',
            isActive: true
        });

        await admin.save();
        console.log('✅ Admin credential created successfully!');
        console.log(`   📧 Email: ${ADMIN_EMAIL}`);
        console.log(`   🔑 Password: ${ADMIN_PASSWORD}`);
        console.log(`   📁 Collection: Admin-credential`);

        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected');

    } catch (err) {
        console.error('❌ Error seeding admin:', err.message);
        process.exit(1);
    }
}

seedAdmin();
