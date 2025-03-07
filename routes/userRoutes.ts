import express from "express";

import {
  getAllUsers,
  getUserById,
  getUserTransactions,
  searchUserByAccountNumber,
  updateUserAccountStatus,
  updateUserBalance,
  updateUserProfile,
} from "../controllers/userController";
import { checkUserPin } from "../controllers/transactionController";

const router = express.Router();

router.get("/search", searchUserByAccountNumber);
router.get("/:userId", getUserById);
router.put("/:userId", updateUserProfile);
router.put("/:userId/update-balance", updateUserBalance);
router.put("/:userId/update-status", updateUserAccountStatus);
router.get("/transactions/:userId", getUserTransactions);
router.post("/check-pin", checkUserPin);

router.get("/", getAllUsers);

export default router;
