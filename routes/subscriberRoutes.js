const express = require('express');
const router = express.Router();
const subscriberController = require('../controllers/subscriberController');

// Public routes
router.post('/subscribe', subscriberController.subscribe);
router.post('/unsubscribe', subscriberController.unsubscribe);

// Admin routes (would need auth middleware in production)
router.get('/subscribers', subscriberController.getSubscribers);

module.exports = router;
