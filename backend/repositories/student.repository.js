import db from '../config/db.js';

/**
 * 1. ค้นหานักเรียนด้วย ID
 * ใช้เช็คว่ารหัส 5 หลักนี้มีในระบบโรงเรียนไหมก่อนจะยอมให้ลงทะเบียน
 */
export const findById = async (studentId) => {
    const [rows] = await db.query(
        `SELECT student_id, password, student_name, student_class, student_status 
         FROM student WHERE student_id = ?`,
        [studentId]
    );
    return rows[0];
};

/**
 * 2. ลงทะเบียนนักเรียน (Register)
 * บันทึก Password (ที่ Hash แล้ว), ชื่อ, ชั้นปี และปีที่จบ (ตามหน้า UI)
 */
export const registerStudent = async (data) => {
    const { 
        student_id, 
        student_name, 
        password,       // ตัวนี้ต้องเป็นตัวที่ผ่าน bcrypt.hash มาแล้วจาก Service
        student_class, 
        graduation_year 
    } = data;

    const [result] = await db.query(
        `UPDATE student 
         SET student_name = ?, 
             password = ?, 
             student_class = ?, 
             graduation_year = ?, 
             student_status = 'Active' 
         WHERE student_id = ?`,
        [student_name, password, student_class, graduation_year, student_id]
    );
    
    return result.affectedRows > 0;
};

/**
 * 3. ตรวจสอบชื่อซ้ำ
 * ป้องกันกรณีรหัสนักเรียนหลุด แล้วมีคนเอาชื่อเพื่อนมาแอบอ้างลงทะเบียน
 */
export const isNameAlreadyRegistered = async (studentName) => {
    const [rows] = await db.query(
        'SELECT student_id FROM student WHERE student_name = ? AND password IS NOT NULL',
        [studentName]
    );
    return rows.length > 0;
};

/**
 * 4. ตรวจสอบสถานะการโหวต
 * ใช้เช็คว่าลงทะเบียนแล้ว โหวตซ้ำได้ไหม
 */
export const hasVoted = async (studentId, eventId) => {
    const [rows] = await db.query(
        'SELECT participation_id FROM voter_participation WHERE student_id = ? AND event_id = ?',
        [studentId, eventId]
    );
    return rows.length > 0;
};

/**
 * 5. รีเซ็ตบัญชี (สำหรับ Admin)
 * กรณีนักเรียนลืมรหัสผ่าน แอดมินสามารถล้าง password ให้กลับไปลงทะเบียนใหม่ได้
 */
export const resetAccount = async (studentId) => {
    const [result] = await db.query(
        'UPDATE student SET password = NULL WHERE student_id = ?',
        [studentId]
    );
    return result.affectedRows > 0;
};