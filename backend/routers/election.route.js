import express from 'express';
import * as electionController from '../controllers/election.controller.js';
import { verifyStudentToken } from '../middlewares/auth.middleware.js';
import { checkAlreadyVoted } from '../middlewares/vote.middleware.js';
import { otpLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * 1. ดูข้อมูลภาพรวมการเลือกตั้ง (Dashboard)
 * [GET] /api/election/dashboard
 * - ดูรายชื่อพรรค, นโยบาย, และเปอร์เซ็นต์คนโหวตปัจจุบัน
 */
router.get('/dashboard', verifyStudentToken, electionController.getDashboard);

/**
 * 2. ดูประวัติและกำหนดการเลือกตั้ง
 * [GET] /api/election/history
 * - ดูงานเลือกตั้งย้อนหลังและงานที่กำลังจะมาถึง
 */
router.get('/history', verifyStudentToken, electionController.getHistory);

/**
 * 3. ขอรหัส OTP สำหรับโหวต
 * [POST] /api/election/request-otp
 * - ต้อง Login + ยังไม่เคยโหวต + จำกัดความถี่ในการขอ (Rate Limit)
 */
router.post('/request-otp', 
    verifyStudentToken, 
    checkAlreadyVoted, 
    otpLimiter, 
    electionController.requestOTP
);

/**
 * 4. ยืนยันการลงคะแนน (Submit Vote)
 * [POST] /api/election/submit
 * - ต้อง Login + ยังไม่เคยโหวต + ตรวจสอบรหัส OTP
 */
router.post('/submit', 
    verifyStudentToken, 
    checkAlreadyVoted, 
    electionController.submitVote
);

export default router;