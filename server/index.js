import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fs from 'fs';

dotenv.config();
import morgan from "morgan";
import helmet, { crossOriginResourcePolicy } from "helmet";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.route.js";
import uploadRouter from "./route/upload.router.js";
import subCategoryRouter from "./route/subCategory.route.js";
import productRouter from "./route/product.route.js";
import cartRouter from "./route/cart.route.js";
import addressRouter from "./route/address.route.js";
import orderRouter from "./route/order.route.js";
import webhookRouter from "./route/webhook.route.js";

const app = express();


const allowedOrigins = [
  'http://localhost:5178',
  "https://blinkit-two-rho.vercel.app",
  "https://blinkit-ubiquity89s-projects.vercel.app"
];

app.use(
  cors({
    credentials: true,
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // allow Postman/no-origin requests
      if (allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
  })
);


app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Serve static files from the uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Use helmet and allow cross-origin resource policy for cross-domain frontend
app.use(helmet());
app.use(crossOriginResourcePolicy({ policy: "cross-origin" }));

const PORT = process.env.PORT || 8080;

// Test route
app.get("/", (request, response) => {
  response.json({
    message: `Server is running on port ${PORT}`,
  });
});

// API routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/file", uploadRouter);
app.use("/api/subCategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Configure server settings
app.set('trust proxy', 1); // Trust first proxy

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server with MongoDB connection
const startServer = async () => {
  try {
    // Try to connect to MongoDB but don't block server startup
    connectDB()
      .then(() => console.log('✅ MongoDB connected successfully'))
      .catch(err => {
        console.warn('⚠️  MongoDB connection warning:', err.message);
        console.log('⚠️  Server is running without MongoDB. Some features may not work.');
      });
    
    // Start the HTTP server
    const server = app.listen(PORT, '0.0.0.0', () => {
      try {
        const address = server.address();
        if (!address) {
          console.error('Server address is not available');
          return;
        }
        const host = address.address;
        const port = address.port;
        console.log(`\n🚀 Server is running at:`);
        console.log(`   Local:    http://localhost:${port}`);
        console.log(`   Network:  http://${host === '::' ? 'localhost' : host}:${port}`);
        console.log(`\n📁 Upload Endpoint: POST http://localhost:${port}/api/file/upload-image`);
        console.log(`📁 API Docs:        http://localhost:${port}/api-docs`);
      } catch (error) {
        console.error('Error getting server address:', error);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.log('Please close the program using this port or specify a different port in the .env file');
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
