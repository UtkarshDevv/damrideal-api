const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    let token = req.header('x-auth-token');

    // Check Authorization header if x-auth-token not found
    if (!token && req.header('Authorization')) {
        const parts = req.header('Authorization').split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        // NOTE: In production, secret should be from env
        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user || decoded.admin; // Allow both user and admin tokens
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        // console.log('Secret used:', secret); // Debugging
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
