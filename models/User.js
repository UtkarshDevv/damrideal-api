const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['Buyer', 'Seller', 'Builder', 'Agent', 'Other'] // Adjust common types
    },
    password: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
