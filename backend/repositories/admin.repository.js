import dbconnect1 from '../config/db.js';

// ==========================================
// 🔑 โซนที่ 1: ระบบยืนยันตัวตน (Authentication)
// ==========================================

// 1. ค้นหาแอดมินด้วย Username 
// (เพื่อรองรับรหัสประจำตัวแอดมินที่มีเลข 0 นำหน้า เช่น '02485')
export const getAdminByUsername = async (username) => {
    const [rows] = await dbconnect1.query(
        'SELECT * FROM admin WHERE username = ?', 
        [username]
    );
    return rows[0]; 
};


// ==========================================
// 🎓 โซนที่ 1.5: จัดการนักเรียน (Student Management)
// ==========================================

// 2.5 แอดมินลบนักเรียนออกจากระบบ (FK ON DELETE CASCADE จะลบข้อมูลที่เกี่ยวข้องให้เอง)
export const deleteStudent = async (studentId) => {
    const [result] = await dbconnect1.query(
        'DELETE FROM student WHERE student_id = ?',
        [studentId]
    );
    return result.affectedRows > 0;
};

// 2. แอดมินเพิ่มรายชื่อนักเรียน
export const addStudent = async (studentData) => {
    // 🚨 [อัปเดต] รับ password (ที่ถูกแฮชมาจาก Service) เข้ามาด้วย
    const { student_id, student_name, student_class, student_email, student_status, password } = studentData;

    // Backend สร้างข้อมูลจำลอง (Dummy) เติมช่องที่เหลือให้เต็ม เพื่อไม่ให้ SQL เตะออก
    const dummyMajor = "N/A";
    const dummyStartYear = 0;
    const dummyEndYear = 0;

    // สั่ง INSERT ลง Database แบบเต็มยศ (ใช้ password ของจริง)
    const [result] = await dbconnect1.query(
        `INSERT INTO student (student_id, student_name, student_class, major, start_year, end_year, password, student_email, student_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, student_name, student_class, dummyMajor, dummyStartYear, dummyEndYear, password, student_email, student_status]
    );
    return result;
};


// ==========================================
// 🗳️ โซนที่ 2: จัดการงานเลือกตั้ง (Election Event Management)
// ==========================================

// 3. สร้างงานเลือกตั้งใหม่
export const createElectionEvent = async (eventName, academicYear, startDatetime, endDatetime, adminId) => {
    const [result] = await dbconnect1.query(
        `INSERT INTO election_event (event_name, academic_year, start_datetime, end_datetime, is_active, admin_id) 
         VALUES (?, ?, ?, ?, 0, ?)`, 
        [eventName, academicYear, startDatetime, endDatetime, adminId]
    );
    return result;
};

// 4. ดึงข้อมูลงานเลือกตั้งทั้งหมด (เอาไปโชว์ในตารางประวัติบนหน้าจอแอดมิน)
export const getAllElectionEvents = async () => {
    const [rows] = await dbconnect1.query(
        'SELECT * FROM election_event ORDER BY academic_year DESC, event_id DESC'
    );
    return rows;
};

// 5. ดึงข้อมูลงานเลือกตั้งเฉพาะเจาะจง 1 งาน
export const getElectionEventById = async (eventId) => {
    const [rows] = await dbconnect1.query(
        'SELECT * FROM election_event WHERE event_id = ?', 
        [eventId]
    );
    return rows[0];
};

// 6. แก้ไขข้อมูลงานเลือกตั้ง (แก้ไขชื่องาน หรือขยายเวลาเปิด-ปิดหีบ เผื่อกรณีฉุกเฉิน)
export const updateElectionEvent = async (eventId, eventName, academicYear, startDatetime, endDatetime) => {
    const [result] = await dbconnect1.query(
        `UPDATE election_event 
         SET event_name = ?, academic_year = ?, start_datetime = ?, end_datetime = ? 
         WHERE event_id = ?`,
        [eventName, academicYear, startDatetime, endDatetime, eventId]
    );
    return result;
};

// 7. ปุ่มสลับสถานะ เปิด/ปิดโหวต (ใช้ควบคุมปุ่มเข้าคูหาบนหน้าแรกแบบเรียลไทม์)
export const updateElectionStatus = async (eventId, isActive) => {
    const [result] = await dbconnect1.query(
        'UPDATE election_event SET is_active = ? WHERE event_id = ?',
        [isActive, eventId]
    );
    return result;
};


// ==========================================
// 🚫 โซนที่ 3: ควบคุมผู้สมัคร (Candidate Control โดยแอดมิน)
// ==========================================

// 8. แอดมินเพิ่มพรรคผู้สมัครเข้าสู่งานเลือกตั้ง
export const adminAddCandidate = async (candidateNo, eventId, partyName, policyDetail, partyImage) => {
    const [result] = await dbconnect1.query(
        `INSERT INTO candidate (candidate_no, event_id, party_name, policy_detail, party_image, candidate_status) 
         VALUES (?, ?, ?, ?, ?, 'Active')`,
        [candidateNo, eventId, partyName, policyDetail, partyImage]
    );
    return result;
};

// 9. แอดมินเพิ่มรายชื่อลูกทีมเข้าพรรค
export const addCandidateMember = async (candidateId, studentId, memberRole) => {
    const [result] = await dbconnect1.query(
        `INSERT INTO candidate_member (candidate_id, student_id, member_role) 
         VALUES (?, ?, ?)`,
        [candidateId, studentId, memberRole]
    );
    return result;
};

// 10. สั่งปรับแพ้ หรือตัดสิทธิ์พรรคผู้สมัคร (เปลี่ยนสถานะเป็น Disqualified)
export const updateCandidateStatus = async (candidateId, status) => {
    const [result] = await dbconnect1.query(
        'UPDATE candidate SET candidate_status = ? WHERE candidate_id = ?',
        [status, candidateId]
    );
    return result;
};

// 10.5 แก้ไขข้อมูลพรรค (ชื่อพรรค + นโยบาย)
export const updateCandidate = async (candidateId, partyName, policyDetail) => {
    const [result] = await dbconnect1.query(
        'UPDATE candidate SET party_name = ?, policy_detail = ? WHERE candidate_id = ?',
        [partyName, policyDetail, candidateId]
    );
    return result.affectedRows > 0;
};

// 10.6 ลบพรรคผู้สมัคร (FK ON DELETE CASCADE จะลบลูกทีมในพรรคให้เอง)
export const deleteCandidate = async (candidateId) => {
    const [result] = await dbconnect1.query(
        'DELETE FROM candidate WHERE candidate_id = ?',
        [candidateId]
    );
    return result.affectedRows > 0;
};

// 10.7 อัปเดตงานเลือกตั้ง (ชื่องาน + เวลาปิดหีบ) สำหรับนับถอยหลังที่แชร์ทุกผู้ใช้
export const updateEventSettings = async (eventId, eventName, endDatetime) => {
    const [result] = await dbconnect1.query(
        'UPDATE election_event SET event_name = ?, end_datetime = ? WHERE event_id = ?',
        [eventName, endDatetime, eventId]
    );
    return result.affectedRows > 0;
};


// ==========================================
// 📊 โซนที่ 4: สรุปผลคะแนนหน้า Dashboard (Analytics & Results)
// ==========================================

// 11. นับจำนวนผู้มาใช้สิทธิ์โหวต ณ ปัจจุบัน (เอาไปคำนวณ % คนมาใช้สิทธิ์หน้าบ้าน)
export const getVoterTurnoutCount = async (eventId) => {
    const [rows] = await dbconnect1.query(
        'SELECT COUNT(*) AS total_voters FROM voter_participation WHERE event_id = ?',
        [eventId]
    );
    return rows[0].total_voters;
};

// 12. 🚨🚨🚨 ฟังก์ชันนับคะแนนโหวต (เวอร์ชัน ENCRYPT ถอดรหัสขั้นสูง!) 🚨🚨🚨
// คำเตือน: 'MY_SECRET_KEY_1234' ต้องตรงกับตอนหย่อนบัตรโหวตในฝั่งของเด็กเป๊ะๆ!
export const getSecureVoteCount = async (eventId) => {
    const [rows] = await dbconnect1.query(
        `SELECT 
            CAST(AES_DECRYPT(candidate_no, 'MY_SECRET_KEY_1234') AS CHAR) AS candidate_number, 
            COUNT(*) AS total_votes
         FROM vote_record
         WHERE event_id = ?
         GROUP BY candidate_number
         ORDER BY total_votes DESC`,
        [eventId]
    );
    
    // ตรวจสอบความปลอดภัย: ถ้าถอดรหัสไม่ได้ (กุญแจผิด) ค่าที่ได้จะเป็น null เราต้องกรองออก
    const validResults = rows.filter(row => row.candidate_number !== null);
    
    return validResults; 
};

// ==========================================
// 🎓 โซนที่ 1.5: จัดการนักเรียน (Student Management - ต่อ)
// ==========================================

// 13. ดึงรายชื่อนักเรียน/ผู้สมัคร ทั้งหมด สำหรับหน้า Dashboard แอดมิน
export const getAllMembersForAdmin = async () => {
    const [rows] = await dbconnect1.query(
        `SELECT s.student_id, s.student_name, s.student_class,
                (CASE WHEN c.candidate_id IS NOT NULL THEN 'ผู้สมัคร' ELSE 'นักเรียน' END) as member_type
         FROM student s
         LEFT JOIN candidate_member cm ON s.student_id = cm.student_id
         LEFT JOIN candidate c ON cm.candidate_id = c.candidate_id
         ORDER BY member_type DESC, s.student_id ASC`
    );
    return rows;
};