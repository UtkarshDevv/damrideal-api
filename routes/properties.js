const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// GET all properties (For Search Page)
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.json(property);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create a new property (Protected)
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }

        const {
            name, location, price, size, status,
            configuration, videoLink, featuredTag,
            forSale, forRent, imageUrl, galleryUrls
        } = req.body;

        const newProperty = new Property({
            name,
            location: {
                place: (location && location.place) || '',
                city: (location && location.city) || ''
            },
            price,
            size,
            status,
            configuration, // Expecting CSV string
            videoLink,
            featuredTag,
            forSale,
            forRent,
            imageUrl,
            galleryUrls: galleryUrls || [],
            createdBy: req.user.id
        });

        const property = await newProperty.save();
        res.json(property);
    } catch (err) {
        console.error('Error creating property:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// PUT update a property (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            name, location, price, size, status,
            configuration, videoLink, featuredTag,
            forSale, forRent, imageUrl, galleryUrls
        } = req.body;

        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (location !== undefined) updateFields.location = location;
        if (price !== undefined) updateFields.price = price;
        if (size !== undefined) updateFields.size = size;
        if (status !== undefined) updateFields.status = status;
        if (configuration !== undefined) updateFields.configuration = configuration;
        if (videoLink !== undefined) updateFields.videoLink = videoLink;
        if (featuredTag !== undefined) updateFields.featuredTag = featuredTag;
        if (forSale !== undefined) updateFields.forSale = forSale;
        if (forRent !== undefined) updateFields.forRent = forRent;
        if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
        if (galleryUrls !== undefined) updateFields.galleryUrls = galleryUrls;

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        res.json(property);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE a property (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const property = await Property.findByIdAndDelete(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        res.json({ msg: 'Property deleted' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
