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
    pin: {
        type: String,
        // required: true // Pin is set after OTP verification, so might be initially null if we save early?
        // Actually, flow: details -> otp verify -> set pin.
        // We probably create the user record *after* or *during* this flow.
        // Let's make it optional initially or required if we expect full user creation at end.
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
