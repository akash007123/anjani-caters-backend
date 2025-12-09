const express = require("express");
const {
  submitTestimonial,
  getApprovedTestimonials,
  getAllTestimonials,
  approveTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getTestimonialStats
} = require("../controllers/testimonialController");
const { uploadSingle } = require("../middleware/upload");

const router = express.Router();

// Public routes (for frontend)
router.get("/approved", getApprovedTestimonials);
router.post("/submit", uploadSingle('image'), submitTestimonial);

// Admin routes (for backend management)
router.get("/", getAllTestimonials);
router.get("/stats", getTestimonialStats);
router.patch("/:id/approve", approveTestimonial);
router.put("/:id", uploadSingle('image'), updateTestimonial);
router.delete("/:id", deleteTestimonial);

module.exports = router;