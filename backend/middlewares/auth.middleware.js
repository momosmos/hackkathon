import jwt from "jsonwebtoken";

/**
 * ดึง Bearer Token จาก header Authorization แล้วถอดรหัส (verify) ด้วย JWT_SECRET
 * คืน payload ถ้าถูกต้อง / โยน error ถ้าไม่ผ่าน
 */
function decodeBearer(req) {
    const header = req.headers["authorization"] || req.headers["Authorization"];
    if (!header || !header.startsWith("Bearer ")) {
        const err = new Error("ไม่พบ Token การยืนยันตัวตน");
        err.status = 401;
        throw err;
    }
    const token = header.slice(7).trim();
    return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * ยามหน้าประตูสำหรับนักเรียน: ต้องมี JWT ที่ถูกต้อง
 * เซ็ต req.student_id และ req.role ให้ Controller ใช้งานต่อ
 */
export const verifyStudentToken = (req, res, next) => {
    try {
        const decoded = decodeBearer(req);
        req.student_id = decoded.student_id;
        req.role = decoded.role || "student";
        req.auth = decoded;
        next();
    } catch (err) {
        return res.status(err.status || 401).json({
            status: "error",
            message: "เซสชันหมดอายุหรือยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่",
        });
    }
};

/**
 * ยามหน้าประตูสำหรับแอดมิน: ต้องมี JWT ที่ถูกต้อง + role === 'admin'
 */
export const verifyAdminToken = (req, res, next) => {
    try {
        const decoded = decodeBearer(req);
        if (decoded.role !== "admin") {
            return res.status(403).json({
                status: "error",
                message: "บัญชีนี้ไม่มีสิทธิ์เข้าถึงส่วนของผู้ดูแลระบบ",
            });
        }
        req.admin_id = decoded.admin_id;
        req.username = decoded.username;
        req.role = "admin";
        req.auth = decoded;
        next();
    } catch (err) {
        return res.status(err.status || 401).json({
            status: "error",
            message: "เซสชันแอดมินหมดอายุ กรุณาเข้าสู่ระบบใหม่",
        });
    }
};

/**
 * ตรวจ Token แบบไม่บังคับ: ถ้ามีและถูกต้องก็เซ็ตค่า, ถ้าไม่มีก็ปล่อยผ่าน
 * ใช้กับ endpoint ที่เปิดสาธารณะแต่ปรับเนื้อหาตามผู้ใช้ได้ (เช่น AI chat)
 */
export const optionalAuth = (req, res, next) => {
    try {
        const decoded = decodeBearer(req);
        req.student_id = decoded.student_id;
        req.role = decoded.role;
        req.auth = decoded;
    } catch (_) {
        // ไม่มี Token ก็ไม่เป็นไร
    }
    next();
};
