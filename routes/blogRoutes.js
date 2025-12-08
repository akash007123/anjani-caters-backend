const express = require("express");
const {
  healthCheck,
  getPublishedBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getAllTags,
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  updateBlogStatus,
  toggleFeatured,
  deleteBlog,
  getBlogStats,
  reorderSections
} = require("../controllers/blogController");
const { uploadSingle, getFileUrl } = require("../middleware/upload");

const router = express.Router();

// Public routes (for frontend)
router.get("/health", healthCheck);
router.get("/published", getPublishedBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/tags", getAllTags);
router.get("/slug/:slug", getBlogBySlug);

// Image upload route
router.post("/upload", uploadSingle('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const imageUrl = getFileUrl(req, req.file.filename);
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        filename: req.file.filename
      }
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin routes (for backend management)
router.get("/", getAllBlogs);
router.get("/stats", getBlogStats);
router.get("/:id", getBlogById);
router.post("/", createBlog);
router.put("/:id", updateBlog);
router.patch("/:id/status", updateBlogStatus);
router.patch("/:id/featured", toggleFeatured);
router.delete("/:id", deleteBlog);
router.patch("/:id/sections/reorder", reorderSections);

module.exports = router;