import express from "express";
import {
  getChats,
  getChat,
  createChat,
  getChatMessages,
  markMessagesRead
} from "../controllers/chatController.js";
import authMiddleware, { requireEmailVerification } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, requireEmailVerification, getChats);
router.get("/:id", authMiddleware, requireEmailVerification, getChat);
router.get("/:id/messages", authMiddleware, requireEmailVerification, getChatMessages);
router.post("/", authMiddleware, requireEmailVerification, createChat);
router.put("/:id/read", authMiddleware, requireEmailVerification, markMessagesRead);

export default router;

