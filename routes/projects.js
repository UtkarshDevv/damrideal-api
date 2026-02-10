const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create a new project
// POST create a new project (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const {
            title, location, priceRange, about, description,
            projectSize, launchDate, type, forSale, forRent,
            topAmenities, tags, status, imageName, imageUrl
        } = req.body;

        const newProject = new Project({
            title,
            location,
            priceRange,
            about,
            description,
            projectSize,
            launchDate,
            type: type || 'Lead',
            forSale: forSale || false,
            forRent: forRent || false, // Use specific field names instead of spreading entire object for safety
            topAmenities: topAmenities || [],
            tags: tags || [],
            status: status || 'Active',
            imageName,
            imageUrl,
            createdBy: req.user.id
        });

        const project = await newProject.save();
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update a project
// PUT update a project (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const {
            title, location, priceRange, about, description,
            projectSize, launchDate, type, forSale, forRent,
            topAmenities, tags, status, imageName, imageUrl,
            gallery, galleryUrls, brochureUrl
        } = req.body;

        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (location !== undefined) updateFields.location = location;
        if (priceRange !== undefined) updateFields.priceRange = priceRange;
        if (about !== undefined) updateFields.about = about;
        if (description !== undefined) updateFields.description = description;
        if (projectSize !== undefined) updateFields.projectSize = projectSize;
        if (launchDate !== undefined) updateFields.launchDate = launchDate;
        if (type !== undefined) updateFields.type = type;
        if (forSale !== undefined) updateFields.forSale = forSale;
        if (forRent !== undefined) updateFields.forRent = forRent;
        if (topAmenities !== undefined) updateFields.topAmenities = topAmenities;
        if (tags !== undefined) updateFields.tags = tags;
        if (status !== undefined) updateFields.status = status;
        if (imageName !== undefined) updateFields.imageName = imageName;
        if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;

        if (gallery !== undefined) updateFields.gallery = gallery;
        if (galleryUrls !== undefined) updateFields.galleryUrls = galleryUrls;
        if (brochureUrl !== undefined) updateFields.brochureUrl = brochureUrl;

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        res.json(project);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE a project
// DELETE a project (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        res.json({ msg: 'Project deleted' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Project not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
