const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['wedding', 'catering', 'decoration', 'corporate', 'religious', 'other'],
    default: 'other'
  },
  customCategory: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
    default: 'image'
  },
  src: {
    type: String,
    default: ''
  },
  thumbnail: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
gallerySchema.index({ category: 1, order: 1 });
gallerySchema.index({ isActive: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
