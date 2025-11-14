import express from "express";
import {
  getProfile,
  updateProfile,
  applyForSeller,
  applyForEscrow,
  getSellerProfile,
  getSellerReviews
} from "../controllers/userController.js";
import authMiddleware, { requireEmailVerification } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/profile", authMiddleware, requireEmailVerification, getProfile);
router.put("/profile", authMiddleware, requireEmailVerification, uploadSingle, updateProfile);
router.post("/apply/seller", authMiddleware, requireEmailVerification, applyForSeller);
router.post("/apply/escrow", authMiddleware, requireEmailVerification, applyForEscrow);
router.get("/seller/:id", getSellerProfile);
router.get("/seller/:id/reviews", getSellerReviews);

export default router;

