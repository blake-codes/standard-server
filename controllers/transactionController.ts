import { User } from "../models/User";
import Transaction from "../models/Transaction";

// Helper function to check user's PIN.
export const checkUserPin = async (req: any, res: any) => {
  const { sender, providedPin } = req.body;
  const user = await User.findById(sender);
  if (!user) {
    return res.status(404).json({ message: "Sender not found." });
  }
  const now = new Date();
  const timeWindow = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (Number(user.pin) !== Number(providedPin)) {
    // If there's no previous attempt or the last attempt is outside the time window, reset counter.
    if (
      !user.wrongPinAttempts ||
      !user.wrongPinLastAttempt ||
      now.getTime() - new Date(user.wrongPinLastAttempt).getTime() > timeWindow
    ) {
      user.wrongPinAttempts = 1;
    } else {
      user.wrongPinAttempts = (user.wrongPinAttempts || 0) + 1;
    }
    user.wrongPinLastAttempt = now;
    await user.save();

    // If 3 incorrect attempts occur within the time window, suspend the account.
    if (user.wrongPinAttempts >= 3) {
      user.accountStatus = "suspended";
      await user.save();
      return res.status(403).json({
        message:
          "Account suspended due to multiple incorrect PIN attempts. Please contact support.",
      });
    }
    return res.status(401).json({ message: "Incorrect PIN" });
  } else {
    // Correct PIN: reset the counter.
    user.wrongPinAttempts = 0;
    user.wrongPinLastAttempt = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "PIN verified" });
  }
};

export const transferMoney = async (req: any, res: any) => {
  try {
    // Extract required fields from the request body.
    const { userId, amount, details } = req.body;
    if (!userId || !amount || !details) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    console.log("IN HERE 111");
    // Find the sender.
    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    // Check that the sender's account status is active.
    if (sender.accountStatus !== "active") {
      return res.status(403).json({
        message: "Your account is not active. Please contact support.",
      });
    }

    // Check if the sender has sufficient funds.
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds." });
    }

    // Deduct the amount from the sender's balance.
    sender.balance -= amount;
    await sender.save();

    const isStandard = details.bankName === "standard-chartered";

    // Create the debit transaction record for the sender.
    const transaction = await Transaction.create({
      userId: sender._id,
      type: "transfer",
      category: "debit",
      amount,
      status: isStandard ? "completed" : "pending",
      details, // details should include recipient info, bankName, routingNumber, address, narration, etc.
    });

    // For Standard Chartered transfers, process the credit side.
    if (isStandard) {
      const receiver = await User.findOne({
        accountNumber: details.accountNumber,
      });
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found." });
      }
      receiver.balance += amount;
      await receiver.save();
      await Transaction.create({
        userId: receiver._id,
        type: "transfer",
        category: "credit",
        amount,
        status: "completed",
        details: {
          accountNumber: sender.accountNumber,
          fullName: `${sender.firstName} ${sender.middleName} ${sender.lastName}`,
          bankName: details.bankName,
          routingNumber: sender.routingNumber,
          address: `${sender.address}, ${sender.city}, ${sender.state}, ${sender.zipCode}, ${sender.country}`,
          narration: details.narration,
        },
      });
    }

    return res.status(200).json({
      status: true,
      message: "Transfer successful",
      transaction,
    });
  } catch (err) {
    console.log("Error in transferMoney:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const payBill = async (req: any, res: any) => {
  try {
    const { userId, amount, billDetails } = req.body;

    // Validate required fields
    if (!userId || !amount || !billDetails) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the user (payer)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the user account is active
    if (user.accountStatus !== "active") {
      return res.status(403).json({ message: "Account is not active." });
    }

    // Check for sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds." });
    }

    // Deduct the bill amount from the user's balance
    user.balance -= amount;
    await user.save();

    // Create a transaction record for the bill payment
    const transaction = await Transaction.create({
      userId: user._id,
      type: "bill",
      category: "debit",
      amount,
      status: "completed",
      details: billDetails, // e.g., biller name, bill type, reference number
    });

    return res.status(200).json({
      status: true,
      message: "Bill payment successful",
      transaction,
    });
  } catch (err) {
    console.error("Error in payBill:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editTransaction = async (req: any, res: any) => {
  try {
    const { transactionId, updates } = req.body;
    if (!transactionId || !updates) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Fetch the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (updates.transactionDate) {
      transaction.createdAt = updates.transactionDate;
    }

    // Apply updates directly (including `createdAt`)
    Object.assign(transaction, updates);

    // Save updated transaction
    await transaction.save();

    return res.status(200).json({
      status: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (err) {
    console.error("Error in editTransaction:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
