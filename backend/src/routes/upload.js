import express from 'express';
import multer from 'multer';
import { uploadToCloudinary, uploadBase64OrUrl } from '../services/cloudinary.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed'));
    }
  },
});

// Single image upload
router.post(
  '/',
  optionalAuth,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      if (!isCloudinaryConfigured) {
        return res.status(503).json({
          error: 'Cloudinary is not configured',
          message:
            'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend/.env file.',
        });
      }

      const folder = req.body?.folder || req.query?.folder || 'trail-india';

      // Check if uploaded as a multipart file
      const uploadedFile = req.files?.file?.[0] || req.files?.image?.[0] || req.files?.photo?.[0];

      if (uploadedFile) {
        const result = await uploadToCloudinary(uploadedFile.buffer, {
          folder,
        });
        return res.status(201).json({
          success: true,
          ...result,
        });
      }

      // Check if uploaded as base64 string or image URL in JSON body
      const dataUriOrUrl = req.body?.data || req.body?.image || req.body?.url;
      if (dataUriOrUrl) {
        const result = await uploadBase64OrUrl(dataUriOrUrl, { folder });
        return res.status(201).json({
          success: true,
          ...result,
        });
      }

      return res.status(400).json({
        error: 'No image provided',
        message: 'Please provide an image file (field: file, image, or photo) or a base64/URL string.',
      });
    } catch (err) {
      next(err);
    }
  }
);

// Multiple image upload (up to 5 images)
router.post(
  '/multiple',
  optionalAuth,
  upload.array('files', 5),
  async (req, res, next) => {
    try {
      if (!isCloudinaryConfigured) {
        return res.status(503).json({
          error: 'Cloudinary is not configured',
          message:
            'Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your backend/.env file.',
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No files provided',
          message: 'Please provide at least one image file under the "files" field.',
        });
      }

      const folder = req.body?.folder || req.query?.folder || 'trail-india';

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, { folder })
      );

      const results = await Promise.all(uploadPromises);

      res.status(201).json({
        success: true,
        count: results.length,
        images: results,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;

