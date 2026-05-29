import * as studentService from '../services/student.service.js';

/**
 * 1. คอนโทรลเลอร์สำหรับการลงทะเบียน (Register)
 * POST /api/students/register
 */
export const register = async (req, res, next) => {
    try {
        // 🚨 ปรับมารับ 5 ช่องหลัก + ยืนยันรหัสผ่าน ตามที่เราตกลงกันไว้
        const { student_id, student_name, student_class, end_year, password, confirm_password } = req.body;

        // Validation เบื้องต้น
        if (!student_id || !student_name || !password || !confirm_password) {
            return res.status(400).json({ status: "error", message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" });
        }

        // ส่งข้อมูลไปให้ Service ทำงาน
        const result = await studentService.register({
            student_id,
            student_name,
            student_class,
            end_year,
            password,
            confirm_password
        });

        // เช็คผลลัพธ์จาก Service
        if (!result.success) {
            return res.status(400).json({ status: "error", message: result.message });
        }

        res.status(201).json({
            status: "success",
            message: result.message
        });
    } catch (error) {
        next(error); // ส่ง Error ไปให้ Global Error Handler จัดการ
    }
};

/**
 * 2. คอนโทรลเลอร์สำหรับการเข้าสู่ระบบ (Login)
 * POST /api/students/login
 */
export const login = async (req, res, next) => {
    try {
        const { student_id, password } = req.body;

        if (!student_id || !password) {
            return res.status(400).json({ status: "error", message: "กรุณากรอกรหัสนักเรียนและรหัสผ่าน" });
        }

        const result = await studentService.login(student_id, password);

        // ถ้ารหัสผิด หรือไม่มีสิทธิ์เข้าใช้งาน
        if (!result.success) {
            return res.status(401).json({ status: "error", message: result.message });
        }

        res.status(200).json({
            status: "success",
            message: result.message,
            data: {
                student: result.data,
                token: result.token // Frontend จะต้องเก็บ Token นี้ไว้ใน LocalStorage หรือ Session
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 3. คอนโทรลเลอร์สำหรับดูโปรไฟล์ (Get Profile)
 * GET /api/students/profile
 */
export const getProfile = async (req, res, next) => {
    try {
        // student_id ตัวนี้ได้มาจาก Auth Middleware ที่เพื่อนคุณมอสน่าจะเขียนดักไว้
        const studentId = req.student_id; 
        
        const result = await studentService.getProfile(studentId);
        
        if (!result.success) {
            return res.status(404).json({ status: "error", message: result.message });
        }

        res.status(200).json({
            status: "success",
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 4. [เพิ่มใหม่] คอนโทรลเลอร์สำหรับหน้า Home
 * GET /api/students/home
 */
export const getHomePageData = async (req, res, next) => {
    try {
        const result = await studentService.getHomeData();

        res.status(200).json({
            status: "success",
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 5. ลืมรหัสผ่าน — ขอ OTP
 * POST /api/students/forgot-password  { student_id, email }
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { student_id, email } = req.body || {};
        if (!student_id || !email) {
            return res.status(400).json({ status: "error", message: "กรุณากรอกรหัสนักเรียนและอีเมล" });
        }
        const result = await studentService.requestPasswordReset(student_id, email);
        if (!result.success) {
            return res.status(400).json({ status: "error", message: result.message });
        }
        res.status(200).json({
            status: "success",
            message: "ส่งรหัส OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลแล้ว",
            resetToken: result.resetToken,
            email: result.email,
        });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
};

/**
 * 6. ลืมรหัสผ่าน — ยืนยัน OTP + ตั้งรหัสใหม่
 * POST /api/students/reset-password  { resetToken, otp, new_password }
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, otp, new_password } = req.body || {};
        if (!resetToken || !otp || !new_password) {
            return res.status(400).json({ status: "error", message: "ข้อมูลไม่ครบถ้วน" });
        }
        const result = await studentService.resetPassword(resetToken, otp, new_password);
        if (!result.success) {
            return res.status(400).json({ status: "error", message: result.message });
        }
        res.status(200).json({ status: "success", message: result.message });
    } catch (error) {
        res.status(error.status || 500).json({ status: "error", message: error.message });
    }
};