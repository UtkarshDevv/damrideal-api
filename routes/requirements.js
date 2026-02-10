const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');

// GET all requirements (with user populated)
router.get('/', async (req, res) => {
    try {
        const requirements = await Requirement.find()
            .populate('userId', 'name email phone city userType')
            .sort({ createdAt: -1 });
        res.json(requirements);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET single requirement by ID
router.get('/:id', async (req, res) => {
    try {
        const requirement = await Requirement.findById(req.params.id)
            .populate('userId', 'name email phone city userType');

        if (!requirement) {
            return res.status(404).json({ msg: 'Requirement not found' });
        }
        res.json(requirement);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Requirement not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST create a new requirement
router.post('/', async (req, res) => {
    try {
        const { userId, category, budgetMin, budgetMax, location, size, customRequirement, type, status } = req.body;

        const newRequirement = new Requirement({
            userId: userId || undefined,
            category,
            budgetMin,
            budgetMax,
            location,
            size,
            customRequirement,
            type,
            status: status || 'Open'
        });

        const requirement = await newRequirement.save();

        // Populate user data before sending response
        const populated = await Requirement.findById(requirement._id)
            .populate('userId', 'name email phone city userType');

        res.json(populated);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// PUT update a requirement
router.put('/:id', async (req, res) => {
    try {
        const { category, budgetMin, budgetMax, location, size, customRequirement, type, status } = req.body;

        const updateFields = {};
        if (category !== undefined) updateFields.category = category;
        if (budgetMin !== undefined) updateFields.budgetMin = budgetMin;
        if (budgetMax !== undefined) updateFields.budgetMax = budgetMax;
        if (location !== undefined) updateFields.location = location;
        if (size !== undefined) updateFields.size = size;
        if (customRequirement !== undefined) updateFields.customRequirement = customRequirement;
        if (type !== undefined) updateFields.type = type;
        if (status !== undefined) updateFields.status = status;

        const requirement = await Requirement.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        ).populate('userId', 'name email phone city userType');

        if (!requirement) {
            return res.status(404).json({ msg: 'Requirement not found' });
        }

        res.json(requirement);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Requirement not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// DELETE a requirement
router.delete('/:id', async (req, res) => {
    try {
        const requirement = await Requirement.findByIdAndDelete(req.params.id);

        if (!requirement) {
            return res.status(404).json({ msg: 'Requirement not found' });
        }

        res.json({ msg: 'Requirement deleted' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Requirement not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
