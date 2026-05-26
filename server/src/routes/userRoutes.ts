import express from "express";
import { getProfile, loginUser } from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.get("/get-profile", isAuth, getProfile);

export default router;
