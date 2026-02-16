// Quick script to normalize all city names in the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Project = require('../models/Project');
const Property = require('../models/Property');

// Normalize city function
const normalizeCity = (city) => {
    if (!city) return city;
    return city
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
};

async function normalizeCities() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        let projectsUpdated = 0;
        let propertiesUpdated = 0;

        // Normalize Projects
        console.log('📦 Normalizing Projects...');
        const projects = await Project.find({});
        console.log(`Found ${projects.length} projects`);

        for (const project of projects) {
            if (project.location && project.location.city) {
                const originalCity = project.location.city;
                const normalizedCity = normalizeCity(originalCity);

                if (originalCity !== normalizedCity) {
                    project.location.city = normalizedCity;
                    await project.save();
                    projectsUpdated++;
                    console.log(`  ✓ Updated: "${originalCity}" → "${normalizedCity}"`);
                }
            }
        }

        // Normalize Properties
        console.log('\n🏠 Normalizing Properties...');
        const properties = await Property.find({});
        console.log(`Found ${properties.length} properties`);

        for (const property of properties) {
            if (property.location && property.location.city) {
                const originalCity = property.location.city;
                const normalizedCity = normalizeCity(originalCity);

                if (originalCity !== normalizedCity) {
                    property.location.city = normalizedCity;
                    await property.save();
                    propertiesUpdated++;
                    console.log(`  ✓ Updated: "${originalCity}" → "${normalizedCity}"`);
                }
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('✅ NORMALIZATION COMPLETE!');
        console.log('='.repeat(50));
        console.log(`📦 Projects updated: ${projectsUpdated}`);
        console.log(`🏠 Properties updated: ${propertiesUpdated}`);
        console.log(`📊 Total updates: ${projectsUpdated + propertiesUpdated}`);
        console.log('='.repeat(50) + '\n');

        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run the script
normalizeCities();
