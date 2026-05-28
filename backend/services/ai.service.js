import * as repository from "../repositories/vote.repository.js";
import * as studentRepo from "../repositories/student.repository.js";
import { v4 as uuidv4 } from 'uuid';

// --- ฟังก์ชันเดิม: ตรวจสอบและบันทึกการโหวต ---
export const submitVote = async (studentId, eventId, candidateNo) => {
    const hasVoted = await studentRepo.checkVoteStatus(studentId, eventId);
    if (hasVoted) {
        return { success: false, message: "คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว" };
    }

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