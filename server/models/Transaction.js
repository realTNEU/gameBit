import mongoose from "mongoose";
const { Schema, model } = mongoose;

const transactionSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
  escrowAgent: { type: Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["negotiating", "escrow_requested", "escrow_declined", "escrow_assigned", "payment_initiated", "proof_uploaded", "shipping_confirmed", "delivery_confirmed", "dispute", "completed", "cancelled"],
    default: "negotiating"
  },
  price: { type: Number, required: true },
  escrowRequested: { type: Boolean, default: false },
  escrowRequestedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  escrowAccepted: { type: Boolean, default: false },
  proofImages: [{ type: String }],
  shippingTracking: { type: String, default: null },
  shippingConfirmed: { type: Boolean, default: false },
  deliveryConfirmed: { type: Boolean, default: false },
  disputeReason: { type: String, default: null },
  resolutionNotes: { type: String, default: null },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ escrowAgent: 1, status: 1 });

export default model("Transaction", transactionSchema);

