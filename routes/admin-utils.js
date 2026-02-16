const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

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

// POST endpoint to normalize all city names in database (Admin only)
router.post('/normalize-cities', auth, async (req, res) => {
    try {
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

        // Get unique cities after normalization
        const projectCities = await Project.distinct('location.city');
        const propertyCities = await Property.distinct('location.city');
        const allCities = [...new Set([...projectCities, ...propertyCities])].filter(Boolean).sort();

        res.json({
            success: true,
            message: 'City normalization completed',
            stats: {
                projects: {
                    total: projects.length,
                    updated: projectsUpdated
                },
                properties: {
                    total: properties.length,
                    updated: propertiesUpdated
                },
                uniqueCities: allCities
            }
        });
    } catch (err) {
        console.error('Error normalizing cities:', err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;
