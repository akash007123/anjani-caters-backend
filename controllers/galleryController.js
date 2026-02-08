const Gallery = require('../models/Gallery');
const path = require('path');

// Get all gallery items
exports.getAllGalleryItems = async (req, res) => {
  try {
    const items = await Gallery.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get gallery categories
exports.getGalleryCategories = async (req, res) => {
  try {
    const categories = await Gallery.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single gallery item
exports.getGalleryItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create gallery item
exports.createGalleryItem = async (req, res) => {
  try {
    const { title, description, category, customCategory, type, order, isActive } = req.body;
    
    let src = '';
    let thumbnail = '';

    // Handle uploaded files
    if (req.files) {
      if (req.files['src'] && req.files['src'][0]) {
        src = `/api/uploads/gallery/${req.files['src'][0].filename}`;
      }
      if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
        thumbnail = `/api/uploads/gallery/${req.files['thumbnail'][0].filename}`;
      }
    } else if (req.body.src) {
      // Fallback to URL if no file uploaded
      src = req.body.src;
    }

    if (!src) {
      return res.status(400).json({ message: 'Image or video file is required' });
    }

    const galleryItem = new Gallery({
      title,
      description,
      category,
      customCategory,
      type,
      src,
      thumbnail,
      order: order || 0,
      isActive: isActive !== 'false',
    });

    const savedItem = await galleryItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update gallery item
exports.updateGalleryItem = async (req, res) => {
  try {
    const { title, description, category, customCategory, type, order, isActive } = req.body;
    
    let src;
    let thumbnail;

    // Handle uploaded files or keep existing
    if (req.files) {
      if (req.files['src'] && req.files['src'][0]) {
        src = `/api/uploads/gallery/${req.files['src'][0].filename}`;
      }
      if (req.files['thumbnail'] && req.files['thumbnail'][0]) {
        thumbnail = `/api/uploads/gallery/${req.files['thumbnail'][0].filename}`;
      }
    }

    const updateData = {
      title,
      description,
      category,
      customCategory,
      type,
      order: order || 0,
      isActive: isActive !== 'false',
    };

    // Only update src/thumbnail if new files were uploaded
    if (src) updateData.src = src;
    if (thumbnail) updateData.thumbnail = thumbnail;

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete gallery item
exports.deleteGalleryItem = async (req, res) => {
  try {
    const fs = require('fs');
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete associated files
    if (galleryItem.src && galleryItem.src.startsWith('/api/uploads/')) {
      const filePath = path.join(__dirname, '..', galleryItem.src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (galleryItem.thumbnail && galleryItem.thumbnail.startsWith('/api/uploads/')) {
      const filePath = path.join(__dirname, '..', galleryItem.thumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle gallery item status
exports.toggleGalleryItemStatus = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    galleryItem.isActive = !galleryItem.isActive;
    await galleryItem.save();
    
    res.json(galleryItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
