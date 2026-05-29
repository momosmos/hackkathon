import db from '../config/db.js';

// ==========================================
// 📝 โซนที่ 1: ระบบลงทะเบียนนักเรียน (5 ช่องเน้นๆ)
// ==========================================

// 1. ลงทะเบียนนักเรียนใหม่ (เด็กกดสมัครเอง ใช้ INSERT)
export const registerStudent = async (data) => {
    // รับข้อมูล 5 ช่อง (ไม่มี confirm_password เพราะ Service จัดการเช็คและทิ้งไปแล้ว)
    const { student_id, student_name, student_class, end_year, password, student_email } = data;

    // เติมช่องที่ Schema บังคับ NOT NULL ให้ครบ:
    // - major / start_year ใช้ค่าเริ่มต้น (ยังไม่เก็บตอนสมัคร)
    // - student_email ใช้อีเมลที่กรอก ถ้าไม่กรอกใช้ placeholder อิงรหัสนักเรียน (กัน UNIQUE ชนกัน)
    //   ผู้ใช้กรอกอีเมลจริงอีกครั้งตอนขอ OTP เพื่อโหวต
    const email = (student_email && student_email.trim()) || `${student_id}@student.local`;

    const [result] = await db.query(
        `INSERT INTO student (
            student_id, student_name, student_class, major, start_year, end_year, password, student_email, student_status
         ) VALUES (?, ?, ?, 'N/A', 0, ?, ?, ?, 'Active')`,
        [student_id, student_name, student_class, end_year, password, email]
    );
    return result.affectedRows > 0;
};

// ==========================================
// 🔑 โซนที่ 2: ระบบยืนยันตัวตนและโปรไฟล์
// ==========================================

// 2. ค้นหานักเรียนด้วย ID (ใช้ดึงข้อมูลมาเทียบรหัสตอนล็อกอิน)
export const findById = async (studentId) => {
    const [rows] = await db.query(
        `SELECT student_id, student_name, student_class, end_year, password, student_email, student_status
         FROM student
         WHERE student_id = ?`,
        [studentId]
    );
    return rows[0];
};

// 2.5 อัปเดตรหัสผ่าน (ใช้ตอนรีเซ็ตรหัสผ่าน — รับค่าที่ Hash แล้ว)
export const updatePassword = async (studentId, hashedPassword) => {
    const [result] = await db.query(
        "UPDATE student SET password = ? WHERE student_id = ?",
        [hashedPassword, studentId]
    );
    return result.affectedRows > 0;
};

// 3. ดึงข้อมูลโปรไฟล์แบบย่อ (สำหรับโชว์มุมซ้ายล่างหน้าจอ)
export const getProfileInfo = async (studentId) => {
    const [rows] = await db.query(
        `SELECT student_id, student_name, student_class, end_year, student_status 
         FROM student WHERE student_id = ?`,
        [studentId]
    );
    return rows[0];
};

// ==========================================
// 🗳️ โซนที่ 3: เช็คสิทธิ์และสถิติ
// ==========================================

// 4. ตรวจสอบสถานะการโหวต (ดักคนเนียนกดโหวตซ้ำ)
export const checkVoteStatus = async (studentId, eventId) => {
    const [rows] = await db.query(
        `SELECT participation_id 
         FROM voter_participation 
         WHERE student_id = ? AND event_id = ?`,
        [studentId, eventId]
    );
    return rows.length > 0; 
};

// 5. นับจำนวนนักเรียนที่มีสิทธิ์ทั้งหมด (เอาไปคำนวณ % คนมาใช้สิทธิ์)
export const countTotalEligibleStudents = async () => {
    const [rows] = await db.query(
        "SELECT COUNT(*) as total FROM student WHERE student_status = 'Active'"
    );
    return rows[0].total;
};

// ==========================================
// 🏠 โซนที่ 4: ข้อมูลหน้า Home นักเรียน (สถานะปัจจุบัน & ประกาศผล)
// ==========================================

// 6. เช็คว่ามีงานเลือกตั้ง "กำลังเปิดโหวต" อยู่หรือไม่? (เพื่อโชว์ปุ่มเข้าคูหา)
export const getCurrentActiveElection = async () => {
    const [rows] = await db.query(
        `SELECT event_id, event_name, academic_year, start_datetime, end_datetime 
         FROM election_event 
         WHERE is_active = 1 
         ORDER BY event_id DESC 
         LIMIT 1`
    );
    return rows[0];
};

// 7. ดึงผลผู้ชนะของงานที่ปิดไปแล้วทั้งหมด 
export const getPastElectionWinners = async () => {
    const [rows] = await db.query(
        `WITH RankedCandidates AS (
            SELECT 
                c.event_id, c.party_name, c.party_image,
                COUNT(v.vote_id) AS total_votes,
                ROW_NUMBER() OVER (PARTITION BY c.event_id ORDER BY COUNT(v.vote_id) DESC) as rank_position
            FROM candidate c
            LEFT JOIN vote_record v 
                ON c.candidate_no = CAST(AES_DECRYPT(v.candidate_no, 'MY_SECRET_KEY_1234') AS CHAR) 
                AND c.event_id = v.event_id
            GROUP BY c.candidate_id
        )
        SELECT 
            e.event_id, e.event_name, e.academic_year, 
            rc.party_name AS winner_party, rc.party_image AS winner_image, rc.total_votes AS winner_votes
        FROM election_event e
        LEFT JOIN RankedCandidates rc ON e.event_id = rc.event_id AND rc.rank_position = 1
        WHERE e.is_active = 0
        ORDER BY e.academic_year DESC`
    );
    return rows; 
};