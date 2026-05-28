import * as studentService from '../services/student.service.js';

/**
 * 1. คอนโทรลเลอร์: ลงทะเบียนนักเรียนใหม่
 */
export const handleRegister = async (req, res) => {
    try {
        // รับข้อมูลจากหน้า UI (ID, Name, Pass, Class, Year)
        const result = await studentService.register(req.body);
        
        res.status(201).json({
            status: "success",
            message: "ลงทะเบียนสำเร็จแล้ว สามารถเข้าสู่ระบบได้ทันที",
            data: result
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

/**
 * 2. คอนโทรลเลอร์: เข้าสู่ระบบ
 */
export const handleLogin = async (req, res) => {
    try {
        const { student_id, password } = req.body;
        const result = await studentService.login(student_id, password);
        
        res.status(200).json({
            status: "success",
            message: "เข้าสู่ระบบสำเร็จ",
            token: result.token,
            student_name: result.student_name
        });
    } catch (error) {
        res.status(401).json({ status: "error", message: error.message });
    }
};

/**
 * 3. คอนโทรลเลอร์: ขอ OTP ก่อนโหวต (รับ Email จากหน้าบ้าน)
 */
export const handleRequestVoteOTP = async (req, res) => {
    try {
        const { student_id, email } = req.body;
        
        // เรียกใช้ Service เพื่อส่งเมลและสร้าง Token
        const result = await studentService.requestVoteOTP(student_id, email);
        
        res.status(200).json({
            status: "success",
            message: result.message,
            voteToken: result.voteToken // หน้าบ้านต้องเก็บตัวนี้ไว้ส่งกลับมาตอน Verify
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * 4. คอนโทรลเลอร์: ยืนยัน OTP และบันทึกโหวต
 */
export const handleConfirmVote = async (req, res) => {
    try {
        // รับค่ามาครบชุด (Token, เลข OTP, ข้อมูลการโหวต)
        const result = await studentService.verifyAndCastVote(req.body);
        
        res.status(200).json({
            status: "success",
            message: "บันทึกคะแนนโหวตของท่านเรียบร้อยแล้ว",
            receipt: result.receipt
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};