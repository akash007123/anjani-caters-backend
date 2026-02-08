const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/gallery');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');
  
  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, gif, webp) and videos (mp4, webm, mov, avi) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
});

// Public routes
router.get('/', galleryController.getAllGalleryItems);
router.get('/categories', galleryController.getGalleryCategories);
router.get('/:id', galleryController.getGalleryItemById);

// Gallery management routes with file upload
router.post('/', upload.fields([
  { name: 'src', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), galleryController.createGalleryItem);

router.put('/:id', upload.fields([
  { name: 'src', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), galleryController.updateGalleryItem);

router.delete('/:id', galleryController.deleteGalleryItem);
router.patch('/:id/toggle-status', galleryController.toggleGalleryItemStatus);

module.exports = router;
