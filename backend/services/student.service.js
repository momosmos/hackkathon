import * as studentRepo from '../repositories/student.repository.js';
import * as votingRepo from '../repositories/vote.repository.js';
import { v4 as uuidv4 } from 'uuid';

export const castVote = async (studentId, eventId, candidateNo) => {
    // 1. ดึงข้อมูลนักเรียนเพื่อเอา Email (ดึงจาก Table: student)
    const student = await studentRepo.findById(studentId);
    if (!student) throw new Error("ไม่พบข้อมูลนักเรียน");
    
    const studentEmail = student.student_email; // ดึง Email มาเก็บไว้ที่นี่!

    // 2. เช็คว่าโหวตไปยัง (กันโหวตซ้ำ)
    const hasVoted = await studentRepo.checkVoteStatus(studentId, eventId);
    if (hasVoted) throw new Error("คุณใช้สิทธิ์ไปแล้ว");

    // 3. สร้างเลขใบเสร็จ (Receipt)
    const receipt = `REC-${uuidv4().substring(0, 8).toUpperCase()}`;

    // 4. ส่งข้อมูลทั้งหมด (รวม Email) ไปบันทึกที่ฝั่ง Voting Repository
    await votingRepo.saveVoteTransaction({
        student_id: studentId,
        student_email: studentEmail, // ส่ง Email ไปเป็นหลักฐานด้วย
        event_id: eventId,
        candidate_no: candidateNo,
        vote_receipt: receipt
    });

    return { receipt, email: studentEmail };
};