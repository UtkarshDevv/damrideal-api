const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Nodemailer Transporter
// NOTE: For production, use environment variables for credentials.
// For development/demo, ensure allow "less secure apps" or use App Passwords if Gmail.
// TEMPORARILY DISABLED TO DEBUG 502
// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Send OTP (Start Registration)
router.post('/send-otp', async (req, res) => {
    console.log('=== SEND-OTP ROUTE CALLED ===');
    console.log('Request body:', req.body);

    const { name, email, phone, city, userType } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user && user.isVerified && user.password) {
            return res.status(400).json({ msg: 'User already exists and is verified. Please login.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        if (!user) {
            user = new User({
                name,
                email,
                phone,
                city,
                userType,
                otp,
                otpExpires
            });
        } else {
            // Update existing unverified user
            user.name = name;
            user.phone = phone;
            user.city = city;
            user.userType = userType;
            user.otp = otp;
            user.otpExpires = otpExpires;
        }

        await user.save();

        // Return OTP in response (email disabled for now)
        return res.json({
            msg: 'OTP generated successfully. Check console for OTP.',
            success: true,
            otp: otp // For testing - remove in production
        });

    } catch (err) {
        console.error('Server error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP expired' });
        }

        // OTP Valid.
        // We don't mark verified yet, typically we wait for PIN creation?
        // Or we mark a flag "otpVerified: true".
        // Let's verify here for simplicity.
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ msg: 'OTP Verified' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 3. Set PIN (Finalize Registration)
router.post('/set-pin', async (req, res) => {
    const { email, pin, password } = req.body;
    const attemptPassword = pin || password;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ msg: 'User email not verified' });
        }

        // Hash PIN/Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(attemptPassword, salt);
        await user.save();

        // Create Token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, msg: 'Account created successfully' });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 4. Login
router.post('/login', async (req, res) => {
    const { email, password, pin } = req.body;
    const attemptPassword = pin || password;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (!user.password) {
            return res.status(400).json({ msg: 'Password not set' });
        }

        const isMatch = await bcrypt.compare(attemptPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '30d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 5. Forgot Password (Send OTP)
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Damrideal Reset PIN OTP', // Changed to PIN
            text: `Your reset code is ${otp}. It expires in 10 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
            res.json({ msg: 'OTP sent to email', otp }); // Return OTP for dev purposes
        } catch (error) {
            console.error('Email send error:', error);
            // In dev mode, return OTP even if email fails
            res.json({ msg: 'Failed to send email but OTP generated', otp });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 6. Reset PIN
router.post('/reset-pin', async (req, res) => {
    const { email, pin } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Hash PIN
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(pin, salt); // Storing PIN as password
        await user.save();

        res.json({ msg: 'PIN reset successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 7. Get Current User Profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 8. Add to Favorites
router.post('/favorites/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Check if already favorited
        if (user.favorites.includes(req.params.id)) {
            // Usually just return success or existing list
            // return res.status(400).json({ msg: 'Project already in favorites' });
        } else {
            user.favorites.push(req.params.id);
            await user.save();
        }
        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 9. Remove from Favorites
router.delete('/favorites/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.favorites = user.favorites.filter(
            fav => fav.toString() !== req.params.id
        );

        await user.save();
        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 10. Get Favorites (Populated)
router.get('/favorites', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('favorites');
        res.json(user.favorites || []);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
