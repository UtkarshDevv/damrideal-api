/**
 * Migration Script: Normalize City Names
 * 
 * This script normalizes all city names in the database to ensure consistency.
 * Cities like "noida", "NOIDA", "Noida" will all become "Noida" (Title Case)
 * 
 * Run: node scripts/normalize-cities.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Property = require('../models/Property');

// Helper function to normalize city names (capitalizes first letter of each word)
const normalizeCity = (city) => {
    if (!city || typeof city !== 'string') return '';
    return city
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

async function normalizeCities() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Normalize Projects
        console.log('📦 Normalizing Project cities...');
        const projects = await Project.find({});
        let projectsUpdated = 0;

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
        console.log(`✅ Projects: ${projectsUpdated} records updated out of ${projects.length} total\n`);

        // Normalize Properties
        console.log('🏠 Normalizing Property cities...');
        const properties = await Property.find({});
        let propertiesUpdated = 0;

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
        console.log(`✅ Properties: ${propertiesUpdated} records updated out of ${properties.length} total\n`);

        // Show unique cities after normalization
        console.log('📍 Unique cities after normalization:');
        const projectCities = await Project.distinct('location.city');
        const propertyCities = await Property.distinct('location.city');
        const allCities = [...new Set([...projectCities, ...propertyCities])].filter(Boolean).sort();

        console.log('  Projects:', projectCities.filter(Boolean).sort().join(', '));
        console.log('  Properties:', propertyCities.filter(Boolean).sort().join(', '));
        console.log('  Combined:', allCities.join(', '));
        console.log('  Total unique cities:', allCities.length);

        console.log('\n🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

normalizeCities();
