import * as repository from "../repositories/vote.repository.js";
// แก้ไขชื่อไฟล์ที่อาจจะพิมพ์ตก (lection -> election)
import * as electionRepo from "../repositories/election.repository.js"; 
// เพิ่ม Import ที่ขาดไป (เช็ก path ของคุณอีกครั้งให้ตรงกับโปรเจกต์จริง)
import * as studentRepo from "../repositories/student.repository.js"; 
import * as candidateRepo from "../repositories/candidate.repository.js";
import { v4 as uuidv4 } from 'uuid';

// --- ฟังก์ชันเดิม: ตรวจสอบและบันทึกการโหวต ---
export const submitVote = async (studentId, eventId, candidateNo) => {
    // 1. ตรวจสอบว่าโหวตไปแล้วหรือยัง
    const hasVoted = await studentRepo.checkVoteStatus(studentId, eventId);
    if (hasVoted) {
        return { success: false, message: "คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว" };
    }

    // 2. ตรวจสอบว่าพรรคที่เลือกอยู่ใน Event นี้จริงไหม (ส่วนที่เพิ่งเพิ่มเข้ามา)
    const candidatesInEvent = await candidateRepo.getCandidatesByEvent(eventId);
    const isValidCandidate = candidatesInEvent.some(c => c.candidate_no === candidateNo);

    if (!isValidCandidate) {
        // ตอนนี้ return ตัวนี้อยู่ในฟังก์ชันแล้ว จะไม่ Error แล้วครับ
        return { success: false, message: "เบอร์ผู้สมัครไม่ถูกต้องสำหรับรอบการเลือกตั้งนี้" };
    }

    // 3. ดำเนินการบันทึกการโหวต
    const voteReceipt = `REC-${uuidv4().substring(0, 8)}`;
    await repository.castVote({
        student_id: studentId,
        event_id: eventId,
        candidate_no: candidateNo,
        vote_receipt: voteReceipt
    });

    return { success: true, message: "ลงคะแนนสำเร็จ!", receipt: voteReceipt };
};

// --- ฟังก์ชันใหม่: ปรุงข้อมูล Dashboard ---
export const getAdminDashboard = async (eventId) => {
    const voteResults = await repository.getVoteCounting(eventId);
    const stats = await repository.getVoterStatistics(eventId);

    // คำนวณ Turnout Rate
    const turnoutRate = stats.total > 0 
        ? ((stats.voted / stats.total) * 100).toFixed(2) 
        : 0;

    return {
        success: true,
        data: {
            election_results: voteResults,
            statistics: {
                total_eligible_voters: stats.total,
                total_voted: stats.voted,
                turnout_rate: `${turnoutRate}%`,
                not_voted: stats.total - stats.voted
            }
        }
    };
};