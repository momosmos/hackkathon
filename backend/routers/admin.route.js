import express from "express"
import * as controller from "../controllers/admin.controller.js"
import { verifyAdminToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

// ==========================================
// 🔑 1. ระบบยืนยันตัวตนแอดมิน (Authentication)
// ==========================================
// POST /api/admin/login ➔ ใช้สำหรับส่ง Username และ Password มาตรวจสอบเพื่อเข้าสู่ระบบ (เปิดสาธารณะ)
router.post("/login", controller.loginAdmin)

// 🔒 ตั้งแต่บรรทัดนี้ลงไป ต้องเป็นแอดมินที่ล็อกอินแล้วเท่านั้น (Role-based Access Control)
router.use(verifyAdminToken)

// ==========================================
// 🎓 2. ระบบจัดการนักเรียน (Student Management)
// ==========================================
// POST /api/admin/students ➔ แอดมินเพิ่มรายชื่อนักเรียนเข้าระบบ
router.post("/students", controller.addStudent)

// GET /api/admin/students ➔ แอดมินดึงรายชื่อทั้งหมด (นักเรียน/ผู้สมัคร)
router.get("/students", controller.getAllMembersForAdmin)

// DELETE /api/admin/students/:student_id ➔ แอดมินลบนักเรียนออกจากระบบ
router.delete("/students/:student_id", controller.deleteStudent)

// ==========================================
// 🗳️ 3. ระบบจัดการงานเลือกตั้ง (Election Management)
// ==========================================
// POST /api/admin/events ➔ ใช้สร้างรอบงานเลือกตั้งใหม่
router.post("/events", controller.createElectionEvent)

// GET /api/admin/events ➔ ใช้ดึงรายชื่อรอบเลือกตั้งทั้งหมดมาโชว์ในตาราง
router.get("/events", controller.getAllElectionEvents)

// PUT /api/admin/events/status ➔ ใช้สำหรับกดสลับสวิตช์ เปิด/ปิด คูหาโหวต
router.put("/events/status", controller.updateElectionStatus)


// ==========================================
// 🚫 4. ระบบควบคุมพรรคผู้สมัคร (Candidate Control)
// ==========================================
// POST /api/admin/candidates ➔ แอดมินกรอกเพิ่มข้อมูลพรรคใหม่เข้าระบบ
router.post("/candidates", controller.adminAddCandidate)

// POST /api/admin/candidates/members ➔ แอดมินเพิ่มรายชื่อลูกทีมเข้าพรรค
router.post("/candidates/members", controller.addCandidateMember)

// PUT /api/admin/candidates/status ➔ แอดมินกดปุ่มตัดสิทธิ์พรรค (Disqualified)
router.put("/candidates/status", controller.updateCandidateStatus)

// PUT /api/admin/candidates/:candidate_id ➔ แก้ไขข้อมูลพรรค (ชื่อ+นโยบาย)
router.put("/candidates/:candidate_id", controller.updateCandidate)

// DELETE /api/admin/candidates/:candidate_id ➔ ลบพรรค
router.delete("/candidates/:candidate_id", controller.deleteCandidate)

// PUT /api/admin/events/settings ➔ ตั้งค่าชื่องาน + เวลาปิดหีบ (นับถอยหลังที่แชร์ทุกผู้ใช้)
router.put("/events/settings", controller.updateElectionSettings)


// ==========================================
// 📊 5. ระบบรายงานผลหน้าแดชบอร์ด (Analytics)
// ==========================================
// GET /api/admin/analytics/:event_id ➔ ดึงสถิติจำนวนคนมาโหวต และผลคะแนนโหวต
router.get("/analytics/:event_id", controller.getDashboardAnalytics)


export default router