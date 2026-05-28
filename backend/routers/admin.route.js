import express from "express"
import * as controller from "../controllers/admin.controller.js"

const router = express.Router()

// ==========================================
// 🔑 1. ระบบยืนยันตัวตนแอดมิน (Authentication)
// ==========================================
// POST /api/admin/login ➔ ใช้สำหรับส่ง Username และ Password มาตรวจสอบเพื่อเข้าสู่ระบบ
router.post("/login", controller.loginAdmin)

// ==========================================
// 🎓 2. ระบบจัดการนักเรียน (Student Management)
// ==========================================
// POST /api/admin/students ➔ แอดมินเพิ่มรายชื่อนักเรียนเข้าระบบ
router.post("/students", controller.addStudent)

// GET /api/admin/students ➔ [เพิ่มใหม่] แอดมินดึงรายชื่อทั้งหมด (นักเรียน/ผู้สมัคร) ไปโชว์กล่องซ้ายล่าง
router.get("/students", controller.getAllMembersForAdmin)

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


// ==========================================
// 📊 5. ระบบรายงานผลหน้าแดชบอร์ด (Analytics)
// ==========================================
// GET /api/admin/analytics/:event_id ➔ ดึงสถิติจำนวนคนมาโหวต และผลคะแนนโหวต
router.get("/analytics/:event_id", controller.getDashboardAnalytics)


export default router