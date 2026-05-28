import * as service from "../services/vote.service.js";

// --- ฟังก์ชันเดิม: รับโหวต ---
export const vote = async (req, res) => {
    try {
        const { student_id, event_id, candidate_no } = req.body;
        const result = await service.submitVote(student_id, event_id, candidate_no);
        if (!result.success) return res.status(400).json({ message: result.message });
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
};

// --- ฟังก์ชันใหม่: ดึงสถิติ Dashboard ---
export const getDashboard = async (req, res) => {
    try {
        const { eventId } = req.params;
        const result = await service.getAdminDashboard(eventId);
        return res.status(200).json(result.data);
    } catch (err) {
        return res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้", error: err.message });
    }
};