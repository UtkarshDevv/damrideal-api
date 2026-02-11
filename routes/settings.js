const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Setting = require('../models/Setting');

// Middleware to verify admin token (Same as in adminDashboard)
const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // Check if it's admin token structure
        if (decoded.admin) {
            req.admin = decoded.admin;
            next();
        } else {
            // Fallback: If your User model has isAdmin, check that. 
            // But based on adminDashboard, it expects 'admin' in payload.
            // If we want to allow normal users to READ, this middleware is only for WRITE.
            return res.status(403).json({ msg: 'Not authorized as admin' });
        }
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// @route   GET /api/settings
// @desc    Get global whatsapp settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            // rigorous default creation if not exists
            setting = new Setting();
            await setting.save();
        }
        res.json(setting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/settings
// @desc    Update global whatsapp settings
// @access  Private (Admin only)
router.put('/', verifyAdmin, async (req, res) => {
    const { whatsappNumber, whatsappMessage, contactPhone, contactEmail, contactAddress } = req.body;

    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = new Setting({
                whatsappNumber,
                whatsappMessage,
                contactPhone,
                contactEmail,
                contactAddress
            });
        } else {
            setting.whatsappNumber = whatsappNumber || setting.whatsappNumber;
            setting.whatsappMessage = whatsappMessage || setting.whatsappMessage;
            setting.contactPhone = contactPhone || setting.contactPhone;
            setting.contactEmail = contactEmail || setting.contactEmail;
            setting.contactAddress = contactAddress || setting.contactAddress;
        }

        await setting.save();
        res.json(setting);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
