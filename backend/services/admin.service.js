import * as repository from "../repositories/admin.repository.js";

// ==========================================
// 🔑 1. Logic ระบบยืนยันตัวตนแอดมิน (Authentication)
// ==========================================
export const loginAdmin = async (username, password) => {
    // [อัปเดต] ดึงข้อมูลแอดมินจากฐานข้อมูลผ่าน Username เพื่อรองรับรหัสที่มีเลข 0 นำหน้า
    const admin = await repository.getAdminByUsername(username);

    // 1. ถ้าไม่เจอแอดมินคนนี้ในระบบ
    if (!admin) {
        return { 
            success: false, 
            message: "ไม่พบบัญชีผู้ดูแลระบบนี้ในระบบ" 
        };
    }

    // 2. ตรวจสอบรหัสผ่าน
    if (admin.password !== password) {
        return { 
            success: false, 
            message: "รหัสผ่านไม่ถูกต้อง" 
        };
    }

    // 3. เตรียมข้อมูลส่งกลับหน้าบ้าน (ลบ password ออกเพื่อความปลอดภัย ไม่ให้หลุดไปที่ Frontend)
    const { password: _, ...adminData } = admin;
    
    return { 
        success: true, 
        message: "เข้าสู่ระบบแอดมินสำเร็จ",
        data: adminData 
    };
};

// ==========================================
// ==========================================
// 🎓 2. Logic ระบบจัดการนักเรียน (Student Management) - [เพิ่มใหม่]
// ==========================================
export const addStudent = async (studentData) => {
    return await repository.addStudent(studentData);
};

// [เพิ่มใหม่] ดึงรายชื่อนักเรียนและผู้สมัครทั้งหมด เพื่อส่งให้กล่องมุมซ้ายล่างหน้า Dashboard
export const getAllMembersForAdmin = async () => {
    return await repository.getAllMembersForAdmin();
};

// ==========================================
// 🗳️ 3. Logic ระบบจัดการงานเลือกตั้ง (Election Management)
// ==========================================

// สร้างรอบงานเลือกตั้งใหม่
export const createElectionEvent = async (eventData) => {
    const { event_name, academic_year, start_datetime, end_datetime, admin_id } = eventData;
    return await repository.createElectionEvent(event_name, academic_year, start_datetime, end_datetime, admin_id);
};

// ดึงรายชื่อรอบเลือกตั้งทั้งหมด
export const getAllElectionEvents = async () => {
    const events = await repository.getAllElectionEvents();
    return events;
};

// สลับสถานะเปิด/ปิดคูหาโหวต
export const updateElectionStatus = async (eventId, isActive) => {
    return await repository.updateElectionStatus(eventId, isActive);
};

// ==========================================
// 🚫 4. Logic ระบบควบคุมพรรคผู้สมัคร (Candidate Control)
// ==========================================

// เพิ่มพรรคผู้สมัครใหม่เข้าระบบ
export const adminAddCandidate = async (candidateData) => {
    const { candidate_no, event_id, party_name, policy_detail, party_image } = candidateData;
    return await repository.adminAddCandidate(candidate_no, event_id, party_name, policy_detail, party_image);
};

// [เพิ่มใหม่] เพิ่มรายชื่อลูกทีมเข้าพรรค
export const addCandidateMember = async (memberData) => {
    const { candidate_id, student_id, member_role } = memberData;
    return await repository.addCandidateMember(candidate_id, student_id, member_role);
};

// ปรับแพ้ หรือตัดสิทธิ์พรรคผู้สมัคร (Active / Disqualified)
export const updateCandidateStatus = async (candidateId, status) => {
    return await repository.updateCandidateStatus(candidateId, status);
};

// ==========================================
// 📊 5. Logic รายงานผลแดชบอร์ดสถิติ (Analytics)
// ==========================================
export const getDashboardData = async (eventId) => {
    // 1. ไปดึงยอดรวมจำนวนนักเรียนที่มาเช็คชื่อใช้สิทธิ์
    const turnoutCount = await repository.getVoterTurnoutCount(eventId);

    // 2. 🚨 ไปดึงผลคะแนนโหวต (เวอร์ชันนี้ Repository จะทำการไขกุญแจ AES_DECRYPT ให้อัตโนมัติแล้ว)
    const voteResults = await repository.getSecureVoteCount(eventId);

    // 3. มัดรวมเป็นก้อนข้อมูลก้อนเดียว (Object) เพื่อส่งกลับไปให้ Controller
    return {
        total_voters_turnout: turnoutCount,
        voting_results: voteResults
    };
};