const express = require('express');
const router = express.Router();
const { 
  getPublishedBlogs, 
  getAllBlogsAdmin, 
  getBlogBySlug, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  togglePublish, 
  getCategories, 
  uploadImage,
  upload
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getPublishedBlogs);
router.get('/categories', getCategories);
router.get('/:slug', getBlogBySlug);

// Admin routes (protected)
router.get('/admin/all', protect, getAllBlogsAdmin);
router.get('/admin/id/:id', protect, getBlogById);
router.post('/', protect, upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'authorProfilePic', maxCount: 1 }
]), createBlog);
router.put('/:id', protect, upload.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'authorProfilePic', maxCount: 1 }
]), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.patch('/:id/toggle-publish', protect, togglePublish);

// Image upload route
router.post('/upload', protect, uploadImage);

module.exports = router;
