const mongoose = require("mongoose");

// Gallery Schema
const GallerySchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // URL to uploaded image
    alt: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    size: { type: String, enum: ['normal', 'wide', 'tall', 'large'], default: 'normal' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
GallerySchema.index({ category: 1 });
GallerySchema.index({ featured: 1 });
GallerySchema.index({ order: 1 });

// Static method to find by category
GallerySchema.statics.findByCategory = function(category) {
  return this.find({ category }).sort({ order: 1, createdAt: -1 });
};

// Static method to find featured
GallerySchema.statics.findFeatured = function() {
  return this.find({ featured: true }).sort({ order: 1, createdAt: -1 });
};

// Static method to get all categories
GallerySchema.statics.getCategories = function() {
  return this.distinct('category');
};

module.exports = mongoose.model("Gallery", GallerySchema);