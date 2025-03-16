import { User } from "../models/User";
import Transaction from "../models/Transaction";

export const getUserById = async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
};

export const getUserTransactions = async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    const transactions = await Transaction.find({ userId });

    res.status(200).json(transactions);
  } catch (err) {
    res.status(400).json({ error: "Error Fetching transactions" });
  }
};

export const getAllUsers = async (req: any, res: any) => {
  try {
    const users = await User.find({ username: { $ne: "admin" } });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const updateUserProfile = async (req: any, res: any) => {
  const { userId } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user profile:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserBalance = async (req: any, res: any) => {
  const { userId } = req.params;
  const { balance } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { balance } }, // Corrected update object
      { new: true } // Ensure it returns the updated document
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user balance:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserAccountStatus = async (req: any, res: any) => {
  const { userId } = req.params;
  const { accountStatus } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { accountStatus } }, // Corrected update object
      { new: true } // Ensure it returns the updated document
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user account status:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserPassword = async (req: any, res: any) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password !== currentPassword) {
      return res.status(404).json({ message: "Current password is incorrect" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { password: newPassword } }, // Corrected update object
      { new: true } // Ensure it returns the updated document
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user password:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const searchUserByAccountNumber = async (req: any, res: any) => {
  const { accountNumber } = req.query;

  if (!accountNumber) {
    return res.status(400).json({ message: "Account number is required" });
  }

  try {
    const user = await User.findOne({
      accountNumber,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const fullName = `${user.firstName} ${user.middleName} ${user.lastName}`;
    const address = `${user.address}, ${user.city}, ${user.state}, ${user.zipCode}, ${user.country}`;

    return res.status(200).json({
      status: true,
      routingNumber: user.routingNumber,
      fullName,
      address,
    });
  } catch (error) {
    console.error("Error searching for user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
