import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { checkout, paymentVerification } from "../controllers/payment.js";
const router = express.Router();
router.post("/checkout", isAuth, checkout);
router.post("/verify", isAuth, paymentVerification);
export default router;
