import * as electionService from '../services/election.service.js';

/**
 * 1. ดึงข้อมูลภาพรวมการเลือกตั้ง (Dashboard)
 * GET /api/election/dashboard
 * สำหรับหน้าบ้าน: โชว์รายชื่อผู้สมัคร, นโยบาย และสถิติคนโหวตรวม (%)
 */
export const getDashboard = async (req, res, next) => {
    try {
        const data = await electionService.getElectionDashboard();
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. ขอรหัส OTP สำหรับการโหวต
 * POST /api/election/request-otp
 * สำหรับหน้าบ้าน: กดปุ่ม "ขอรหัส OTP" เพื่อส่งเข้าอีเมล
 */
export const requestOTP = async (req, res, next) => {
    try {
        const studentId = req.student_id; // มาจาก Auth Middleware

        const { voteToken } = await electionService.requestVoteOTP(studentId);
        
        res.status(200).json({
            status: "success",
            message: "ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว",
            voteToken: voteToken // Frontend ต้องเก็บตัวนี้ไว้ส่งกลับตอนโหวตจริง
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * 3. ส่งคะแนนโหวต (Confirm Vote)
 * POST /api/election/submit
 * สำหรับหน้าบ้าน: ยืนยันเบอร์ที่เลือก + รหัส OTP 6 หลัก
 */
export const submitVote = async (req, res, next) => {
    try {
        const studentId = req.student_id;
        const { candidate_no, otp, voteToken } = req.body;

        if (!candidate_no || !otp || !voteToken) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบถ้วนสำหรับการโหวต" });
        }

        const result = await electionService.submitVote(
            studentId, 
            candidate_no, 
            otp, 
            voteToken
        );

        res.status(200).json({
            status: "success",
            message: "บันทึกคะแนนของคุณเรียบร้อยแล้ว",
            receipt: result.receipt
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * 4. ดูรายการเลือกตั้งทั้งหมด/ย้อนหลัง
 * GET /api/election/history
 */
export const getHistory = async (req, res, next) => {
    try {
        const history = await electionService.getResults(); // หรือดึงจาก Repo โดยตรง
        res.status(200).json({
            status: "success",
            data: history
        });
    } catch (error) {
        next(error);
    }
};