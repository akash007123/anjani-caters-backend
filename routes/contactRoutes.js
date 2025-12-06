const express = require("express");
const {
  submitContact,
  healthCheck,
  getAllContacts,
  getContactById,
  updateContact,
  updateContactStatus,
  deleteContact,
  getContactStats
} = require("../controllers/contactController");

const router = express.Router();

// Public routes
router.get("/health", healthCheck);
router.post("/submit", submitContact);

// Admin routes
router.get("/contacts", getAllContacts);
router.get("/contacts/:id", getContactById);
router.patch("/contacts/:id", updateContact);
router.patch("/contacts/:id/status", updateContactStatus);
router.delete("/contacts/:id", deleteContact);
router.get("/contacts/stats/overview", getContactStats);

module.exports = router;
