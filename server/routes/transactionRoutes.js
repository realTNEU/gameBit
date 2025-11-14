import express from "express";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  requestEscrow,
  acceptEscrow,
  declineEscrow,
  assignEscrowAgent,
  updateTransactionStatus,
  uploadProof,
  confirmShipping,
  confirmDelivery,
  createDispute,
  resolveTransaction
} from "../controllers/transactionController.js";
import authMiddleware, { requireEmailVerification } from "../middleware/authMiddleware.js";
import { requireAdmin, requireEscrowAgent } from "../middleware/roleMiddleware.js";
import { uploadMultiple } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", authMiddleware, requireEmailVerification, getTransactions);
router.get("/:id", authMiddleware, requireEmailVerification, getTransaction);
router.post("/", authMiddleware, requireEmailVerification, createTransaction);
router.put("/:id", authMiddleware, requireEmailVerification, updateTransaction);
router.post("/:id/escrow/request", authMiddleware, requireEmailVerification, requestEscrow);
router.post("/:id/escrow/accept", authMiddleware, requireEmailVerification, acceptEscrow);
router.post("/:id/escrow/decline", authMiddleware, requireEmailVerification, declineEscrow);
router.post("/:id/escrow/assign", authMiddleware, requireAdmin, assignEscrowAgent);
router.put("/:id/status", authMiddleware, requireEmailVerification, updateTransactionStatus);
router.post("/:id/proof", authMiddleware, requireEmailVerification, uploadMultiple, uploadProof);
router.post("/:id/shipping", authMiddleware, requireEmailVerification, confirmShipping);
router.post("/:id/delivery", authMiddleware, requireEmailVerification, confirmDelivery);
router.post("/:id/dispute", authMiddleware, requireEmailVerification, createDispute);
router.post("/:id/resolve", authMiddleware, requireEscrowAgent, resolveTransaction);

export default router;

