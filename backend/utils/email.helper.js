import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'poonpipat.siri@gmail.com',
        pass: 'password' // แนะนำให้ใช้ Environment Variable
    },
    tls: { rejectUnauthorized: false }
});

export const sendOTPEmail = async (email, otpCode) => {
    const mailOptions = {
        from: '"My Backend API" <poonpipat.siri@gmail.com>',
        to: email,
        subject: 'รหัส OTP ของคุณ',
        html: `<h3>รหัส OTP สำหรับเข้าสู่ระบบคือ: <b>${otpCode}</b></h3><p>รหัสมีอายุ 3 นาที</p>`
    };
    return await transporter.sendMail(mailOptions);
};