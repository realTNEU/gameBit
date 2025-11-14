import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  searchProducts
} from "../controllers/productController.js";
import authMiddleware, { requireEmailVerification } from "../middleware/authMiddleware.js";
import { requireSellerOrAdmin } from "../middleware/roleMiddleware.js";
import { uploadMultiple } from "../utils/cloudinary.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/seller/:sellerId", getSellerProducts);
router.get("/:id", getProduct);

router.post("/", authMiddleware, requireEmailVerification, requireSellerOrAdmin, uploadMultiple, createProduct);
router.put("/:id", authMiddleware, requireEmailVerification, requireSellerOrAdmin, uploadMultiple, updateProduct);
router.delete("/:id", authMiddleware, requireEmailVerification, requireSellerOrAdmin, deleteProduct);

export default router;

