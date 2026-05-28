import * as service from "../services/admin.service.js";

// ==========================================
// 🔑 1. ระบบยืนยันตัวตนแอดมิน (Authentication)
// ==========================================

// หน้าเข้าสู่ระบบ (ปรับมารับ username เพื่อรองรับรหัสที่มีเลข 0 นำหน้า)
export const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body; 
        
        const result = await service.loginAdmin(username, password);
        
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }

        // ส่งข้อมูลแอดมินกลับไปแปะโชว์บนหน้าเว็บ
        return res.status(200).json(result.data);
    } catch (err) {
        return res.status(500).json({ message: "ADMIN LOGIN ERROR", error: err.message });
    }
};

// ==========================================
// 🎓 2. ระบบจัดการนักเรียน (Student Management) 
// ==========================================

// แอดมินเพิ่มรายชื่อนักเรียนเข้าระบบ 
export const addStudent = async (req, res) => {
    try {
        // 🚨 [เพิ่มใหม่] รับค่า password มาด้วย เผื่อแอดมินตั้งรหัสให้เด็กจากหน้าเว็บ
        const { student_id, student_name, student_class, student_email, student_status, password } = req.body;
        
        const result = await service.addStudent({
            student_id, student_name, student_class, student_email, student_status, password
        });

        return res.status(201).json({ message: "STUDENT ADDED SUCCESS", data: result });
    } catch (err) {
        return res.status(500).json({ message: "ADD STUDENT ERROR", error: err.message });
    }
};

// ==========================================
// 🗳️ 3. ระบบจัดการงานเลือกตั้ง (Election Management)
// ==========================================

// สร้างรอบงานเลือกตั้งใหม่
export const createElectionEvent = async (req, res) => {
    try {
        const { event_name, academic_year, start_datetime, end_datetime, admin_id } = req.body;
        
        const result = await service.createElectionEvent({
            event_name, academic_year, start_datetime, end_datetime, admin_id
        });

        return res.status(201).json({ message: "ELECTION EVENT CREATED", data: result });
    } catch (err) {
        return res.status(500).json({ message: "CREATE EVENT ERROR", error: err.message });
    }
};

// ดึงรายชื่อรอบเลือกตั้งทั้งหมดมาโชว์ในตารางประวัติหน้าบ้าน
export const getAllElectionEvents = async (req, res) => {
    try {
        const events = await service.getAllElectionEvents();
        return res.status(200).json(events);
    } catch (err) {
        return res.status(500).json({ message: "FETCH EVENTS ERROR", error: err.message });
    }
};

// สลับสถานะเปิด/ปิดคูหาโหวต (ปุ่ม On-Off สวิตช์หน้าเว็บ)
export const updateElectionStatus = async (req, res) => {
    try {
        const { event_id, is_active } = req.body; // รับค่า 1 (เปิด) หรือ 0 (ปิด)
        
        await service.updateElectionStatus(event_id, is_active);
        return res.status(200).json({ message: `ELECTION STATUS UPDATED TO ${is_active}` });
    } catch (err) {
        return res.status(500).json({ message: "UPDATE STATUS ERROR", error: err.message });
    }
};

// ==========================================
// 🚫 4. ระบบควบคุมพรรคผู้สมัคร (Candidate Control)
// ==========================================

// แอดมินกรอกเพิ่มพรรคผู้สมัครใหม่เข้าระบบ
export const adminAddCandidate = async (req, res) => {
    try {
        const { candidate_no, event_id, party_name, policy_detail, party_image } = req.body;
        
        const result = await service.adminAddCandidate({
            candidate_no, event_id, party_name, policy_detail, party_image
        });

        return res.status(201).json({ message: "CANDIDATE ADDED SUCCESS", data: result });
    } catch (err) {
        return res.status(500).json({ message: "ADD CANDIDATE ERROR", error: err.message });
    }
};

// แอดมินเพิ่มรายชื่อลูกทีมเข้าพรรค
export const addCandidateMember = async (req, res) => {
    try {
        const { candidate_id, student_id, member_role } = req.body;
        
        const result = await service.addCandidateMember({ candidate_id, student_id, member_role });
        
        return res.status(201).json({ message: "MEMBER ADDED TO CANDIDATE", data: result });
    } catch (err) {
        return res.status(500).json({ message: "ADD MEMBER ERROR", error: err.message });
    }
};

// แอดมินกดปุ่มตัดสิทธิ์พรรคผู้สมัคร (เปลี่ยนสถานะเป็น Disqualified)
export const updateCandidateStatus = async (req, res) => {
    try {
        const { candidate_id, status } = req.body; // status ส่งมาเป็น 'Active' หรือ 'Disqualified'
        
        await service.updateCandidateStatus(candidate_id, status);
        return res.status(200).json({ message: `CANDIDATE STATUS UPDATED TO ${status}` });
    } catch (err) {
        return res.status(500).json({ message: "UPDATE CANDIDATE STATUS ERROR", error: err.message });
    }
};

// ==========================================
// 📊 5. ระบบรายงานผลหน้าแดชบอร์ด (Analytics)
// ==========================================

// ดึงข้อมูลสถิติรวมฝั่งแอดมิน
export const getDashboardAnalytics = async (req, res) => {
    try {
        const { event_id } = req.params; 
        
        // ส่ง event_id ไปให้ Service (ระบบจะทำการไขกุญแจ Decrypt ให้เองหลังบ้านแบบอัตโนมัติ)
        const analyticsData = await service.getDashboardData(event_id);
        
        return res.status(200).json(analyticsData);
    } catch (err) {
        return res.status(500).json({ message: "FETCH DASHBOARD ANALYTICS ERROR", error: err.message });
    }
}; 

// ดึงรายชื่อนักเรียนและผู้สมัครทั้งหมด (เอาไปโชว์มุมซ้ายล่างหน้า Dashboard)
export const getAllMembersForAdmin = async (req, res) => {
    try {
        const members = await service.getAllMembersForAdmin();
        return res.status(200).json(members);
    } catch (err) {
        return res.status(500).json({ message: "FETCH ALL MEMBERS ERROR", error: err.message });
    }
};