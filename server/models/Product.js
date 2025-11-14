import mongoose from "mongoose";
const { Schema, model } = mongoose;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String, required: true }],
  price: { type: Number, required: true, min: 0 },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  subcategory: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  condition: { 
    type: String, 
    required: true,
    enum: ["New", "Mint", "Slightly Used", "Used With Wear", "Damaged but Usable", "Custom"],
    default: "Used With Wear"
  },
  customCondition: { type: String, default: null },
  stock: { type: Number, required: true, default: 1, min: 0 },
  status: { 
    type: String, 
    enum: ["active", "sold", "pending_moderation", "rejected", "inactive"],
    default: "pending_moderation"
  },
  adminModerated: { type: Boolean, default: false },
  moderationNotes: { type: String, default: null },
  views: { type: Number, default: 0 },
  favorites: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

productSchema.index({ title: "text", description: "text" });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1 });

export default model("Product", productSchema);

