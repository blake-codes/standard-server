import mongoose, { Schema, Document } from "mongoose";

interface IMessage {
  sender: string; // "user" or "admin"
  message: string;
  id: string;
  isUser?: boolean;
  timestamp?: Date;
}

export interface IChat extends Document {
  sessionId: string;
  chatUser: string;
  messages: IMessage[];
  isActive: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  id: { type: String, required: true },
  isUser: { type: Boolean, required: true, default: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatSchema = new Schema<IChat>({
  sessionId: { type: String, required: true, unique: true },
  chatUser: { type: String, required: true },
  messages: { type: [MessageSchema], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Chat = mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
