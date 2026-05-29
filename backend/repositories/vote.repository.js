import db from "../config/db.js";
import { hashCandidate, buildHashLookup } from "../utils/voteCrypto.js";

/**
 * หย่อนบัตรลงหีบ (Transaction)
 *  - ก. เช็คชื่อว่ามาใช้สิทธิ์แล้ว (voter_participation) — ผูกกับตัวตน เพื่อกันโหวตซ้ำ
 *  - ข. เก็บคะแนนลง vote_record โดย Hash เบอร์ผู้สมัครแบบ one-way — ไม่มี student_id
 *    => แยกขาดระหว่าง "ใครมาใช้สิทธิ์" กับ "โหวตเบอร์อะไร" และอ่านเบอร์กลับไม่ได้
 */
export const castVote = async ({ student_id, event_id, candidate_no, vote_receipt, voter_email }) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // บันทึกการใช้สิทธิ์ + อีเมลที่ใช้ยืนยัน
        // UNIQUE(student_id,event_id) กันโหวตซ้ำต่อบัญชี ; UNIQUE(event_id,voter_email) กัน 1 อีเมลซ้ำ
        await conn.query(
            "INSERT INTO voter_participation (student_id, event_id, voter_email, voted_at) VALUES (?, ?, ?, NOW())",
            [student_id, event_id, voter_email || null]
        );

        await conn.query(
            "INSERT INTO vote_record (event_id, candidate_no, vote_receipt, voted_at) VALUES (?, ?, ?, NOW())",
            [event_id, hashCandidate(candidate_no), vote_receipt]
        );

        await conn.commit();
        return true;
    } catch (error) {
        await conn.rollback();
        if (error && error.code === "ER_DUP_ENTRY") {
            // ระบุชัดว่าซ้ำเพราะบัญชีหรืออีเมล
            const friendly = new Error(
                /voter_email|uq_event_email/i.test(error.message)
                    ? "อีเมลนี้ถูกใช้ยืนยันสิทธิ์ไปแล้ว ไม่สามารถใช้ซ้ำได้"
                    : "คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว ไม่สามารถโหวตซ้ำได้"
            );
            friendly.status = 409;
            throw friendly;
        }
        throw error;
    } finally {
        conn.release();
    }
};

// ตรวจว่าอีเมลนี้ถูกใช้ยืนยันสิทธิ์ในงานนี้ไปแล้วหรือยัง (กัน 1 อีเมล = 1 ครั้ง)
export const isEmailUsed = async (eventId, email) => {
    if (!email) return false;
    const [rows] = await db.query(
        "SELECT 1 FROM voter_participation WHERE event_id = ? AND voter_email = ? LIMIT 1",
        [eventId, email]
    );
    return rows.length > 0;
};

/**
 * นับคะแนนรายเบอร์ (ใช้ตอนสรุปผล)
 *  - ดึงเบอร์ผู้สมัครทั้งหมดของ event มาสร้างตารางเทียบ hash -> เบอร์
 *  - GROUP BY ค่า hash ใน DB แล้วแปลงกลับเป็นเบอร์ที่อ่านได้
 */
export const getVoteCounting = async (eventId) => {
    const [cands] = await db.query(
        "SELECT candidate_no, party_name FROM candidate WHERE event_id = ?",
        [eventId]
    );
    const numbers = cands.map((c) => c.candidate_no);
    const lookup = buildHashLookup(numbers);
    const partyByNo = new Map(cands.map((c) => [String(c.candidate_no), c.party_name]));

    const [rows] = await db.query(
        `SELECT CAST(candidate_no AS CHAR) AS hash_str, COUNT(*) AS total_votes
         FROM vote_record
         WHERE event_id = ?
         GROUP BY candidate_no`,
        [eventId]
    );

    // candidate_no เก็บเป็นสตริง hash (64 ตัวอักษร) ใน VARBINARY — แปลงกลับเป็นข้อความแล้วเทียบ
    const results = [];
    for (const r of rows) {
        const no = lookup.get(r.hash_str);
        if (no !== undefined) {
            results.push({
                candidate_no: no,
                party_name: partyByNo.get(String(no)) || null,
                total_votes: r.total_votes,
            });
        }
    }
    results.sort((a, b) => b.total_votes - a.total_votes);
    return results;
};

/**
 * สถิติผู้มาใช้สิทธิ์ของ event นั้น ๆ
 */
export const getVoterStatistics = async (eventId) => {
    // จำนวนผู้มีสิทธิ์ทั้งหมด: ใช้ค่าคงที่จาก .env (เริ่มต้น 2000 คน) เป็นตัวหารคิด %
    const total = Number(process.env.TOTAL_ELIGIBLE_VOTERS) || 2000;
    const [[votedRow]] = await db.query(
        "SELECT COUNT(*) AS voted FROM voter_participation WHERE event_id = ?",
        [eventId]
    );
    return { total, voted: votedRow.voted };
};
