import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subcategory,
      minPrice,
      maxPrice,
      condition,
      sort = "createdAt",
      order = "desc",
      seller
    } = req.query;

    const query = { status: "active" };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (seller) query.seller = seller;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortObj = {};
    sortObj[sort] = order === "asc" ? 1 : -1;

    const products = await Product.find(query)
      .populate("seller", "username firstName lastName avatar")
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ message: "Search query required" });

    const products = await Product.find({
      $text: { $search: q },
      status: "active"
    })
      .populate("seller", "username firstName lastName avatar")
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Product.countDocuments({
      $text: { $search: q },
      status: "active"
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "username firstName lastName avatar sellerApproved")
      .populate("category", "name slug")
      .populate("subcategory", "name slug");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ seller: sellerId, status: "active" })
      .populate("category", "name slug")
      .populate("subcategory", "name slug")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, subcategory, condition, customCondition, stock } = req.body;
    const sellerId = req.user.id;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(file => uploadToCloudinary(file, "gamebit/products"))
      );
    }
    if (images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const product = await Product.create({
      title,
      description,
      images,
      price: Number(price),
      seller: sellerId,
      category,
      subcategory: subcategory || null,
      condition: condition || "Used With Wear",
      customCondition: condition === "Custom" ? customCondition : null,
      stock: Number(stock) || 1,
      status: "pending_moderation"
    });

    const populated = await Product.findById(product._id)
      .populate("seller", "username firstName lastName avatar")
      .populate("category", "name slug")
      .populate("subcategory", "name slug");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, price, category, subcategory, condition, customCondition, stock } = req.body;

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (condition) {
      product.condition = condition;
      product.customCondition = condition === "Custom" ? customCondition : null;
    }
    if (stock !== undefined) product.stock = Number(stock);

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file, "gamebit/products"))
      );
      product.images = [...product.images, ...newImages];
    }

    if (req.body.removeImages) {
      const toRemove = Array.isArray(req.body.removeImages) ? req.body.removeImages : [req.body.removeImages];
      product.images = product.images.filter(img => !toRemove.includes(img));
    }

    if (req.user.isAdmin && req.body.status) {
      product.status = req.body.status;
    } else if (!req.user.isAdmin) {
      product.status = "pending_moderation";
    }

    await product.save();

    const populated = await Product.findById(product._id)
      .populate("seller", "username firstName lastName avatar")
      .populate("category", "name slug")
      .populate("subcategory", "name slug");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.seller.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized" });
    }

    product.status = "inactive";
    await product.save();

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

