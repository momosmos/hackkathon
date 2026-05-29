import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import studentRoutes from "./routers/student.route.js";
import adminRoutes from "./routers/admin.route.js"; // Route ของ Admin
import voteRoutes from "./routers/vote.route.js"; // Route ของการโหวต/เลือกตั้ง
import aiRoutes from "./routers/ai.route.js"; // Route ของ AI (Gemini)
import otpRoutes from "./routers/otp.routes.js"; // Route ของ OTP ทั่วไป

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ===== API ของระบบ =====
app.use("/api/students", studentRoutes); // สมัคร/ล็อกอิน/โปรไฟล์นักเรียน
app.use("/api/admin", adminRoutes); // ผู้ดูแลระบบ (ต้องมี JWT role=admin)
app.use("/api/votes", voteRoutes); // ภาพรวม/ขอ OTP/ลงคะแนน/ผลการเลือกตั้ง
app.use("/api/ai", aiRoutes); // ถาม AI (Gemini)
app.use("/api", otpRoutes); // OTP ทั่วไป: POST /api/request-otp

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Good Health" });
});

// ===== เสิร์ฟไฟล์ Frontend (รันเป็นเว็บเดียวกับ API) =====
const frontendDir = path.join(__dirname, "..", "frontend");
// no-cache: ให้เบราว์เซอร์ตรวจไฟล์ใหม่ทุกครั้ง กันปัญหา JS/CSS ค้าง cache เก่า
app.use(express.static(frontendDir, {
    etag: true,
    maxAge: 0,
    setHeaders: (res) => res.setHeader("Cache-Control", "no-cache"),
}));
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "homepage.html"));
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "เกิดข้อผิดพลาดภายในระบบ",
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend + Frontend running on http://localhost:${PORT}`);
});
