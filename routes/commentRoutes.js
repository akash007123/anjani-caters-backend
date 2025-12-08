const express = require("express");
const {
  createComment,
  getCommentsByBlog,
  getCommentsByBlogSlug,
  getAllComments,
  updateCommentStatus,
  deleteComment
} = require("../controllers/commentController");

const router = express.Router();

// Public routes (for frontend)
router.post("/", createComment);
router.get("/blog/:blogId", getCommentsByBlog);
router.get("/blog/slug/:slug", getCommentsByBlogSlug);

// Admin routes (for backend management)
router.get("/", getAllComments);
router.patch("/:id/status", updateCommentStatus);
router.delete("/:id", deleteComment);

module.exports = router;