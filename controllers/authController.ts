import { User } from "../models/User";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "jdueusjs";

export const login = async (req: any, res: any) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    switch (user.accountStatus) {
      case "pending":
        return res.status(403).json({
          message: "Your account is pending approval. Please contact support.",
        });
      case "blocked":
        return res.status(403).json({
          message: "Your account has been blocked. Contact support for help.",
        });
      case "suspended":
        return res.status(403).json({
          message:
            "Your account is suspended. Contact support for reactivation.",
        });
      case "active":
        break; // Allow login for active users
      default:
        return res.status(500).json({
          message: "Account status unknown. Please contact support.",
        });
    }

    const token = jwt.sign({ _id: user._id, username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ ...user.toObject(), token });
  } catch (err) {
    res.status(500).json({ error: "Error logging in" });
  }
};

// Helper to generate a unique 12-digit account number
const generateAccountNumber = () => {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
};

// Helper to generate a unique username
const generateUsername = (firstName: string, lastName: string) => {
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, "");
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, "");
  return `${cleanFirst}${cleanLast}${randomSuffix}`;
};

const generateRoutingNumber = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

const generatePassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const createAccount = async (req: any, res: any) => {
  const {
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    address,
    email,
    phoneNumber,
    country,
    state,
    city,
    zipCode,
    occupation,
    incomeRange,
    ssn,
    accountType,
    passport,
    idProof,
    addressProof,
  } = req.body;

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }
    const password = generatePassword();

    // Generate account number and username
    const accountNumber = generateAccountNumber();
    const routingNumber = generateRoutingNumber();
    const username = generateUsername(firstName, lastName);

    const newUser = new User({
      accountNumber,
      routingNumber,
      username,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      address,
      email,
      phoneNumber,
      country,
      state,
      city,
      zipCode,
      occupation,
      incomeRange,
      ssn,
      accountType,
      password,
      documents: {
        passport,
        idProof,
        addressProof,
      },
      accountStatus: "pending", // Default status for admin approval
    });

    await newUser.save();

    return res.status(201).json({
      message: "Account created successfully. Pending admin approval.",
      accountNumber,
      username,
    });
  } catch (error) {
    console.log(error, "ERROR__");
    return res.status(500).json({ error: "Error creating account." });
  }
};

export const healthCheck = async (req: any, res: any) => {
  res.status(200).json({ status: true });
};
