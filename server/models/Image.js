const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    original: {
        type: String,
        required: true
    },
    small: {
        type: String,
        required: true
    },
    medium: {
        type: String,
        required: true
    },
    large: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Image', imageSchema);
