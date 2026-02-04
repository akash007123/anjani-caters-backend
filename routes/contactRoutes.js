const express = require('express');
const router = express.Router();
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');

// @desc    Get contact statistics
// @route   GET /api/contacts/stats
router.get('/stats', getContactStats);

// CRUD routes
router.route('/')
  .get(getAllContacts)
  .post(createContact);

router.route('/:id')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
