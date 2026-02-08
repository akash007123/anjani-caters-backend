const Testimonial = require('../models/Testimonial');

// Create a new testimonial
exports.createTestimonial = async (req, res) => {
  try {
    const { name, email, mobile, designation, location, profilePic, rating, feedback, eventType } = req.body;

    const testimonial = new Testimonial({
      name,
      email,
      mobile,
      designation,
      location,
      profilePic,
      rating,
      feedback,
      eventType
    });

    const savedTestimonial = await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your testimonial has been submitted successfully.',
      data: savedTestimonial
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit testimonial. Please try again.',
      error: error.message
    });
  }
};

// Get all approved testimonials
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials.',
      error: error.message
    });
  }
};

// Get all testimonials (for admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials.',
      error: error.message
    });
  }
};

// Approve/reject testimonial (for admin)
exports.updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: isApproved ? 'Testimonial approved successfully.' : 'Testimonial rejected.',
      data: testimonial
    });
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial status.',
      error: error.message
    });
  }
};

// Delete testimonial (for admin)
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Testimonial deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial.',
      error: error.message
    });
  }
};
