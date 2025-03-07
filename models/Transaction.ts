import mongoose, { Schema, Document } from "mongoose";

interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "transfer" | "payment" | "bill";
  category: "credit" | "debit";
  amount: number;
  status: "pending" | "completed" | "failed";
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["transfer", "payment", "bill"],
      required: true,
    },
    category: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    details: { type: Object }, // Holds extra data like recipient, merchant, or bill info
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  TransactionSchema
);

export default Transaction;
