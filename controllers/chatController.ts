import { Request, Response } from "express";
import Chat from "../models/Chat";
import { v4 as uuidv4 } from "uuid";

// Start a new chat session
export const startChat = async (req: any, res: any) => {
  try {
    const { chatUser } = req.body;
    let chat;
    const sessionId = uuidv4();
    chat = new Chat({ sessionId, chatUser, isActive: true });

    await chat.save();
    res.status(201).json({
      message: "Chat session started successfully.",
      sessionId,
    });
  } catch (error) {
    res.status(400).json({ message: "Error starting chat session", error });
  }
};

// Send a message in an active chat session
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;
  const { sender, message, isUser, id } = req.body;

  if (!sender || !message || !id || typeof isUser === "undefined") {
    res
      .status(400)
      .json({ message: "Sender, message, and isUser are required." });
    return;
  }

  try {
    const chat = await Chat.findOne({ sessionId, isActive: true });

    if (!chat) {
      res.status(404).json({ message: "Chat session not found or inactive." });
      return;
    }

    chat.messages.push({
      sender,
      message,
      id,
      isUser,
    });

    await chat.save();

    res.status(200).json({ message: "Message sent successfully.", chat });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
  }
};

// Retrieve chat history
export const getChatHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const chat = await Chat.findOne({ sessionId });

    if (!chat) {
      res.status(404).json({ message: "Chat session not found." });
      return;
    }

    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving chat history", error });
  }
};

// End a chat session
export const endChat = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;

  try {
    const chat = await Chat.findOne({ sessionId });

    if (!chat) {
      res.status(404).json({ message: "Chat session not found." });
      return;
    }

    chat.isActive = false;
    await chat.save();
    res.status(200).json({ message: "Chat session ended successfully.", chat });
  } catch (error) {
    res.status(500).json({ message: "Error ending chat session", error });
  }
};

// Get all chat messages with the latest message for each session
export const getAllChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const chats = await Chat.find({}).sort({ createdAt: -1 }).lean();

    const chatSummaries = chats.map((chat) => {
      const latestMessage = chat.messages?.slice(-1)[0] || null;
      return {
        sessionId: chat.sessionId,
        chatUser: chat.chatUser,
        isActive: chat.isActive,
        createdAt: chat.createdAt,
        latestMessage,
      };
    });

    res.status(200).json({
      message: "All chat sessions retrieved successfully.",
      chats: chatSummaries,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving all chats", error });
  }
};
