const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, getActivityLogs } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('Admin', 'Manager'), getSettings);
router.put('/', protect, authorize('Admin'), updateSettings);
router.get('/logs', protect, authorize('Admin'), getActivityLogs);

module.exports = router;
