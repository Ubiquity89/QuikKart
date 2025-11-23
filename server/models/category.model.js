import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true } // ✅ Correct place for timestamps
);

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
