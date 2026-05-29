/**
 * Rate limiter อย่างง่าย (เก็บในหน่วยความจำ) สำหรับกันการกดขอ OTP ถี่เกินไป
 * จำกัด: ต่อ 1 คน (อิงจาก student_id ถ้ามี ไม่งั้นใช้ IP) ขอได้ไม่เกิน MAX ครั้ง ใน WINDOW มิลลิวินาที
 */
const WINDOW_MS = 5 * 60 * 1000; // 5 นาที
const MAX_REQUESTS = 3;

const hits = new Map(); // key -> [timestamps]

export const otpLimiter = (req, res, next) => {
    const key = req.student_id || req.ip || "anonymous";
    const now = Date.now();

    const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);

    if (recent.length >= MAX_REQUESTS) {
        const retryMs = WINDOW_MS - (now - recent[0]);
        const retrySec = Math.ceil(retryMs / 1000);
        return res.status(429).json({
            status: "error",
            message: `ขอรหัส OTP ถี่เกินไป กรุณารออีก ${retrySec} วินาทีแล้วลองใหม่`,
        });
    }

    recent.push(now);
    hits.set(key, recent);
    next();
};
