import mongoose from "mongoose";
const { Schema, model } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  subcategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  description: { type: String, default: "" },
  icon: { type: String, default: null }
}, { timestamps: true });

export default model("Category", categorySchema);

