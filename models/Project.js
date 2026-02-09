const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
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
    projectSize: {
        type: String
    },
    launchDate: {
        type: String
    },
    type: {
        type: String,
        enum: ['Featured', 'Lead', 'EOI'],
        default: 'Lead'
    },
    forSale: {
        type: Boolean,
        default: false
    },
    forRent: {
        type: Boolean,
        default: false
    },
    topAmenities: [{
        type: String
    }],
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
    tags: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Coming Soon', 'Sold Out'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
