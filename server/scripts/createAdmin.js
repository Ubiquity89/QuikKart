import bcrypt from 'bcryptjs';
import UserModel from '../models/user.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await UserModel.findOne({ email: 'admin@blinkit.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = new UserModel({
      name: 'Admin',
      email: 'admin@blinkit.com',
      password: hashedPassword,
      role: 'ADMIN',
      verify_email: true,
      status: 'Active'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@blinkit.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
