/**
 * เก็บ OTP ชั่วคราวในหน่วยความจำ (สำหรับช่องทาง OTP ทั่วไป /request-otp)
 * หมายเหตุ: การโหวตจริงใช้ OTP แบบ stateless (เก็บใน voteToken) ใน election.service
 * ที่นี่ไว้รองรับ endpoint OTP ทั่วไปไม่ให้ระบบพังตอน import
 */
const store = new Map(); // email -> { otpCode, expiresAt }

export const saveOTP = (email, otpCode, expiresAt) => {
    store.set(email, { otpCode, expiresAt });
};

export const getOTP = (email) => {
    const rec = store.get(email);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) {
        store.delete(email);
        return null;
    }
    return rec;
};

export const deleteOTP = (email) => {
    store.delete(email);
};
