const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const { sendCommentConfirmation } = require("../utils/mailer");

// Create a new comment
exports.createComment = async (req, res) => {
  try {
    const { blogId, fullName, email, profilePic, comment } = req.body;

    // Validate required fields
    if (!blogId || !fullName || !email || !comment) {
      return res.status(400).json({
        error: "Blog ID, Full Name, Email, and Comment are required."
      });
    }

    // Check if blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, status: 'Published' });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    // Create comment
    const newComment = new Comment({
      blog: blogId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      profilePic: profilePic || null,
      comment: comment.trim(),
      isApproved: true // Auto-approve for now, can be changed for moderation
    });

    const savedComment = await newComment.save();

    // Populate blog info for response
    await savedComment.populate('blog', 'title slug');

    // Fetch related blogs for email recommendations
    let relatedBlogs = [];
    try {
      // Get the current blog to find related ones
      const currentBlog = await Blog.findById(savedComment.blog).select('category tags').lean();

      if (currentBlog) {
        // Find blogs with same category or shared tags
        const query = {
          status: 'Published',
          _id: { $ne: savedComment.blog }, // Exclude current blog
          $or: [
            { category: currentBlog.category }, // Same category
            { tags: { $in: currentBlog.tags } } // Shared tags
          ]
        };

        relatedBlogs = await Blog.find(query)
          .sort({ publishedAt: -1 })
          .limit(4)
          .select('title slug excerpt publishedAt')
          .lean();
      }

      // If no related blogs found, fall back to recent blogs
      if (relatedBlogs.length === 0) {
        relatedBlogs = await Blog.find({
          status: 'Published',
          _id: { $ne: savedComment.blog }
        })
        .sort({ publishedAt: -1 })
        .limit(4)
        .select('title slug excerpt publishedAt')
        .lean();
      }
    } catch (blogError) {
      console.error('Error fetching related blogs for email:', blogError);
      // Continue without blog recommendations if fetch fails
    }

    // Send confirmation email to the commenter
    try {
      await sendCommentConfirmation({
        fullName: newComment.fullName,
        email: newComment.email,
        comment: newComment.comment,
        relatedBlogs: relatedBlogs
      });
    } catch (emailError) {
      console.error('Error sending comment confirmation email:', emailError);
      // Don't fail the comment creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: savedComment
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all approved comments for a blog
exports.getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if blog exists and is published
    const blog = await Blog.findOne({ _id: blogId, status: 'Published' });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get comments with pagination
    const comments = await Comment.find({ blog: blogId, isApproved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Comment.countDocuments({ blog: blogId, isApproved: true });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: {
        comments,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get comments by blog slug (alternative to blogId)
exports.getCommentsByBlogSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find blog by slug
    const blog = await Blog.findOne({ slug, status: 'Published' });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get comments with pagination
    const comments = await Comment.find({ blog: blog._id, isApproved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Comment.countDocuments({ blog: blog._id, isApproved: true });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: {
        comments,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin: Get all comments (including unapproved)
exports.getAllComments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      blogId,
      isApproved,
      search = ''
    } = req.query;

    // Build query
    let query = {};

    if (blogId) {
      query.blog = blogId;
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const comments = await Comment.find(query)
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Comment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      data: {
        comments,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin: Approve/Reject comment
exports.updateCommentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ error: "isApproved must be a boolean" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).populate('blog', 'title slug');

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({
      success: true,
      message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: updatedComment
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin: Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};