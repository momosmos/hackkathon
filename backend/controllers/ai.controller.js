import * as aiService from '../services/ai.service.js';

/**
 * 1. คอนโทรลเลอร์สำหรับแชทตอบคำถาม (Chat with AI)
 * POST /api/ai/chat
 * สำหรับหน้าบ้าน: รับข้อความจากช่องแชท และส่งคำตอบจาก AI กลับไป
 */
export const chatWithAI = async (req, res, next) => {
    try {
        const { message } = req.body;
        const studentId = req.student_id; // ได้มาจาก Auth Middleware (ยามหน้าประตู)

        // 1. ตรวจสอบว่าส่งข้อความมาจริงไหม
        if (!message || message.trim() === "") {
            return res.status(400).json({ 
                status: "error", 
                message: "กรุณาระบุข้อความที่ต้องการสอบถาม" 
            });
        }

        // 2. ส่งไปให้ Service ประมวลผลร่วมกับข้อมูลนโยบายและ Gemini API
        const aiResponse = await aiService.askGemini(studentId, message);

        // 3. ส่งคำตอบกลับไปยัง Frontend
        res.status(200).json({
            status: "success",
            data: {
                reply: aiResponse
            }
        });
    } catch (error) {
        // หากเกิด Error เช่น API Key มีปัญหา หรือ Quota เต็ม
        console.error("Chat Controller Error:", error);
        res.status(500).json({ 
            status: "error", 
            message: "ขออภัยครับ AI ไม่สามารถตอบคำถามได้ในขณะนี้ โปรดลองใหม่ภายหลัง" 
        });
    }
};

/**
 * 2. คอนโทรลเลอร์สำหรับดึงประวัติการแชทส่วนตัว
 * GET /api/ai/history
 * สำหรับหน้าบ้าน: ใช้โชว์แชทเก่าๆ ที่นักเรียนคนนี้เคยคุยไว้
 */
export const getMyChatHistory = async (req, res, next) => {
    try {
        const studentId = req.student_id;
        
        // เรียกใช้ Service หรือ Repo โดยตรงเพื่อดึงประวัติ
        const history = await aiService.getChatHistory(studentId); 
        
        res.status(200).json({
            status: "success",
            data: history
        });
    } catch (error) {
        next(error);
    }
};