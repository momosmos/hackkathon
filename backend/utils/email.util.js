import { sendEmail } from "./emailHelper.js";

/**
 * ส่งอีเมล OTP (ใช้ตัวช่วยกลางจาก emailHelper)
 * - ถ้าตั้งค่า EMAIL_USER/EMAIL_PASS ใน .env => ส่งจริงผ่าน Gmail
 * - ถ้าไม่ได้ตั้งค่า => โหมดสาธิต (log ลง console) ไม่ throw
 */
export const sendOTPEmail = async (email, otpCode) => {
    return await sendEmail(
        email,
        "รหัส OTP ของคุณ",
        `รหัส OTP สำหรับเข้าสู่ระบบคือ: ${otpCode}\nรหัสมีอายุ 3 นาที`
    );
};

// เผื่อโค้ดส่วนอื่นเรียกชื่อนี้ (ลงทะเบียน/ยืนยันอีเมล)
export const sendVerificationEmail = sendOTPEmail;
