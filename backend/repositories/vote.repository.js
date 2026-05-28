import db from '../config/db.js';

export const saveVoteTransaction = async (data) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // บันทึกสิทธิ์ (เพิ่มการเก็บ Email ไว้ใน Log การเข้าใช้สิทธิ์ถ้าต้องการ)
        await conn.query(
            `INSERT INTO voter_participation (student_id, event_id, voted_at) 
             VALUES (?, ?, NOW())`,
            [data.student_id, data.event_id]
        );

        // บันทึกคะแนนดิบลงหีบ (ไม่ระบุตัวตน แต่มีเลข Receipt ยืนยัน)
        await conn.query(
            `INSERT INTO vote_record (event_id, vote_receipt, candidate_no, voted_at) 
             VALUES (?, ?, ?, NOW())`,
            [data.event_id, data.vote_receipt, data.candidate_no]
        );

        await conn.commit();
        return true;
    } catch (err) {
        await conn.rollback();
        throw err;
    } finally {
        conn.release();
    }
};