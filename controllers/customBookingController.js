const CustomBooking = require('../models/CustomBooking');

// @desc    Create a new custom booking
// @route   POST /api/custom-bookings
// @access  Private (admin)
const createCustomBooking = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientMobile,
      eventDate,
      venue,
      venueAddress,
      totalAmount,
      advanceAmount,
      menu,
      notes
    } = req.body;

    const customBooking = await CustomBooking.create({
      clientName,
      clientEmail,
      clientMobile,
      eventDate,
      venue,
      venueAddress,
      totalAmount,
      advanceAmount,
      menu: menu || [],
      notes
    });

    res.status(201).json({
      success: true,
      data: customBooking,
      message: 'Custom booking created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating custom booking',
      error: error.message
    });
  }
};

// @desc    Get all custom bookings
// @route   GET /api/custom-bookings
// @access  Private (admin)
const getAllCustomBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;

    const customBookings = await CustomBooking.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CustomBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: customBookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom bookings',
      error: error.message
    });
  }
};

// @desc    Get single custom booking by ID
// @route   GET /api/custom-bookings/:id
// @access  Private (admin)
const getCustomBookingById = async (req, res) => {
  try {
    const customBooking = await CustomBooking.findById(req.params.id);

    if (!customBooking) {
      return res.status(404).json({
        success: false,
        message: 'Custom booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: customBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching custom booking',
      error: error.message
    });
  }
};

// @desc    Update custom booking
// @route   PUT /api/custom-bookings/:id
// @access  Private (admin)
const updateCustomBooking = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientMobile,
      eventDate,
      venue,
      venueAddress,
      totalAmount,
      advanceAmount,
      menu,
      status,
      notes
    } = req.body;

    let customBooking = await CustomBooking.findById(req.params.id);

    if (!customBooking) {
      return res.status(404).json({
        success: false,
        message: 'Custom booking not found'
      });
    }

    // Update fields
    customBooking.clientName = clientName || customBooking.clientName;
    customBooking.clientEmail = clientEmail || customBooking.clientEmail;
    customBooking.clientMobile = clientMobile || customBooking.clientMobile;
    customBooking.eventDate = eventDate || customBooking.eventDate;
    customBooking.venue = venue || customBooking.venue;
    customBooking.venueAddress = venueAddress || customBooking.venueAddress;
    customBooking.totalAmount = totalAmount !== undefined ? totalAmount : customBooking.totalAmount;
    customBooking.advanceAmount = advanceAmount !== undefined ? advanceAmount : customBooking.advanceAmount;
    customBooking.menu = menu || customBooking.menu;
    customBooking.status = status || customBooking.status;
    customBooking.notes = notes !== undefined ? notes : customBooking.notes;

    await customBooking.save();

    res.status(200).json({
      success: true,
      data: customBooking,
      message: 'Custom booking updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating custom booking',
      error: error.message
    });
  }
};

// @desc    Delete custom booking
// @route   DELETE /api/custom-bookings/:id
// @access  Private (admin)
const deleteCustomBooking = async (req, res) => {
  try {
    const customBooking = await CustomBooking.findById(req.params.id);

    if (!customBooking) {
      return res.status(404).json({
        success: false,
        message: 'Custom booking not found'
      });
    }

    await CustomBooking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Custom booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting custom booking',
      error: error.message
    });
  }
};

// @desc    Get custom booking statistics
// @route   GET /api/custom-bookings/stats
// @access  Private (admin)
const getCustomBookingStats = async (req, res) => {
  try {
    const statusStats = await CustomBooking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAmountStats = await CustomBooking.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalAdvance: { $sum: '$advanceAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await CustomBooking.countDocuments();

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };

    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        byStatus: statusCounts,
        revenue: totalAmountStats[0] || { totalRevenue: 0, totalAdvance: 0, count: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

module.exports = {
  createCustomBooking,
  getAllCustomBookings,
  getCustomBookingById,
  updateCustomBooking,
  deleteCustomBooking,
  getCustomBookingStats
};
