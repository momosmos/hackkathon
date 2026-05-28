import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // 📌 ขอบคุณระบบสร้างบัตรผ่านจากเพื่อนคุณมอส!
import * as studentRepo from '../repositories/student.repository.js';

// ==========================================
// 📝 1. ระบบลงทะเบียน (Register) แบบ 5 ช่อง
// ==========================================
export const register = async (registerData) => {
    // รับข้อมูล 5 ช่อง + confirm_password จากหน้าเว็บ
    const { student_id, student_name, student_class, end_year, password, confirm_password } = registerData;

    // ก. ตรวจสอบรหัสผ่านและการยืนยันรหัสผ่าน
    if (password !== confirm_password) {
        return { success: false, message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" };
    }

    // ข. ตรวจสอบว่าเคยสมัครไปแล้วหรือยัง (เช็คจาก ID)
    const existingStudent = await studentRepo.findById(student_id);
    if (existingStudent) {
        return { success: false, message: "รหัสนักเรียนนี้ถูกลงทะเบียนไปแล้ว" };
    }

    // ค. HASH รหัสผ่านก่อนบันทึก
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ง. บันทึกข้อมูลผ่าน Repository (ส่งไปแค่ 5 ช่องที่จำเป็น)
    const isSuccess = await studentRepo.registerStudent({
        student_id, 
        student_name, 
        student_class, 
        end_year, 
        password: hashedPassword
    });

    if (!isSuccess) return { success: false, message: "ลงทะเบียนไม่สำเร็จ เกิดข้อผิดพลาดในระบบ" };
    return { success: true, message: "ลงทะเบียนสำเร็จ สามารถเข้าสู่ระบบได้เลย!" };
};

// ==========================================
// 🔑 2. ระบบเข้าสู่ระบบ (Login) + สร้าง JWT
// ==========================================
export const login = async (studentId, password) => {
    // ก. ค้นหานักเรียนในระบบ
    const student = await studentRepo.findById(studentId);
    if (!student) {
        return { success: false, message: "ไม่พบรหัสนักเรียนนี้ในระบบ" };
    }

    // ข. ตรวจสอบสถานะบัญชี
    if (student.student_status !== 'Active') {
        return { success: false, message: "บัญชีของคุณไม่มีสิทธิ์ใช้งานในขณะนี้" };
    }

    // ค. เปรียบเทียบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
        return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
    }

    // ง. สร้าง JWT Token (บัตรผ่าน)
    // 💡 ใส่ fallback 'MY_SECRET_KEY' ไว้เผื่อลืมตั้งค่าในไฟล์ .env ระบบจะได้ไม่พัง
    const token = jwt.sign(
        { 
            student_id: student.student_id, 
            role: 'student' 
        }, 
        process.env.JWT_SECRET || 'MY_DEFAULT_SECRET_KEY', 
        { expiresIn: '8h' } // อายุ Token 8 ชั่วโมง
    );

    // จ. ส่งคืนข้อมูลนักเรียน (ลบรหัสผ่านทิ้งก่อนส่ง) และแนบ Token ไปด้วย
    const { password: _, ...studentData } = student;
    
    return { 
        success: true, 
        message: "เข้าสู่ระบบสำเร็จ", 
        data: studentData, 
        token: token 
    };
};

// ==========================================
// 👤 3. ดึงข้อมูลโปรไฟล์ (Get Profile)
// ==========================================
export const getProfile = async (studentId) => {
    const student = await studentRepo.getProfileInfo(studentId);
    if (!student) return { success: false, message: "ไม่พบข้อมูลนักเรียน" };
    
    return { success: true, data: student };
};

// ==========================================
// 🏠 4. ข้อมูลสำหรับหน้า Home (เพิ่มเข้ามาให้ครบตาม Flow ของเรา)
// ==========================================
export const getHomeData = async () => {
    // เช็คคูหาปัจจุบัน และดึงผลปีเก่าๆ ส่งไปให้หน้า Home
    const activeElection = await studentRepo.getCurrentActiveElection();
    const pastWinners = await studentRepo.getPastElectionWinners();

    return {
        success: true,
        data: {
            active_election: activeElection || null, 
            past_winners: pastWinners
        }
    };
};