import express from "express";

import {
  editTransaction,
  payBill,
  transferMoney,
} from "../controllers/transactionController";

const router = express.Router();

router.put("/", editTransaction);
router.post("/transfer-money", transferMoney);
router.post("/pay-bill", payBill);

export default router;
