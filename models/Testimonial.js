const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    quote: {
        type: String,
        required: [true, 'Quote is required'],
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    position: {
        type: String,
        required: [true, 'Position is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company is required'],
        trim: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    image: {
        type: String,
        default: '/placeholder.svg'
    },
    eventType: {
        type: String,
        required: [true, 'Event type is required'],
        trim: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);