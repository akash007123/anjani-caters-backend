const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    profilePic: {
      type: String, // URL to profile picture
      default: null
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    isApproved: {
      type: Boolean,
      default: true // For moderation, set to false if admin approval needed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better performance
CommentSchema.index({ blog: 1, createdAt: -1 });
CommentSchema.index({ isApproved: 1 });

// Virtual for formatted date
CommentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Static method to find approved comments by blog
CommentSchema.statics.findApprovedByBlog = function(blogId) {
  return this.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Comment", CommentSchema);