import User from "../models/User.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { decryptText } from "../utils/crypto.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userObj = user.toObject();
    userObj.phone = userObj.phone ? decryptText(userObj.phone) : null;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, addresses } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) {
      const { encryptText } = await import("../utils/crypto.js");
      user.phone = phone ? encryptText(phone) : null;
    }
    if (addresses) {
      user.addresses = new Map(Object.entries(addresses));
    }
    if (req.file) {
      user.avatar = await uploadToCloudinary(req.file, "gamebit/avatars");
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    userObj.phone = userObj.phone ? decryptText(userObj.phone) : null;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const applyForSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.seller) {
      return res.status(400).json({ message: "Already applied or approved as seller" });
    }

    user.seller = true;
    user.sellerApplicationDate = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: "Seller application submitted", user: userObj });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const applyForEscrow = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.escrowAgent) {
      return res.status(400).json({ message: "Already applied or approved as escrow agent" });
    }

    user.escrowAgent = true;
    user.escrowApplicationDate = new Date();
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ message: "Escrow agent application submitted", user: userObj });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id)
      .select("-password -phone")
      .populate("reviews.productId", "title");

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const products = await Product.find({
      seller: req.params.id,
      status: "active"
    })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort({ createdAt: -1 })
      .limit(20);

    const reviews = await Review.find({ seller: req.params.id })
      .populate("reviewer", "username firstName lastName avatar")
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .limit(20);

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      seller: {
        ...seller.toObject(),
        sellerApproved: seller.sellerApproved
      },
      products,
      reviews,
      stats: {
        totalProducts: products.length,
        totalReviews: reviews.length,
        averageRating: avgRating.toFixed(1)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSellerReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reviews = await Review.find({ seller: req.params.id })
      .populate("reviewer", "username firstName lastName avatar")
      .populate("product", "title images")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ seller: req.params.id });

    res.json({
      reviews,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

