import express from "express";
import {
  endChat,
  getAllChats,
  getChatHistory,
  sendMessage,
  startChat,
} from "../controllers/chatController";

const router = express.Router();
router.post("/start", startChat);
router.post("/send/:sessionId", sendMessage);
router.get("/history/:sessionId", getChatHistory);
router.post("/end", endChat);
router.get("/", getAllChats);

export default router;
