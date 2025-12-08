const mongoose = require("mongoose");

// Dynamic Section Schema
const DynamicSectionSchema = new mongoose.Schema({
  sectionTitle: { type: String, required: true },
  sectionContent: { type: String, required: true },
  sectionImage: { type: String }, // URL to uploaded image
  order: { type: Number, default: 0 }
}, { _id: true });

// Main Blog Schema
const BlogSchema = new mongoose.Schema(
  {
    // Main Blog Fields
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 500 },
    coverImage: { type: String, required: true }, // URL to uploaded cover image
    tags: [{ type: String, trim: true }], // Array of tags
    featured: { type: Boolean, default: false },
    
    // Status and Publishing
    status: { 
      type: String, 
      enum: ['Draft', 'Published'], 
      default: 'Draft' 
    },
    
    // Dynamic Sections
    sections: [DynamicSectionSchema],
    
    // SEO Fields
    seoTitle: { type: String, maxlength: 60 },
    seoDescription: { type: String, maxlength: 160 },
    seoKeywords: [{ type: String, trim: true }], // Multiple SEO keywords
    
    // URL Slug for SEO-friendly URLs
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    
    // Author Information
    author: {
      name: { type: String, required: true },
      email: { type: String, required: true }
    },
    
    // Reading and Engagement Metrics
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    
    // Publication Date
    publishedAt: { type: Date },
    
    // Additional Metadata
    readingTime: { type: Number }, // Estimated reading time in minutes
    category: { type: String, trim: true },
    
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted date
BlogSchema.virtual('formattedDate').get(function() {
  return this.publishedAt ? this.publishedAt.toLocaleDateString() : this.createdAt.toLocaleDateString();
});

// Virtual for URL path
BlogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Indexes for better performance
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ slug: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ featured: 1, status: 1 });
BlogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Pre-save middleware
BlogSchema.pre('save', async function () {
  // Generate slug from title if title is modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set publishedAt when status changes to Published
  if (this.isModified('status') && this.status === 'Published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});


// Method to calculate reading time
BlogSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200; // Average reading speed
  const textLength = (this.content + this.sections.map(s => s.sectionContent).join(' ')).split(' ').length;
  this.readingTime = Math.ceil(textLength / wordsPerMinute);
  return this.readingTime;
};

// Static method to find published blogs
BlogSchema.statics.findPublished = function() {
  return this.find({ status: 'Published' }).sort({ publishedAt: -1 });
};

// Static method to find featured blogs
BlogSchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'Published' }).sort({ publishedAt: -1 });
};

module.exports = mongoose.model("Blog", BlogSchema);