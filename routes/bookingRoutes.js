const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
  getUpcomingBookings
} = require('../controllers/bookingController');

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
router.get('/stats', getBookingStats);

// @desc    Get upcoming bookings
// @route   GET /api/bookings/upcoming
router.get('/upcoming', getUpcomingBookings);

// CRUD routes
router.route('/')
  .get(getAllBookings)
  .post(createBooking);

router.route('/:id')
  .get(getBookingById)
  .put(updateBooking)
  .delete(deleteBooking);

module.exports = router;
