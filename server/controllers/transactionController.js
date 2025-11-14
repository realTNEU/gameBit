import Transaction from "../models/Transaction.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getTransactions = async (req, res) => {
  try {
    const { status, role } = req.query;
    const userId = req.user.id;
    const user = await User.findById(userId);

    let query = {};
    if (user.isAdmin) {
      query = status ? { status } : {};
    } else if (user.escrowAgent && user.escrowApproved) {
      query = { escrowAgent: userId };
      if (status) query.status = status;
    } else {
      query = {
        $or: [{ buyer: userId }, { seller: userId }]
      };
      if (status) query.status = status;
    }

    const transactions = await Transaction.find(query)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("product", "title images price seller")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user.isAdmin && 
        transaction.buyer._id.toString() !== userId && 
        transaction.seller._id.toString() !== userId &&
        (!user.escrowAgent || transaction.escrowAgent?._id.toString() !== userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { productId, price } = req.body;
    const buyerId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() === buyerId) {
      return res.status(400).json({ message: "Cannot create transaction for your own product" });
    }

    if (product.status !== "active") {
      return res.status(400).json({ message: "Product is not available" });
    }

    const existing = await Transaction.findOne({
      product: productId,
      buyer: buyerId,
      status: { $in: ["negotiating", "escrow_requested", "escrow_assigned", "payment_initiated"] }
    });

    if (existing) {
      return res.status(400).json({ message: "Active transaction already exists" });
    }

    const transaction = await Transaction.create({
      product: productId,
      buyer: buyerId,
      seller: product.seller,
      price: price || product.price,
      status: "negotiating"
    });

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const userId = req.user.id;
    if (transaction.buyer.toString() !== userId && transaction.seller.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (price) transaction.price = Number(price);
    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const requestEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "negotiating") {
      return res.status(400).json({ message: "Transaction must be in negotiating status" });
    }

    transaction.escrowRequested = true;
    transaction.escrowRequestedBy = req.user.id;
    transaction.status = "escrow_requested";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const acceptEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only seller can accept escrow" });
    }

    if (transaction.status !== "escrow_requested") {
      return res.status(400).json({ message: "Transaction must be in escrow_requested status" });
    }

    transaction.escrowAccepted = true;
    transaction.status = "escrow_assigned";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const declineEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only seller can decline escrow" });
    }

    if (transaction.status !== "escrow_requested") {
      return res.status(400).json({ message: "Transaction must be in escrow_requested status" });
    }

    transaction.escrowRequested = false;
    transaction.escrowRequestedBy = null;
    transaction.status = "negotiating";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const assignEscrowAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status !== "escrow_assigned") {
      return res.status(400).json({ message: "Transaction must be in escrow_assigned status" });
    }

    const agent = await User.findById(agentId);
    if (!agent || !agent.escrowAgent || !agent.escrowApproved) {
      return res.status(400).json({ message: "Invalid escrow agent" });
    }

    transaction.escrowAgent = agentId;
    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    const allowedStatuses = ["payment_initiated", "proof_uploaded", "shipping_confirmed", "delivery_confirmed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    if (status === "payment_initiated" && transaction.buyer.toString() !== userId) {
      return res.status(403).json({ message: "Only buyer can initiate payment" });
    }

    if (status === "proof_uploaded" && transaction.seller.toString() !== userId) {
      return res.status(403).json({ message: "Only seller can upload proof" });
    }

    if (status === "shipping_confirmed" && transaction.seller.toString() !== userId && !user.escrowAgent) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status === "delivery_confirmed" && transaction.buyer.toString() !== userId && !user.escrowAgent) {
      return res.status(403).json({ message: "Not authorized" });
    }

    transaction.status = status;
    if (status === "shipping_confirmed") transaction.shippingConfirmed = true;
    if (status === "delivery_confirmed") transaction.deliveryConfirmed = true;

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const uploadProof = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only seller can upload proof" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const proofImages = await Promise.all(
      req.files.map(file => uploadToCloudinary(file, "gamebit/proofs"))
    );
    transaction.proofImages = [...(transaction.proofImages || []), ...proofImages];
    transaction.status = "proof_uploaded";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const confirmShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only seller can confirm shipping" });
    }

    transaction.shippingTracking = tracking || null;
    transaction.shippingConfirmed = true;
    transaction.status = "shipping_confirmed";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only buyer can confirm delivery" });
    }

    transaction.deliveryConfirmed = true;
    transaction.status = "delivery_confirmed";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const userId = req.user.id;
    if (transaction.buyer.toString() !== userId && transaction.seller.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    transaction.disputeReason = reason;
    transaction.status = "dispute";

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resolveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (!transaction.escrowAgent || transaction.escrowAgent.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only assigned escrow agent can resolve" });
    }

    transaction.resolutionNotes = resolutionNotes || null;
    transaction.status = "completed";
    transaction.completedAt = new Date();

    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate("product", "title images price")
      .populate("buyer", "username firstName lastName avatar")
      .populate("seller", "username firstName lastName avatar")
      .populate("escrowAgent", "username firstName lastName avatar");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

