import mongoose from "mongoose";
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  transaction: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, default: "" },
  verifiedPurchase: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ seller: 1 });
reviewSchema.index({ product: 1 });

export default model("Review", reviewSchema);

