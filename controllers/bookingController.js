const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const {
      eventType,
      guestCount,
      eventDate,
      timeSlot,
      budget,
      name,
      phone,
      email,
      preferredContact,
      specialRequirements
    } = req.body;

    const booking = await Booking.create({
      eventType,
      guestCount,
      eventDate,
      timeSlot,
      budget,
      name,
      phone,
      email,
      preferredContact,
      specialRequirements
    });

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public
const getAllBookings = async (req, res) => {
  try {
    const { status, eventType, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (eventType) query.eventType = eventType;

    const bookings = await Booking.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
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
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Mark as read if it's new
    if (booking.status === 'new') {
      booking.status = 'read';
      await booking.save();
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Public
const updateBooking = async (req, res) => {
  try {
    const {
      eventType,
      guestCount,
      eventDate,
      timeSlot,
      budget,
      name,
      phone,
      email,
      preferredContact,
      specialRequirements,
      status,
      notes,
      followUpDate
    } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update fields
    booking.eventType = eventType || booking.eventType;
    booking.guestCount = guestCount || booking.guestCount;
    booking.eventDate = eventDate || booking.eventDate;
    booking.timeSlot = timeSlot || booking.timeSlot;
    booking.budget = budget !== undefined ? budget : booking.budget;
    booking.name = name || booking.name;
    booking.phone = phone || booking.phone;
    booking.email = email || booking.email;
    booking.preferredContact = preferredContact || booking.preferredContact;
    booking.specialRequirements = specialRequirements !== undefined ? specialRequirements : booking.specialRequirements;
    booking.status = status || booking.status;
    booking.notes = notes !== undefined ? notes : booking.notes;
    booking.followUpDate = followUpDate || booking.followUpDate;

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Public
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Public
const getBookingStats = async (req, res) => {
  try {
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventTypeStats = await Booking.aggregate([
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Booking.countDocuments();
    const upcomingBookings = await Booking.countDocuments({
      eventDate: { $gte: new Date() },
      status: { $in: ['new', 'confirmed', 'in-progress'] }
    });

    const statusCounts = {
      new: 0,
      confirmed: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      'no-show': 0
    };

    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        upcoming: upcomingBookings,
        byStatus: statusCounts,
        byEventType: eventTypeStats
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

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
// @access  Public
const getUpcomingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      eventDate: { $gte: new Date() },
      status: { $in: ['new', 'confirmed', 'in-progress'] }
    }).sort('eventDate');

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming bookings',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
  getUpcomingBookings
};
