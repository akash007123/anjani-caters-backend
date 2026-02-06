const express = require('express');
const router = express.Router();
const {
  createCustomBooking,
  getAllCustomBookings,
  getCustomBookingById,
  updateCustomBooking,
  deleteCustomBooking,
  getCustomBookingStats
} = require('../controllers/customBookingController');
const { protect } = require('../middleware/auth');

// @desc    Get custom booking statistics
// @route   GET /api/custom-bookings/stats
router.get('/stats', protect, getCustomBookingStats);

// CRUD routes
router.route('/')
  .get(protect, getAllCustomBookings)
  .post(protect, createCustomBooking);

router.route('/:id')
  .get(protect, getCustomBookingById)
  .put(protect, updateCustomBooking)
  .delete(protect, deleteCustomBooking);

module.exports = router;
