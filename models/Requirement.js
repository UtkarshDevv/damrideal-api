const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    budgetMin: {
        type: Number
    },
    budgetMax: {
        type: Number
    },
    location: {
        type: String
    },
    size: {
        type: String
    },
    customRequirement: {
        type: String
    },
    type: {
        type: String,
        enum: ['Service Provider', 'Channel', 'Investor']
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Closed'],
        default: 'Open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Requirement', RequirementSchema);
