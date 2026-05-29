import * as electionRepo from "../repositories/election.repository.js";
import * as studentRepo from "../repositories/student.repository.js";

/**
 * กันการโหวตซ้ำ: ตรวจว่ามีงานเลือกตั้งที่เปิดอยู่ และนักเรียนคนนี้ยังไม่เคยใช้สิทธิ์
 * - ต้องผ่าน verifyStudentToken มาก่อน (มี req.student_id)
 * - แนบ req.activeEvent ให้ขั้นถัดไปใช้ต่อ จะได้ไม่ต้อง query ซ้ำ
 */
export const checkAlreadyVoted = async (req, res, next) => {
    try {
        const event = await electionRepo.getActiveEvent();
        if (!event) {
            return res.status(400).json({
                status: "error",
                message: "ขณะนี้ไม่มีการเปิดคูหาเลือกตั้ง",
            });
        }

        const hasVoted = await studentRepo.checkVoteStatus(req.student_id, event.event_id);
        if (hasVoted) {
            return res.status(409).json({
                status: "error",
                message: "คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว ไม่สามารถโหวตซ้ำได้",
            });
        }

        req.activeEvent = event;
        next();
    } catch (err) {
        next(err);
    }
};
