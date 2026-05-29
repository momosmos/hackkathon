import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as studentRepo from '../repositories/student.repository.js';
import * as emailUtil from '../utils/email.util.js';

/**
 * 1. ระบบลงทะเบียน (Register)
 * สำหรับหน้า UI ที่คุณมอสส่งมา (ID, Name, Pass, Class)
 */
export const register = async (registerData) => {
    const { student_id, password, student_name, student_class, graduation_year } = registerData;

    // เช็คว่ามีรหัสนี้ในระบบโรงเรียนไหม
    const student = await studentRepo.findById(student_id);
    if (!student) throw new Error("ไม่พบรหัสนักเรียนนี้ในฐานข้อมูล");

    // เช็คว่าเคยลงทะเบียนไปหรือยัง (ถ้ามี password แปลว่าลงแล้ว)
    if (student.password) throw new Error("รหัสนักเรียนนี้ลงทะเบียนไปแล้ว");

    // 🛡️ Hash รหัสผ่านก่อนบันทึก (bcrypt)
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกลง Database
    return await studentRepo.registerStudent({
        student_id,
        student_name,
        password: hashedPassword,
        student_class,
        graduation_year
    });
};

/**
 * 2. ระบบเข้าสู่ระบบ (Login)
 */
export const login = async (student_id, password) => {
    const student = await studentRepo.findById(student_id);
    
    if (!student || !student.password) {
        throw new Error("รหัสนักเรียนยังไม่ได้ลงทะเบียน หรือข้อมูลไม่ถูกต้อง");
    }

    // 🛡️ เทียบรหัสผ่านที่กรอกมา กับตัวที่ Hash ไว้ใน DB
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) throw new Error("รหัสผ่านไม่ถูกต้อง");

    if (student.student_status !== 'Active') {
        throw new Error("บัญชีของคุณถูกระงับการใช้งาน");
    }

    // ออก JWT Token สำหรับการใช้งานทั่วไป
    const token = jwt.sign(
        { student_id: student.student_id, name: student.student_name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );

    return { token, student_name: student.student_name };
};

/**
 * 3. ส่ง OTP ยืนยันก่อนโหวต (Stateless - ไม่ลง DB)
 */
export const requestVoteOTP = async (studentId, inputEmail) => {
    // 1. สุ่มเลข OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. สร้าง Token ชั่วคราวเก็บ OTP ไว้ (ส่งกลับไปให้หน้าบ้านถือไว้)
    const voteToken = jwt.sign(
        { studentId, otp, inputEmail },
        process.env.OTP_SECRET,
        { expiresIn: '5m' } // มีอายุแค่ 5 นาที
    );

    // 3. ส่งเมลจาก Gmail คุณมอส
    await emailUtil.sendVerificationEmail(inputEmail, otp);

    return { 
        message: "ส่งรหัส OTP ไปที่อีเมลแล้ว", 
        voteToken: voteToken 
    };
};

/**
 * 4. ตรวจสอบ OTP และยืนยันการโหวต
 */
export const verifyAndCastVote = async (data) => {
    const { voteToken, inputOtp, studentId, eventId, candidateNo } = data;

    try {
        // แกะดูว่า OTP ใน Token คืออะไร
        const decoded = jwt.verify(voteToken, process.env.OTP_SECRET);

        if (decoded.otp !== inputOtp || decoded.studentId !== studentId) {
            throw new Error("รหัส OTP ไม่ถูกต้อง");
        }

        // ถ้าถูกต้อง สั่งบันทึกคะแนน (ไปเรียก voting.repository ต่อ)
        // ... โค้ดส่วนบันทึกคะแนน AES_ENCRYPT ...
        
        return { success: true };
    } catch (err) {
        throw new Error("รหัส OTP หมดอายุหรือผิดพลาด");
    }
};
import express from 'express';
import * as studentController from '../controllers/student.controller.js';
import { verifyStudentToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', studentController.register);          // สมัครสมาชิก
router.post('/login', studentController.login);                // เข้าสู่ระบบ (ออก JWT)
router.post('/forgot-password', studentController.forgotPassword); // ลืมรหัสผ่าน: ขอ OTP
router.post('/reset-password', studentController.resetPassword);   // ลืมรหัสผ่าน: ตั้งรหัสใหม่
router.get('/me', verifyStudentToken, studentController.getProfile); // โปรไฟล์ของฉัน (ต้องล็อกอิน)

export default router