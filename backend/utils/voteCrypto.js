import crypto from "crypto";

/**
 * Hash เบอร์ผู้สมัครแบบ one-way (SHA-256 + salt ลับจาก .env)
 * - ใช้ตอน "หย่อนบัตร" เพื่อเก็บคะแนนลง DB ในรูปแบบที่อ่านกลับไม่ได้
 * - ใช้ตอน "นับคะแนน" โดย hash เบอร์ที่เป็นไปได้ (1..N) แล้วจับคู่กับค่าใน DB
 *
 * เหตุผล: ข้อมูลในตาราง vote_record จะอ่านไม่ออกว่าโหวตเบอร์ใด และถอดกลับไม่ได้
 * (ต่างจาก AES ที่ถอดกลับได้) — เป็นความลับของบัตรเลือกตั้งอย่างแท้จริง
 */
const SALT = process.env.VOTE_HASH_SALT || "default_dev_salt_change_me";

export function hashCandidate(candidateNo) {
    return crypto
        .createHash("sha256")
        .update(`${candidateNo}:${SALT}`)
        .digest("hex");
}

/**
 * สร้างตารางเทียบ hash -> เบอร์ สำหรับเบอร์ที่เป็นไปได้ทั้งหมด
 * ใช้ตอนนับคะแนนเพื่อแปลงค่า hash ใน DB กลับเป็นเบอร์ที่อ่านได้ (เฉพาะตอนสรุปผล)
 */
export function buildHashLookup(candidateNumbers) {
    const map = new Map();
    for (const no of candidateNumbers) {
        map.set(hashCandidate(no), no);
    }
    return map;
}
