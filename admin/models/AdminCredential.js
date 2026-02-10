const mongoose = require('mongoose');

const AdminCredentialSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: 'Admin'
    },
    role: {
        type: String,
        default: 'super-admin',
        enum: ['super-admin', 'admin', 'moderator']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Collection name will be "Admin-credential" in MongoDB
module.exports = mongoose.model('AdminCredential', AdminCredentialSchema, 'Admin-credential');
