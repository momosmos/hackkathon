import express from "express";
import * as controller from "../controllers/ai.controller.js";

const router = express.Router();

// เส้นทางสำหรับถาม AI (POST /api/ai/ask)
router.post("/ask", controller.chatWithAI);

export default router;