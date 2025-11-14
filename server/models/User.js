// server/models/User.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const addressSchema = new Schema({
  label: String,
  street: String,
  city: String,
  state: String,
  country: String,
  zip: String
}, { _id: false });

const authoredReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  reviewText: { type: String, default: "" },
  createdAt: { type: Date, default: () => new Date() }
}, { _id: true });

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true }, // hashed
  phone:     { type: String, default: null },   // encrypted string (ciphertext)
  avatar:    { type: String, default: null },
  addresses: { type: Map, of: addressSchema, default: {} },
  seller:    { type: Boolean, default: false },
  pastOrders:[{ type: Schema.Types.ObjectId, ref: "Order" }],
  isAdmin:   { type: Boolean, default: false },
  // reviews authored BY this user
  reviews:   { type: [authoredReviewSchema], default: [] },
  blacklist: { type: Boolean, default: false }
}, { timestamps: true });

export default model("User", userSchema);
