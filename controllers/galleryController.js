const Gallery = require("../models/Gallery");

// Public API - Get all gallery images
exports.getGalleryImages = async (req, res) => {
  try {
    const { category = '', featured = false, limit = 50 } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const images = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Gallery images fetched successfully",
      data: images
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public API - Get featured gallery images
exports.getFeaturedImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const featuredImages = await Gallery.find({ featured: true })
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Featured gallery images fetched successfully",
      data: featuredImages
    });
  } catch (error) {
    console.error("Error fetching featured images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Public API - Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Gallery.distinct('category');
    const sortedCategories = categories.sort();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: sortedCategories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get all gallery images
exports.getAllImages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = '',
      featured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    } else if (featured === 'false') {
      query.featured = false;
    }

    const skip = (page - 1) * limit;
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const images = await Gallery.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Gallery.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "All gallery images fetched successfully",
      data: {
        images,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get image by ID
exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json({
      success: true,
      message: "Image fetched successfully",
      data: image
    });
  } catch (error) {
    console.error("Error fetching image by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Create new image
exports.createImage = async (req, res) => {
  try {
    const { image, alt, category, featured, size, order } = req.body;

    if (!image || !alt || !category) {
      return res.status(400).json({
        error: "Image URL, alt text, and category are required."
      });
    }

    const imageData = {
      image,
      alt,
      category,
      featured: featured || false,
      size: size || 'normal',
      order: order || 0
    };

    const newImage = new Gallery(imageData);
    const savedImage = await newImage.save();

    res.status(201).json({
      success: true,
      message: "Image added to gallery successfully",
      data: savedImage
    });

  } catch (error) {
    console.error("Error creating image:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Update image
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.__v;

    const image = await Gallery.findById(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage
    });

  } catch (error) {
    console.error("Error updating image:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Toggle featured status
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const image = await Gallery.findById(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { featured },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Image ${featured ? 'featured' : 'unfeatured'} successfully`,
      data: updatedImage
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedImage = await Gallery.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin API - Get gallery statistics
exports.getGalleryStats = async (req, res) => {
  try {
    const totalImages = await Gallery.countDocuments();
    const featuredImages = await Gallery.countDocuments({ featured: true });
    const categories = await Gallery.distinct('category');
    const imagesByCategory = await Gallery.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const result = {
      totalImages,
      featuredImages,
      totalCategories: categories.length,
      imagesByCategory
    };

    res.status(200).json({
      success: true,
      message: "Gallery stats fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching gallery stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};