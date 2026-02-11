const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        required: true,
        default: '+919876543210' // Default dummy number
    },
    whatsappMessage: {
        type: String,
        required: true,
        default: 'Hello, I am interested in your property.'
    },
    contactPhone: {
        type: String,
        default: '+919876543210'
    },
    contactEmail: {
        type: String,
        default: 'info@damrideal.com'
    },
    contactAddress: {
        type: String,
        default: '123, Real Estate Street, Mumbai, India'
    }
}, { timestamps: true });

module.exports = mongoose.model('Setting', SettingSchema);
