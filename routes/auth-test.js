const express = require('express');
const router = express.Router();

// Simple test route
router.post('/send-otp', (req, res) => {
    console.log('TEST ROUTE HIT');
    res.json({ success: true, msg: 'Test route working!' });
});

router.get('/test', (req, res) => {
    res.json({ success: true, msg: 'GET test working!' });
});

module.exports = router;
