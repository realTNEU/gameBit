import User from "../models/User.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const requireSeller = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.seller || !user.sellerApproved) {
      return res.status(403).json({ message: "Approved seller access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const requireEscrowAgent = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id);
    if (!user || !user.escrowAgent || !user.escrowApproved) {
      return res.status(403).json({ message: "Approved escrow agent access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const requireSellerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await User.findById(req.user.id);
    if (!user || (!user.isAdmin && (!user.seller || !user.sellerApproved))) {
      return res.status(403).json({ message: "Seller or admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

