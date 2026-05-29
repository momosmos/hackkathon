import express from "express";
import * as controller from "../controllers/ai.controller.js";
import { verifyStudentToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// เส้นทางสำหรับถาม AI (POST /api/ai/ask) - ต้องล็อกอิน
router.post("/ask", verifyStudentToken, controller.chatWithAI);
// เส้นทางสำหรับดึงประวัติแชท (GET /api/ai/history) - ต้องล็อกอิน
router.get("/history", verifyStudentToken, controller.getMyChatHistory);

export default router;