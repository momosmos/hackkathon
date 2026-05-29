import express from "express";
import * as electionController from "../controllers/election.controller.js";
import { verifyStudentToken } from "../middlewares/auth.middleware.js";
import { checkAlreadyVoted } from "../middlewares/vote.middleware.js";
import { otpLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// ภาพรวมการเลือกตั้ง: รายชื่อพรรค + นโยบาย + สถิติผู้มาใช้สิทธิ์ (เปิดสาธารณะ)
router.get("/dashboard", electionController.getDashboard);

// ผลการเลือกตั้ง: turnout เสมอ; คะแนนรายเบอร์เฉพาะเมื่อปิดหีบแล้ว
router.get("/results", electionController.getResults);

// ขอรหัส OTP เพื่อโหวต (ต้องล็อกอิน + ยังไม่เคยโหวต + จำกัดความถี่)
router.post(
    "/request-otp",
    verifyStudentToken,
    checkAlreadyVoted,
    otpLimiter,
    electionController.requestOTP
);

// ยืนยันและลงคะแนน (ต้องล็อกอิน + ยังไม่เคยโหวต + ตรวจ OTP)
router.post(
    "/submit",
    verifyStudentToken,
    checkAlreadyVoted,
    electionController.submitVote
);

export default router;
