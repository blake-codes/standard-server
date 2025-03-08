import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import chatRoutes from "./routes/chatRoutes";

// Import Chat model
import Chat from "./models/Chat";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  });

// Socket.IO setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust as needed for security
    methods: ["GET", "POST"],
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Listen for messages from clients
  socket.on("sendMessage", async (data) => {
    const { sessionId, sender, message, isUser, id } = data;
    // Validate required fields
    if (
      !sessionId ||
      !sender ||
      !message ||
      !id ||
      typeof isUser === "undefined"
    ) {
      console.error("Invalid message data:", data);
      return;
    }
    try {
      const chat = await Chat.findOne({ sessionId, isActive: true });

      if (!chat) {
        console.error("Chat session not found or inactive:", sessionId);
        return;
      }

      // Save the message to the database
      chat.messages.push(data);
      await chat.save();
      // Broadcast the message to all clients
      io.emit("receiveMessage", {
        sessionId,
        sender,
        message,
        id,
        isUser,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
// app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ error: err.message || "Internal Server Error" });
});

// Handle process-level errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server
httpServer.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
