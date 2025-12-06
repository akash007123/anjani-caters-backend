const express = require("express");
const { 
  submitQuote, 
  healthCheck, 
  getQuote, 
  getAllQuotes, 
  updateQuoteStatus, 
  getQuoteStats,
  updateQuote,
  deleteQuote
} = require("../controllers/quoteController");

const router = express.Router();

// Public routes (for customers)
router.get("/health", healthCheck);
router.post("/submit", submitQuote);

// Admin routes (would typically be protected with auth middleware)
router.get("/", getAllQuotes);
router.get("/stats", getQuoteStats);
router.get("/:id", getQuote);
router.patch("/:id/status", updateQuoteStatus);
router.put("/:id", updateQuote);
router.delete("/:id", deleteQuote);

module.exports = router;