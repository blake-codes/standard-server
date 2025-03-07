import mongoose from "mongoose";

// User schema
const userSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, required: true, unique: true },
    routingNumber: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    username: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    occupation: { type: String, required: true },
    incomeRange: { type: String, required: true },
    ssn: { type: String, required: false },
    accountType: {
      type: String,
      required: true,
    },
    pin: { type: Number },
    password: { type: String, required: true },
    documents: {
      passport: { type: String, required: true },
      idProof: { type: String, required: true },
      addressProof: { type: String, required: true },
    },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "blocked", "suspended", "closed"],
      default: "pending",
      required: true,
    },
    wrongPinAttempts: { type: Number, default: 0 },
    wrongPinLastAttempt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
