const Testimonial = require("../models/Testimonial");
const { getFileUrl, deleteFile } = require("../middleware/upload");
const path = require('path');

// Public API - Submit testimonial
exports.submitTestimonial = async (req, res) => {
  try {
    const { quote, name, position, company, rating, eventType } = req.body;

    // Validation
    if (!quote || !name || !position || !company || !rating || !eventType) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Rating must be between 1 and 5"
      });
    }

    let image = '/placeholder.svg';
    if (req.file) {
      image = getFileUrl(req, req.file.filename);
    }

    const testimonial = new Testimonial({
      quote,
      name,
      position,
      company,
      rating: parseInt(rating),
      eventType,
      image,
      isApproved: false
    });

    const savedTestimonial = await testimonial.save();

    res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully. It will be reviewed before publishing.",
      data: savedTestimonial
    });

  } catch (error) {
    console.error("Error submitting testimonial:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Public API - Get approved testimonials
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      message: "Approved testimonials fetched successfully",
      data: testimonials
    });
  } catch (error) {
    console.error("Error fetching approved testimonials:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Admin API - Get all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = ''
    } = req.query;

    // Build query
    let query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { eventType: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status === 'approved') {
      query.isApproved = true;
    } else if (status === 'pending') {
      query.isApproved = false;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const testimonials = await Testimonial.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Testimonial.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "All testimonials fetched successfully",
      data: {
        testimonials,
        total,
        page: parseInt(page),
        pages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Admin API - Approve testimonial
exports.approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found"
      });
    }

    testimonial.isApproved = isApproved;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Testimonial ${isApproved ? 'approved' : 'unapproved'} successfully`,
      data: testimonial
    });
  } catch (error) {
    console.error("Error approving testimonial:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Admin API - Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { quote, name, position, company, rating, eventType } = req.body;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found"
      });
    }

    // Update fields
    if (quote !== undefined) testimonial.quote = quote;
    if (name !== undefined) testimonial.name = name;
    if (position !== undefined) testimonial.position = position;
    if (company !== undefined) testimonial.company = company;
    if (rating !== undefined) testimonial.rating = parseInt(rating);
    if (eventType !== undefined) testimonial.eventType = eventType;

    // Handle image update
    if (req.file) {
      // Delete old image if it's not the placeholder
      if (testimonial.image && testimonial.image !== '/placeholder.svg') {
        const oldImagePath = path.join(__dirname, '../uploads', path.basename(testimonial.image));
        deleteFile(oldImagePath);
      }
      testimonial.image = getFileUrl(req, req.file.filename);
    }

    const updatedTestimonial = await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updatedTestimonial
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Admin API - Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        error: "Testimonial not found"
      });
    }

    // Delete associated image if it's not the placeholder
    if (testimonial.image && testimonial.image !== '/placeholder.svg') {
      const imagePath = path.join(__dirname, '../uploads', path.basename(testimonial.image));
      deleteFile(imagePath);
    }

    await Testimonial.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};

// Admin API - Get testimonial stats
exports.getTestimonialStats = async (req, res) => {
  try {
    const totalTestimonials = await Testimonial.countDocuments();
    const approvedTestimonials = await Testimonial.countDocuments({ isApproved: true });
    const pendingTestimonials = await Testimonial.countDocuments({ isApproved: false });

    const averageRating = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const eventTypes = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const result = {
      totalTestimonials,
      approvedTestimonials,
      pendingTestimonials,
      averageRating: averageRating[0]?.avgRating || 0,
      eventTypes
    };

    res.status(200).json({
      success: true,
      message: "Testimonial stats fetched successfully",
      data: result
    });
  } catch (error) {
    console.error("Error fetching testimonial stats:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};