import express from "express";
import {
  analyseResume,
  generateInterview,
  jobMatcher,
} from "../controllers/ai.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/analyse", isAuth, analyseResume);
router.post("/job-matcher", isAuth, jobMatcher);
router.post("/interview", isAuth, generateInterview);

export default router;
