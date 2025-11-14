import User from "../models/User.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";
import Category from "../models/Category.js";

export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await User.find({
      seller: true,
      sellerApproved: false
    }).select("-password").sort({ sellerApplicationDate: -1 });

    res.json(sellers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.seller) {
      return res.status(404).json({ message: "Seller application not found" });
    }

    user.sellerApproved = true;
    await user.save();

    res.json({ message: "Seller approved", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.seller) {
      return res.status(404).json({ message: "Seller application not found" });
    }

    user.seller = false;
    user.sellerApproved = false;
    user.sellerApplicationDate = null;
    await user.save();

    res.json({ message: "Seller application rejected", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPendingEscrowAgents = async (req, res) => {
  try {
    const agents = await User.find({
      escrowAgent: true,
      escrowApproved: false
    }).select("-password").sort({ escrowApplicationDate: -1 });

    res.json(agents);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveEscrowAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.escrowAgent) {
      return res.status(404).json({ message: "Escrow agent application not found" });
    }

    user.escrowApproved = true;
    await user.save();

    res.json({ message: "Escrow agent approved", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectEscrowAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.escrowAgent) {
      return res.status(404).json({ message: "Escrow agent application not found" });
    }

    user.escrowAgent = false;
    user.escrowApproved = false;
    user.escrowApplicationDate = null;
    await user.save();

    res.json({ message: "Escrow agent application rejected", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: "pending_moderation" })
      .populate("seller", "username firstName lastName")
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const moderateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (action === "approve") {
      product.status = "active";
      product.adminModerated = true;
    } else if (action === "reject") {
      product.status = "rejected";
      product.adminModerated = true;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (notes) product.moderationNotes = notes;
    await product.save();

    const populated = await Product.findById(product._id)
      .populate("seller", "username firstName lastName")
      .populate("category", "name slug")
      .populate("subcategory", "name slug");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ seller: true, sellerApproved: true });
    const totalProducts = await Product.countDocuments({ status: "active" });
    const pendingProducts = await Product.countDocuments({ status: "pending_moderation" });
    const totalTransactions = await Transaction.countDocuments();
    const activeTransactions = await Transaction.countDocuments({
      status: { $in: ["negotiating", "escrow_requested", "escrow_assigned", "payment_initiated", "proof_uploaded", "shipping_confirmed", "delivery_confirmed"] }
    });
    const completedTransactions = await Transaction.countDocuments({ status: "completed" });
    const totalCategories = await Category.countDocuments();

    const recentProducts = await Product.find({ status: "active" })
      .populate("seller", "username")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentTransactions = await Transaction.find()
      .populate("buyer", "username")
      .populate("seller", "username")
      .populate("product", "title")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      overview: {
        totalUsers,
        totalSellers,
        totalProducts,
        pendingProducts,
        totalTransactions,
        activeTransactions,
        completedTransactions,
        totalCategories
      },
      recentProducts,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    let query = {};

    if (role === "seller") {
      query = { seller: true };
    } else if (role === "escrow") {
      query = { escrowAgent: true };
    } else if (role === "admin") {
      query = { isAdmin: true };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { blacklist } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (blacklist !== undefined) {
      user.blacklist = blacklist;
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

