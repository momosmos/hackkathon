import * as otpService from "../services/otp.service.js";

export const handleRequestOTP = async (req, res) => {
    const { email } = req.body;

    // ตรวจสอบความครบถ้วนเบื้องต้น
    if (!email) {
        return res.status(400).json({ error: 'กรุณาระบุอีเมล' });
    }

    try {
        await otpService.requestOTP(email);
        return res.status(200).json({ 
            success: true, 
            message: 'ส่งรหัส OTP ไปยังอีเมลแล้ว' 
        });
    } catch (error) {
        console.error('Error in Controller:', error);
        return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
    }
};