import CategoryModel from "../models/category.model.js";
import mongoose from "mongoose";

export const AddCategoryController = async (request, response) => {
    try {
        console.log(' AddCategoryController - Request body:', request.body);
        console.log(' AddCategoryController - Request user:', request.userId);
        
        const { name, image } = request.body;
        
        if (!name || !image) {
            console.log(' Validation failed - Missing fields:', { name: !!name, image: !!image });
            return response.status(400).json({
                message: "Name and image are required fields",
                error: true,
                success: false
            });
        }

        console.log(' Checking for existing category with name:', name);
        const existingCategory = await CategoryModel.findOne({ name });
        
        if (existingCategory) {
            console.log(' Category already exists:', existingCategory.name);
            return response.status(400).json({
                message: "Category with this name already exists",
                error: true,
                success: false
            });
        }

        console.log(' Creating new category:', { name, image });
        const newCategory = new CategoryModel({
            name,
            image
        });

        console.log(' Saving category to database...');
        const savedCategory = await newCategory.save();
        
        console.log(' Category saved successfully:', savedCategory);
        return response.status(201).json({
            message: "Category added successfully",
            data: savedCategory,
            success: true,
            error: false
        });

    } catch (error) {
        console.error(" Error in AddCategoryController:", error);
        console.error(" Error stack:", error.stack);
        console.error(" Error message:", error.message);
        
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
};

export const getCategoryController = async(request,response)=>{
       try {
        
        const data = await CategoryModel.find().sort({ createdAt : -1 })

        return response.json({
            data : data,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.messsage || error,
            error : true,
            success : false
        })
    }
}

export const updateCategoryController = async(request,response)=>{
    try {
        const { _id ,name, image } = request.body 
        console.log('Update request received:', { _id, name, image });

        const update = await CategoryModel.updateOne({
            _id : _id
        },{
           name, 
           image 
        })

        console.log('Update successful:', update);
        return response.json({
            message : "Updated Category",
            success : true,
            error : false,
            data : update
        })
    } catch (error) {
        console.error('Update error:', error.message);
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteCategoryController = async(request,response)=>{
    try {
        const { _id } = request.body 
        console.log('Delete request received for category ID:', _id);

        if (!_id) {
            return response.status(400).json({
                message: "Category ID is required",
                error: true,
                success: false
            });
        }

        const deleteResult = await CategoryModel.deleteOne({
            _id : _id
        })

        console.log('Delete result:', deleteResult);
        
        if (deleteResult.deletedCount === 0) {
            return response.status(404).json({
                message: "Category not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message : "Category deleted successfully",
            success : true,
            error : false,
            data : deleteResult
        })
    } catch (error) {
        console.error('Delete error:', error.message);
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}




