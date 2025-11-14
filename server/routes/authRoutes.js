import express from "express";
import { signup, login, logout, me, verifyEmail, resendOTP } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.post("/verify-email", authMiddleware, verifyEmail);
router.post("/resend-otp", authMiddleware, resendOTP);

export default router;
