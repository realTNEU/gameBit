import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import Chat from "./models/Chat.js";
import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const connectedUsers = new Map();

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const jwt = (await import("jsonwebtoken")).default;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.username = decoded.username;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", async (socket) => {
  const userId = socket.userId;
  connectedUsers.set(userId, socket.id);

  await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() });

  socket.emit("connected", { userId, username: socket.username });

  socket.on("join_chat", async (chatId) => {
    socket.join(`chat_${chatId}`);
    const chat = await Chat.findById(chatId);
    if (chat && chat.participants.some(p => p.toString() === userId)) {
      socket.to(`chat_${chatId}`).emit("user_joined", { userId, username: socket.username });
    }
  });

  socket.on("leave_chat", (chatId) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on("typing", async ({ chatId, isTyping }) => {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.some(p => p.toString() === userId)) {
      return;
    }

    if (isTyping) {
      if (!chat.typing.includes(userId)) {
        chat.typing.push(userId);
        await chat.save();
      }
    } else {
      chat.typing = chat.typing.filter(id => id.toString() !== userId);
      await chat.save();
    }

    socket.to(`chat_${chatId}`).emit("typing", { userId, username: socket.username, isTyping });
  });

  socket.on("send_message", async ({ chatId, content, attachments }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.some(p => p.toString() === userId)) {
        return socket.emit("error", { message: "Chat not found or not authorized" });
      }

      const message = {
        sender: userId,
        content,
        attachments: attachments || [],
        read: false
      };

      chat.messages.push(message);
      chat.lastMessage = new Date();
      await chat.save();

      const populatedChat = await Chat.findById(chatId)
        .populate("participants", "username firstName lastName avatar online")
        .populate("transaction", "status price")
        .populate("product", "title images");

      const newMessage = populatedChat.messages[populatedChat.messages.length - 1];
      await newMessage.populate("sender", "username firstName lastName avatar");

      io.to(`chat_${chatId}`).emit("new_message", {
        chatId,
        message: newMessage
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("mark_read", async ({ chatId }) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.participants.some(p => p.toString() === userId)) {
        return;
      }

      chat.messages.forEach(msg => {
        if (msg.sender.toString() !== userId && !msg.read) {
          msg.read = true;
          msg.readAt = new Date();
        }
      });

      await chat.save();
      socket.to(`chat_${chatId}`).emit("messages_read", { chatId, userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", async () => {
    connectedUsers.delete(userId);
    await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
  });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
