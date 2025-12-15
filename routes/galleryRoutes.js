const express = require("express");
const {
  getGalleryImages,
  getFeaturedImages,
  getCategories,
  getAllImages,
  getImageById,
  createImage,
  updateImage,
  toggleFeatured,
  deleteImage,
  getGalleryStats
} = require("../controllers/galleryController");
const { uploadSingle, getFileUrl } = require("../middleware/upload");

const router = express.Router();

// Public routes (for frontend)
router.get("/images", getGalleryImages);
router.get("/featured", getFeaturedImages);
router.get("/categories", getCategories);

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
router.get("/", getAllImages);
router.get("/stats", getGalleryStats);
router.get("/:id", getImageById);
router.post("/", createImage);
router.put("/:id", updateImage);
router.patch("/:id/featured", toggleFeatured);
router.delete("/:id", deleteImage);

module.exports = router;