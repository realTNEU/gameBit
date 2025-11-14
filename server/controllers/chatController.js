import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "username firstName lastName avatar online lastSeen")
      .populate("transaction", "status price")
      .populate("product", "title images")
      .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "username firstName lastName avatar online lastSeen")
      .populate("transaction", "status price")
      .populate("product", "title images");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const userId = req.user.id;
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createChat = async (req, res) => {
  try {
    const { participantId, transactionId, productId } = req.body;
    const userId = req.user.id;

    if (!participantId) {
      return res.status(400).json({ message: "Participant ID required" });
    }

    if (participantId === userId) {
      return res.status(400).json({ message: "Cannot create chat with yourself" });
    }

    const existing = await Chat.findOne({
      participants: { $all: [userId, participantId] },
      transaction: transactionId || null,
      product: productId || null
    });

    if (existing) {
      const populated = await Chat.findById(existing._id)
        .populate("participants", "username firstName lastName avatar online lastSeen")
        .populate("transaction", "status price")
        .populate("product", "title images");
      return res.json(populated);
    }

    const chat = await Chat.create({
      participants: [userId, participantId],
      transaction: transactionId || null,
      product: productId || null,
      messages: []
    });

    const populated = await Chat.findById(chat._id)
      .populate("participants", "username firstName lastName avatar online lastSeen")
      .populate("transaction", "status price")
      .populate("product", "title images");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const userId = req.user.id;
    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(chat.messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markMessagesRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const userId = req.user.id;
    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== userId && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
      }
    });

    await chat.save();
    res.json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

