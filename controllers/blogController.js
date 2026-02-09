const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/blogs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @desc    Get all blogs (public - only published)
// @route   GET /api/blogs
// @access  Public
async function getPublishedBlogs(req, res) {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublished: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Get all blogs (admin - all including unpublished)
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
async function getAllBlogsAdmin(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-__v');
    
    const total = await Blog.countDocuments();
    
    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Get single blog by slug (public)
// @route   GET /api/blogs/:slug
// @access  Public
async function getBlogBySlug(req, res) {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Private/Admin
async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
async function createBlog(req, res) {
  try {
    // Get files from req.files
    const files = req.files || {};
    const mainImageFile = files['mainImage']?.[0];
    const authorPicFile = files['authorProfilePic']?.[0];
    
    const {
      title,
      slug,
      excerpt,
      content,
      readTime,
      tags,
      category,
      sections,
      author,
      metaTitle,
      metaDescription,
      seoKeywords,
      isPublished
    } = req.body;
    
    // Generate slug if not provided
    let blogSlug = slug;
    if (!blogSlug && title) {
      blogSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }
    
    // Check if slug exists
    const existingBlog = await Blog.findOne({ slug: blogSlug });
    if (existingBlog) {
      blogSlug = blogSlug + '-' + Date.now();
    }
    
    // Build author object
    let authorData = {};
    if (author) {
      authorData = typeof author === 'string' ? JSON.parse(author) : author;
      // Add profile pic if file was uploaded
      if (authorPicFile) {
        authorData.profilePic = `/api/${authorPicFile.path}`;
      }
    }
    
    const blogData = {
      title,
      slug: blogSlug,
      excerpt,
      content,
      readTime,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      category: category || 'General',
      sections: sections ? (typeof sections === 'string' ? JSON.parse(sections) : sections) : [],
      author: authorData,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      seoKeywords: seoKeywords ? (Array.isArray(seoKeywords) ? seoKeywords : seoKeywords.split(',').map(k => k.trim())) : [],
      isPublished: isPublished === 'true' || isPublished === true
    };
    
    // Add mainImage if file was uploaded or if text value provided
    if (mainImageFile) {
      blogData.mainImage = `/api/${mainImageFile.path}`;
    }
    
    if (blogData.isPublished) {
      blogData.publishedAt = new Date();
    }
    
    const blog = await Blog.create(blogData);
    
    res.status(201).json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
async function updateBlog(req, res) {
  try {
    // Get files from req.files
    const files = req.files || {};
    const mainImageFile = files['mainImage']?.[0];
    const authorPicFile = files['authorProfilePic']?.[0];
    
    const {
      title,
      slug,
      excerpt,
      content,
      readTime,
      tags,
      category,
      sections,
      author,
      metaTitle,
      metaDescription,
      seoKeywords,
      isPublished
    } = req.body;
    
    let blogSlug = slug;
    
    // If title is changing, regenerate slug
    if (title && typeof title === 'string') {
      if (!blogSlug) {
        blogSlug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      
      // Check if new slug exists (excluding current blog)
      const existingBlog = await Blog.findOne({ slug: blogSlug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        blogSlug = blogSlug + '-' + Date.now();
      }
    }
    
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined || (title !== undefined && blogSlug)) updateData.slug = blogSlug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (category !== undefined) updateData.category = category;
    if (sections !== undefined) updateData.sections = typeof sections === 'string' ? JSON.parse(sections) : sections;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = Array.isArray(seoKeywords) ? seoKeywords : seoKeywords.split(',').map(k => k.trim());
    
    // Handle mainImage - prioritize file upload
    if (mainImageFile) {
      updateData.mainImage = `/api/${mainImageFile.path}`;
    }
    
    // Handle author with profile pic
    if (author !== undefined) {
      const authorData = typeof author === 'string' ? JSON.parse(author) : author;
      if (authorPicFile) {
        authorData.profilePic = `/api/${authorPicFile.path}`;
      }
      updateData.author = authorData;
    }
    
    // Handle publish/unpublish toggle
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === 'true' || isPublished === true;
      if (updateData.isPublished && !req.body.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
async function deleteBlog(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    await blog.deleteOne();
    
    res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Toggle publish status
// @route   PATCH /api/blogs/:id/toggle-publish
// @access  Private/Admin
async function togglePublish(req, res) {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    blog.isPublished = !blog.isPublished;
    
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    
    await blog.save();
    
    res.status(200).json({
      success: true,
      data: blog,
      message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Get blog categories
// @route   GET /api/blogs/categories
// @access  Public
async function getCategories(req, res) {
  try {
    const categories = await Blog.distinct('category', { isPublished: true });
    
    res.status(200).json({ success: true, data: ['All', ...categories.filter(c => c)] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Upload blog image
// @route   POST /api/blogs/upload
// @access  Private/Admin
async function uploadImage(req, res) {
  try {
    upload.single('image')(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const imageUrl = `${req.protocol}://${req.get('host')}/api/${req.file.path}`;
      
      res.status(200).json({
        success: true,
        url: imageUrl,
        filename: req.file.filename
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getPublishedBlogs,
  getAllBlogsAdmin,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  getCategories,
  uploadImage,
  upload
};
