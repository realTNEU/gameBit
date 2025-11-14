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
  password:  { type: String, required: true },
  phone:     { type: String, default: null },
  avatar:    { type: String, default: null },
  addresses: { type: Map, of: addressSchema, default: {} },
  seller:    { type: Boolean, default: false },
  sellerApproved: { type: Boolean, default: false },
  sellerApplicationDate: { type: Date, default: null },
  escrowAgent: { type: Boolean, default: false },
  escrowApproved: { type: Boolean, default: false },
  escrowApplicationDate: { type: Date, default: null },
  pastOrders:[{ type: Schema.Types.ObjectId, ref: "Order" }],
  isAdmin:   { type: Boolean, default: false },
  reviews:   { type: [authoredReviewSchema], default: [] },
  blacklist: { type: Boolean, default: false },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String, default: null },
  emailVerificationOTPExpiry: { type: Date, default: null }
}, { timestamps: true });

export default model("User", userSchema);
