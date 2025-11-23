import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log('Connected to MongoDB');
  const ProductModel = await import('./models/product.model.js');
  
  try {
    // Drop existing text index if it exists
    await ProductModel.default.collection.dropIndex('name_text_description_text');
    console.log('Dropped existing text index');
  } catch (error) {
    console.log('No existing text index to drop');
  }
  
  try {
    // Create the text index
    await ProductModel.default.createIndexes();
    console.log('Text index created successfully');
    
    // Check existing indexes
    const indexes = await ProductModel.default.collection.getIndexes();
    console.log('Current indexes:', Object.keys(indexes));
    
  } catch (error) {
    console.error('Error creating index:', error);
  }
  
  mongoose.connection.close();
})
.catch(console.error);
