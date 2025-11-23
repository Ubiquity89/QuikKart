import { Router } from "express";
import auth from "../middleware/auth.js";
import { handleUpload } from "../middleware/multer.js";
import uploadImageController from "../controllers/uploadImage.controller.js";

const uploadRouter = Router();

// Apply auth middleware if needed
// uploadRouter.use(auth);

// Use the handleUpload middleware which includes error handling
uploadRouter.post("/upload-image", 
  (req, res, next) => {
    console.log('Upload request received');
    next();
  },
  handleUpload,
  uploadImageController
);

// Error handling middleware
uploadRouter.use((err, req, res, next) => {
  console.error('Upload route error:', err);
  res.status(500).json({
    success: false,
    message: 'An error occurred during file upload',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });});

export default uploadRouter;
