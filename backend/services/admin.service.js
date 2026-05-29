import * as repository from "../repositories/admin.repository.js";
import * as voteRepo from "../repositories/vote.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

    // 2. ตรวจสอบรหัสผ่านผ่าน bcrypt (รหัสผ่านถูก Hash เก็บไว้ใน DB เสมอ)
    //    เผื่อกรณีข้อมูลเก่าที่ยังเป็น plain text ให้รองรับแบบ fallback ด้วย
    const looksHashed = typeof admin.password === "string" && admin.password.startsWith("$2");
    const isMatch = looksHashed
        ? await bcrypt.compare(password, admin.password)
        : admin.password === password;

    if (!isMatch) {
        return {
            success: false,
            message: "รหัสผ่านไม่ถูกต้อง"
        };
    }

    // 3. ออก JWT (role = admin) สำหรับใช้เรียก API ฝั่งผู้ดูแลระบบ
    const token = jwt.sign(
        { admin_id: admin.admin_id, username: admin.username, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
    );

    // 4. เตรียมข้อมูลส่งกลับ (ตัด password ออกเพื่อความปลอดภัย)
    const { password: _pw, ...adminData } = admin;

    return {
        success: true,
        message: "เข้าสู่ระบบแอดมินสำเร็จ",
        data: { ...adminData, role: "admin" },
        token
    };
};

// ==========================================
// 🎓 2. Logic ระบบจัดการนักเรียน (Student Management)
// ==========================================
export const addStudent = async (studentData) => {
    // 📌 [อัปเดต] Logic การ Hash รหัสผ่าน
    // 1. ถ้าไม่มีการส่งรหัสผ่านมา ให้ใช้ "รหัสนักเรียน" เป็นรหัสผ่านเริ่มต้น
    const plainPassword = studentData.password || studentData.student_id;
    
    // 2. ทำการ Hash รหัสผ่าน
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // 3. เอาข้อมูลรหัสผ่านที่ Hash แล้ว สวมทับข้อมูลเดิม
    const secureStudentData = { 
        ...studentData, 
        password: hashedPassword 
    };

    // 4. ส่งข้อมูลที่ปลอดภัยแล้วไปให้ Repository บันทึก
    return await repository.addStudent(secureStudentData);
};

// [เพิ่มใหม่] ดึงรายชื่อนักเรียนและผู้สมัครทั้งหมด เพื่อส่งให้กล่องมุมซ้ายล่างหน้า Dashboard
export const getAllMembersForAdmin = async () => {
    return await repository.getAllMembersForAdmin();
};

// ลบนักเรียน (คืนค่า true ถ้าลบสำเร็จ)
export const deleteStudent = async (studentId) => {
    return await repository.deleteStudent(studentId);
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

// แก้ไขข้อมูลพรรค
export const updateCandidate = async (candidateId, partyName, policyDetail) => {
    return await repository.updateCandidate(candidateId, partyName, policyDetail);
};

// ลบพรรค
export const deleteCandidate = async (candidateId) => {
    return await repository.deleteCandidate(candidateId);
};

// อัปเดตการตั้งค่างานเลือกตั้ง (ชื่องาน + เวลาปิดหีบ)
export const updateEventSettings = async (eventId, eventName, endDatetime) => {
    return await repository.updateEventSettings(eventId, eventName, endDatetime);
};

// ==========================================
// 📊 5. Logic รายงานผลแดชบอร์ดสถิติ (Analytics)
// ==========================================
export const getDashboardData = async (eventId) => {
    // 1. สถิติผู้มาใช้สิทธิ์ (เช็คชื่อจาก voter_participation เทียบนักเรียนทั้งหมด)
    const stats = await voteRepo.getVoterStatistics(eventId);

    // 2. นับคะแนนรายเบอร์ด้วยการ Hash เบอร์ที่เป็นไปได้มาเทียบ (one-way ไม่ถอดกลับ)
    const voteResults = await voteRepo.getVoteCounting(eventId);

    // 3. มัดรวมส่งกลับให้ Controller
    return {
        total_voters_turnout: stats.voted,
        total_eligible: stats.total,
        turnout_percent: stats.total > 0 ? ((stats.voted / stats.total) * 100).toFixed(2) : "0.00",
        voting_results: voteResults
    };
};