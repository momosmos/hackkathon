import db from '../config/db.js';

/**
 * 1. ดึงงานเลือกตั้งที่เปิดอยู่ (Active Event)
 * ใช้เช็คว่าตอนนี้เลือกตั้งได้ไหม และดึง event_id มาใช้งาน
 *
 * ปิดหีบอัตโนมัติ (Auto-close): ก่อนเลือกงานที่เปิดอยู่ จะปิดงานที่ "หมดเวลาแล้ว" ให้อัตโนมัติ
 * (is_active=1 แต่ end_datetime < เวลาปัจจุบัน) -> ตั้ง is_active=0
 *
 * หมายเหตุ: การกดปิดแบบ manual (set is_active=0) ไม่เกี่ยวกับเงื่อนไขเวลานี้
 * จึงปิดได้ "ทันที" เสมอ ไม่ต้องรอถึงเวลาปิดหีบ
 */
export const getActiveEvent = async () => {
    // Auto-close งานที่เลยกำหนดเวลาปิดหีบ
    await db.query(
        'UPDATE election_event SET is_active = 0 WHERE is_active = 1 AND end_datetime < NOW()'
    );
    const [rows] = await db.query(
        'SELECT * FROM election_event WHERE is_active = 1 LIMIT 1'
    );
    return rows[0];
};

/**
 * 2. ดึงรายชื่อผู้สมัครและนโยบาย
 * สำหรับ Frontend แสดงหน้า "ตรวจสอบนโยบายรายชื่อผู้สมัคร"
 */
export const getCandidatesByEvent = async (eventId) => {
    const [rows] = await db.query(
        `SELECT candidate_id, candidate_no, party_name, policy_detail, party_image 
         FROM candidate 
         WHERE event_id = ? AND candidate_status = 'Active'
         ORDER BY candidate_no ASC`,
        [eventId]
    );
    return rows;
};

/**
 * 3. บันทึกคะแนนโหวต (หัวใจของความปลอดภัย)
 * - บันทึกสิทธิ์ลง voter_participation
 * - บันทึกคะแนนแบบเข้ารหัสลง vote_record
 */
export const saveVoteTransaction = async ({ studentId, eventId, candidateNo, receipt }) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // ก. บันทึกว่านักเรียนคนนี้ใช้สิทธิ์แล้ว (ป้องกันโหวตซ้ำ)
        await conn.query(
            'INSERT INTO voter_participation (student_id, event_id, voted_at) VALUES (?, ?, NOW())',
            [studentId, eventId]
        );

        // ข. บันทึกคะแนนโดยเข้ารหัสเบอร์ผู้สมัคร (AES_ENCRYPT) 
        // เพื่อไม่ให้ใครรู้คะแนนจนกว่าจะใช้กุญแจถอดรหัสในตอนปิดหีบ
        await conn.query(
            `INSERT INTO vote_record (event_id, candidate_no, vote_receipt, voted_at) 
             VALUES (?, AES_ENCRYPT(?, ?), ?, NOW())`,
            [eventId, candidateNo.toString(), process.env.VOTE_KEY_2026, receipt]
        );

        await conn.commit();
        return true;
    } catch (error) {
        await conn.rollback();
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * 4. สถิติปัจจุบัน (Real-time Stats)
 * สำหรับ Frontend: "ดูผลสถิติปัจจุบันแค่คนโหวตจากเปอร์เซ็นต์ทั้งหมด"
 */
export const getVoterCount = async (eventId) => {
    const [rows] = await db.query(
        'SELECT COUNT(*) as voted_count FROM voter_participation WHERE event_id = ?',
        [eventId]
    );
    return rows[0].voted_count;
};

/**
 * 5. ดูรายการเลือกตั้งย้อนหลัง
 * สำหรับ Frontend: "ดูผลย้อนหลังการเลือกตั้ง"
 */
export const getElectionHistory = async () => {
    const [rows] = await db.query(
        `SELECT event_id, event_name, academic_year, start_datetime, end_datetime, is_active 
         FROM election_event 
         ORDER BY academic_year DESC`
    );
    return rows;
};

/**
 * 6. ดึงผลการเลือกตั้ง (เมื่อปิดหีบแล้วเท่านั้น)
 * สำหรับ Frontend: "ดูผลหลังปิดหีบ"
 */
export const getFinalResults = async (eventId) => {
    const [rows] = await db.query(
        `SELECT 
            CAST(AES_DECRYPT(candidate_no, ?) AS UNSIGNED) as candidate_no, 
            COUNT(*) as total_votes 
         FROM vote_record 
         WHERE event_id = ? 
         GROUP BY candidate_no 
         ORDER BY total_votes DESC`,
        [process.env.VOTE_KEY_2026, eventId]
    );
    return rows;
};