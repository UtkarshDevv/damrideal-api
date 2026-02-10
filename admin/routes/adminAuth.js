const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminCredential = require('../models/AdminCredential');

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // Find admin by email
        const admin = await AdminCredential.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ msg: 'Account is deactivated. Contact support.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT token
        const payload = {
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        name: admin.name,
                        role: admin.role
                    }
                });
            }
        );

    } catch (err) {
        console.error('Admin login error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get current admin (protected route - for verifying token)
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const admin = await AdminCredential.findById(decoded.admin.id).select('-password');

        if (!admin) {
            return res.status(404).json({ msg: 'Admin not found' });
        }

        res.json(admin);
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

module.exports = router;
