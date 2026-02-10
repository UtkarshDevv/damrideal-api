const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Project = require('../../models/Project');
const Requirement = require('../../models/Requirement');
const User = require('../../models/User');

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.admin = decoded.admin;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// GET /api/admin/dashboard/stats - Get dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        // Total counts
        const totalProjects = await Project.countDocuments();
        const totalRequirements = await Requirement.countDocuments();
        const totalUsers = await User.countDocuments();

        // Projects by status
        const activeProjects = await Project.countDocuments({ status: 'Active' });
        const comingSoonProjects = await Project.countDocuments({ status: 'Coming Soon' });
        const soldOutProjects = await Project.countDocuments({ status: 'Sold Out' });
        const inactiveProjects = await Project.countDocuments({ status: 'Inactive' });

        // Projects by listing type
        const forSaleCount = await Project.countDocuments({ forSale: true });
        const forRentCount = await Project.countDocuments({ forRent: true });

        // Requirements by status
        const openRequirements = await Requirement.countDocuments({ status: 'Open' });
        const inProgressRequirements = await Requirement.countDocuments({ status: 'In Progress' });
        const closedRequirements = await Requirement.countDocuments({ status: 'Closed' });

        // Recent projects (last 5)
        const recentProjects = await Project.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title location priceRange status type imageUrl createdAt');

        // Recent requirements (last 5)
        const recentRequirements = await Requirement.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email phone')
            .select('category location budgetMin budgetMax status createdAt customRequirement');

        // Recent users (last 5)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email phone city userType isVerified createdAt');

        res.json({
            stats: {
                totalProjects,
                totalRequirements,
                totalUsers,
                activeProjects,
                comingSoonProjects,
                soldOutProjects,
                inactiveProjects,
                forSaleCount,
                forRentCount,
                openRequirements,
                inProgressRequirements,
                closedRequirements
            },
            recentProjects,
            recentRequirements,
            recentUsers
        });

    } catch (err) {
        console.error('Dashboard stats error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
