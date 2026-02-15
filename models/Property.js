const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        place: { type: String, required: true },
        city: { type: String, required: true }
    },
    price: {
        type: String,
        required: true
    },
    size: {
        type: String // Text (e.g. 1200 sqft)
    },
    status: {
        type: String // Text
    },
    configuration: { // Dropdown 1BHK till 5BHK in csv and custom also
        type: String // E.g., "3BHK, 4BHK" - CSV string to simplify multiple selections or custom
    },
    videoLink: {
        type: String
    },
    featuredTag: {
        type: String // "featured tag[text]"
    },
    forSale: {
        type: Boolean,
        default: false
    },
    forRent: {
        type: Boolean,
        default: false
    },
    // Other media fields if needed, matching Project where applicable
    imageUrl: { type: String },
    imageName: { type: String },
    galleryUrls: [{ type: String }],
    brochureUrl: { type: String },
    type: {
        type: String,
        enum: ['Featured', 'Lead', 'EOI'],
        default: 'Lead'
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
