import mongoose from "mongoose";
const { Schema, model } = mongoose;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  read: { type: Boolean, default: false },
  readAt: { type: Date, default: null }
}, { timestamps: true });

const chatSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  transaction: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },
  product: { type: Schema.Types.ObjectId, ref: "Product", default: null },
  messages: [messageSchema],
  lastMessage: { type: Date, default: Date.now },
  typing: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ transaction: 1 });
chatSchema.index({ lastMessage: -1 });

export default model("Chat", chatSchema);

