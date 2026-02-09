const mongoose = require('mongoose');

const blogSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  content: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  }
});

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  designation: {
    type: String,
    required: false
  },
  profilePic: {
    type: String,
    required: false
  },
  aboutAuthor: {
    type: String,
    required: false
  }
});

const blogSchema = new mongoose.Schema({
  // Main Blog Fields
  mainImage: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: false
  },
  content: {
    type: String,
    required: true
  },
  readTime: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    required: false
  }],
  category: {
    type: String,
    required: false,
    default: 'General'
  },
  
  // Multiple Sections
  sections: [blogSectionSchema],
  
  // Author Information
  author: authorSchema,
  
  // SEO Fields
  metaTitle: {
    type: String,
    required: false
  },
  metaDescription: {
    type: String,
    required: false
  },
  seoKeywords: [{
    type: String,
    required: false
  }],
  
  // Publishing Status
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    required: false
  },
  
  // Timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: false
  }
}, {
  timestamps: true
});

// Auto-generate slug from title if not provided
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for search optimization
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
