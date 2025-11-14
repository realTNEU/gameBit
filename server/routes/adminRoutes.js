import express from "express";
import {
  getPendingSellers,
  approveSeller,
  rejectSeller,
  getPendingEscrowAgents,
  approveEscrowAgent,
  rejectEscrowAgent,
  getPendingProducts,
  moderateProduct,
  getAnalytics,
  getAllUsers,
  updateUserStatus
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/sellers/pending", authMiddleware, requireAdmin, getPendingSellers);
router.post("/sellers/:id/approve", authMiddleware, requireAdmin, approveSeller);
router.post("/sellers/:id/reject", authMiddleware, requireAdmin, rejectSeller);
router.get("/escrow/pending", authMiddleware, requireAdmin, getPendingEscrowAgents);
router.post("/escrow/:id/approve", authMiddleware, requireAdmin, approveEscrowAgent);
router.post("/escrow/:id/reject", authMiddleware, requireAdmin, rejectEscrowAgent);
router.get("/products/pending", authMiddleware, requireAdmin, getPendingProducts);
router.post("/products/:id/moderate", authMiddleware, requireAdmin, moderateProduct);
router.get("/analytics", authMiddleware, requireAdmin, getAnalytics);
router.get("/users", authMiddleware, requireAdmin, getAllUsers);
router.put("/users/:id", authMiddleware, requireAdmin, updateUserStatus);

export default router;

