const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');

// Public routes
router.post('/', testimonialController.createTestimonial);
router.get('/', testimonialController.getApprovedTestimonials);

// Admin routes
router.get('/all', testimonialController.getAllTestimonials);
router.patch('/:id/status', testimonialController.updateTestimonialStatus);
router.delete('/:id', testimonialController.deleteTestimonial);

module.exports = router;
