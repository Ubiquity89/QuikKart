import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define uploads directory path
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists with proper permissions
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Uploads directory ready at: ${uploadDir}`);
    return true;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    return false;
  }
};

// Initialize the directory
ensureUploadsDir();

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadsDir();
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `img-${uniqueSuffix}${ext}`;
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error);
    }
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  try {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      console.log(`Accepting file: ${file.originalname}, type: ${file.mimetype}`);
      cb(null, true);
    } else {
      const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, JPG, PNG, and WebP are allowed.`);
      console.error(error.message);
      cb(error, false);
    }
  } catch (error) {
    console.error('Error in file filter:', error);
    cb(error, false);
  }
};

// Multer instance configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  // Handle multer errors
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  },
});

// Error handling wrapper
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file',
        code: err.code
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Internal server error during file upload',
        code: 'UPLOAD_ERROR'
      });
    }
    // Everything went fine, proceed to the next middleware
    next();
  });
};

export { upload, handleUpload };
