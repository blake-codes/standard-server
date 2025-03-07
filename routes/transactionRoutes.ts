import express from "express";

import {
  editTransaction,
  payBill,
  transferMoney,
} from "../controllers/transactionController";

import { authenticate } from "../middlewares/authenticate";

const router = express.Router();

router.put("/", authenticate, editTransaction);
router.post("/transfer-money", authenticate, transferMoney);
router.post("/pay-bill", authenticate, payBill);

export default router;
