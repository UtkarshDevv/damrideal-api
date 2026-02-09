// Seed requirements data to the database
// Run with: node scripts/seed-requirements.js

require('dotenv').config();
const mongoose = require('mongoose');
const Requirement = require('../models/Requirement');
const User = require('../models/User');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const requirements = [
    {
        category: 'Buyer',
        budgetMin: 1500000,
        budgetMax: 2000000,
        location: 'Sector 150, Noida',
        size: '2.5 BHK',
        customRequirement: 'Looking for a premium apartment with golf course view. Prefer ready to move or near possession.',
        type: 'Investor',
        status: 'Open'
    },
    {
        category: 'Buyer',
        budgetMin: 8000000,
        budgetMax: 15000000,
        location: 'Gurugram',
        size: '3 BHK',
        customRequirement: 'Need a luxury apartment in Golf Course Road area with modern amenities and good connectivity.',
        type: 'Channel',
        status: 'Open'
    },
    {
        category: 'Seller',
        budgetMin: 5000000,
        budgetMax: 7000000,
        location: 'Noida Extension',
        size: '4 BHK',
        customRequirement: 'Want to sell 4 BHK villa in prime location. Property is 2 years old with all modern amenities.',
        type: 'Service Provider',
        status: 'Open'
    },
    {
        category: 'Buyer',
        budgetMin: 2000000,
        budgetMax: 3000000,
        location: 'Greater Noida',
        size: '2 BHK',
        customRequirement: 'Looking for affordable housing with good schools and hospitals nearby. Prefer gated community.',
        type: 'Investor',
        status: 'In Progress'
    }
];

const seedRequirements = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log('MongoDB connected');

        // Get test user
        const testUser = await User.findOne({ email: 'test@test.com' });
        if (!testUser) {
            console.log('❌ Test user not found. Run create-test-user.js first.');
            process.exit(1);
        }

        // Clear existing requirements
        await Requirement.deleteMany({});
        console.log('Cleared existing requirements');

        // Add userId to each requirement
        const requirementsWithUser = requirements.map(req => ({
            ...req,
            userId: testUser._id
        }));

        // Insert requirements
        const insertedRequirements = await Requirement.insertMany(requirementsWithUser);
        console.log(`Inserted ${insertedRequirements.length} requirements`);

        console.log('\nSeeded Requirements:');
        insertedRequirements.forEach(r => {
            console.log(`- ${r.category} | ${r.location} | ₹${r.budgetMin / 100000}L - ₹${r.budgetMax / 100000}L`);
        });

        console.log('\n✅ Requirements seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

seedRequirements();
