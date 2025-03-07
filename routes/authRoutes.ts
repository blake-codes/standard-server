import express from "express";
import {
  login,
  healthCheck,
  createAccount,
} from "../controllers/authController";

const router = express.Router();
router.post("/login", login);
router.post("/register", createAccount);
router.get("/healthcheck", healthCheck);

export default router;
