import nodemailer from "nodemailer";

/**
 * ตัวช่วยส่งอีเมลกลาง (ใช้ทั้งระบบ)
 * - ถ้าตั้งค่า EMAIL_USER / EMAIL_PASS ใน .env => ส่งผ่าน Gmail จริง
 * - ถ้าไม่ได้ตั้งค่า => โหมดสาธิต: ไม่ส่งจริง แต่ log ลง console และคืน {sent:false}
 *   เพื่อให้ flow ทำงานได้แม้ยังไม่มีบัญชีอีเมล (หน้าบ้านจะโชว์ OTP ให้แทน)
 */
let transporter = null;

export function isEmailConfigured() {
    return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

function getTransporter() {
    if (!isEmailConfigured()) return null;
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });
    }
    return transporter;
}

/**
 * ส่งอีเมลจริงผ่าน Gmail (โหมดสาธิตถูกถอดออกแล้ว)
 * - ถ้ายังไม่ได้ตั้งค่า EMAIL_USER/EMAIL_PASS ใน .env จะโยน error ชัดเจน
 * @returns {Promise<{sent: boolean}>}
 */
export async function sendEmail(to, subject, body) {
    const t = getTransporter();
    if (!t) {
        const err = new Error(
            "ระบบยังไม่ได้ตั้งค่าอีเมลผู้ส่ง (EMAIL_USER/EMAIL_PASS ใน .env) จึงไม่สามารถส่ง OTP ได้"
        );
        err.status = 503;
        throw err;
    }
    await t.sendMail({
        from: `"ระบบเลือกตั้งสภานักเรียน" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html: typeof body === "string" ? body.replace(/\n/g, "<br>") : body,
    });
    return { sent: true };
}
