const Blog = require("../models/Blog");

// Health check for blog API
exports.healthCheck = (req, res) => {
  res.status(200).json({ status: "online" });
};

// Public API - Get published blogs (for frontend)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tag = '', featured = false } = req.query;

    // Build query
    let query = { status: 'Published' };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Add featured filter
    if (featured === 'true') {
      query.featured = true;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude internal fields

    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Published blogs fetched successfully",
      data: {
        blogs,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public API - Get blog by slug (for frontend)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({ slug, status: 'Published' });
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog
    });
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public API - Get featured blogs (for frontend)
exports.getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const featuredBlogs = await Blog.find({ 
      featured: true, 
      status: 'Published' 
    })
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Featured blogs fetched successfully",
      data: featuredBlogs
    });
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public API - Get all unique tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Blog.distinct('tags', { status: 'Published' });
    const sortedTags = tags.filter(tag => tag).sort();
    
    res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      data: sortedTags
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get all blogs (including drafts)
exports.getAllBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '', 
      featured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { 'author.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Add featured filter
    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = false;
    }

    // Execute query with pagination and sorting
    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const blogs = await Blog.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "All blogs fetched successfully",
      data: {
        blogs,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      data: blog
    });
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Create new blog
exports.createBlog = async (req, res) => {
  try {
    console.log('Creating blog with data:', req.body);
    
    const {
      title,
      content,
      excerpt,
      coverImage,
      tags,
      featured,
      sections,
      seoTitle,
      seoDescription,
      seoKeywords,
      authorName,
      authorEmail,
      category,
      status
    } = req.body;

    // Validation
    if (!title || !content || !excerpt || !coverImage || !authorName || !authorEmail) {
      return res.status(400).json({ 
        error: "Title, Content, Excerpt, Cover Image, Author Name, and Author Email are required." 
      });
    }

    // Validate sections if provided
     let validatedSections = [];
     if (sections && Array.isArray(sections)) {
       validatedSections = sections
         .filter(section => section.sectionContent && section.sectionContent.trim() !== '')
         .map((section, index) => ({
           sectionTitle: section.sectionTitle || `Section ${index + 1}`,
           sectionContent: section.sectionContent.trim(),
           sectionImage: section.sectionImage || '',
           order: index
         }));
     }

    const blogData = {
       title,
       content,
       excerpt,
       coverImage,
       tags: tags || [],
       featured: featured || false,
       sections: validatedSections,
       seoTitle: seoTitle || title,
       seoDescription: seoDescription || excerpt,
       seoKeywords: seoKeywords || [],
       author: {
         name: authorName,
         email: authorEmail
       },
       category: category || '',
       status: status || 'Draft'
     };

     // Generate slug from title
     blogData.slug = title
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, '-')
       .replace(/(^-|-$)/g, '');

     const blog = new Blog(blogData);
    
    // Calculate reading time
    blog.calculateReadingTime();
    
    const savedBlog = await blog.save();

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: savedBlog
    });

  } catch (error) {
    console.error("Error creating blog:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Blog with this slug already exists" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated via this endpoint
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.__v;
    delete updateData.viewCount;
    delete updateData.publishedAt;

    // Validate sections if provided
    if (updateData.sections && Array.isArray(updateData.sections)) {
      updateData.sections = updateData.sections.map((section, index) => ({
        ...section,
        order: section.order || index
      }));
    }

    // If title is being updated and slug wasn't explicitly provided, regenerate slug
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const blog = await Blog.findById(id);
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // If content or sections were updated, recalculate reading time
    if (updateData.content || updateData.sections) {
      const wordsPerMinute = 200;
      const textLength = (updateData.content + (updateData.sections?.map(s => s.sectionContent).join(' ') || '')).split(' ').length;
      updateData.readingTime = Math.ceil(textLength / wordsPerMinute);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog
    });

  } catch (error) {
    console.error("Error updating blog:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Blog with this slug already exists" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Update blog status
exports.updateBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['Draft', 'Published'].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be Draft or Published" });
    }
    
    // Check if blog exists
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update the status
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Blog ${status === 'Published' ? 'published' : 'moved to draft'} successfully`,
      data: updatedBlog
    });
  } catch (error) {
    console.error("Error updating blog status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    // Check if blog exists
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update featured status
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { featured },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Blog ${featured ? 'featured' : 'unfeatured'} successfully`,
      data: updatedBlog
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedBlog = await Blog.findByIdAndDelete(id);
    
    if (!deletedBlog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get blog statistics
exports.getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: 'Published' });
    const draftBlogs = await Blog.countDocuments({ status: 'Draft' });
    const featuredBlogs = await Blog.countDocuments({ featured: true, status: 'Published' });
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: '$viewCount' } } }
    ]);

    // Get posts by month (last 12 months)
    const postsByMonth = await Blog.aggregate([
      {
        $match: {
          status: 'Published',
          publishedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $month: '$publishedAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get popular tags
    const popularTags = await Blog.aggregate([
      { $match: { status: 'Published' } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const result = {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      featuredBlogs,
      totalViews: totalViews[0]?.total || 0,
      postsByMonth,
      popularTags
    };

    res.status(200).json({
      success: true,
      message: "Blog stats fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Reorder sections
exports.reorderSections = async (req, res) => {
  try {
    const { id } = req.params;
    const { sections } = req.body;
    
    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ error: "Sections array is required" });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Update sections with new order
    blog.sections = sections.map((section, index) => ({
      ...section,
      order: index
    }));

    await blog.save();

    res.status(200).json({
      success: true,
      message: "Sections reordered successfully",
      data: blog.sections
    });
  } catch (error) {
    console.error("Error reordering sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};