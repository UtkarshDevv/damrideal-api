const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST send service request
router.post('/', async (req, res) => {
    const { userName, phone, requirement, serviceName } = req.body;

    if (!userName || !phone || !requirement || !serviceName) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'daamrideals@gmail.com',
        subject: `New Service Request: ${serviceName}`,
        html: `
            <h3>New Service Request Received</h3>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>User Name:</strong> ${userName}</p>
            <p><strong>Phone Number:</strong> ${phone}</p>
            <p><strong>Requirement Details:</strong></p>
            <p>${requirement}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ msg: 'Request sent successfully' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ msg: 'Failed to send email' });
    }
});

module.exports = router;
