const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: mongoose.Schema.Types.Mixed, // Allow String (legacy) or Object { place, city }
        required: true
    },
    priceRange: {
        type: String,
        required: true
    },
    about: {
        type: String
    },
    description: {
        type: String
    },
    options: {
        type: String // Was projectSize
    },
    totalUnits: {
        type: Number
    },
    launchDate: {
        type: String // dd-mm-yyyy
    },
    type: {
        type: String,
        enum: ['Ready to Move', 'Pre-Launch', 'Under Construction'],
        default: 'Ready to Move'
    },
    forSale: {
        type: Boolean,
        default: false
    },
    forRent: {
        type: Boolean,
        default: false
    },
    topAmenities: {
        type: String // CSV String
    },
    gallery: [{
        type: String // Original image filenames
    }],
    imageName: {
        type: String // Main image filename
    },
    imageUrl: {
        type: String // S3 URL for main image
    },
    galleryUrls: [{
        type: String // S3 URLs for gallery images
    }],
    brochureUrl: {
        type: String // S3 URL for PDF brochure
    },
    videoLink: {
        type: String // Video link
    },
    tags: {
        type: String // Text
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Coming Soon', 'Sold Out', 'Pending'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
