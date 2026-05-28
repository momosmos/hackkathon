import jwt from 'jsonwebtoken';
import * as electionRepo from '../repositories/election.repository.js';
import * as studentRepo from '../repositories/student.repository.js';
import { sendEmail } from '../utils/emailHelper.js'; // ต้องมีไฟล์ช่วยส่งเมล

/**
 * 1. ดึงข้อมูลหน้าโหวตและสถิติเบื้องต้น
 * สำหรับ Frontend: "ตรวจสอบนโยบาย" และ "ดูเปอร์เซ็นต์คนโหวตปัจจุบัน"
 */
export const getElectionDashboard = async () => {
    const event = await electionRepo.getActiveEvent();
    if (!event) throw new Error("ขณะนี้ไม่มีการเปิดการเลือกตั้ง");

    const candidates = await electionRepo.getCandidatesByEvent(event.event_id);
    const totalStudents = await studentRepo.countTotalEligibleStudents();
    const votedCount = await electionRepo.getVoterCount(event.event_id);

    return {
        event_info: event,
        candidates: candidates,
        statistics: {
            total_eligible: totalStudents,
            voted_count: votedCount,
            percent_voted: totalStudents > 0 ? ((votedCount / totalStudents) * 100).toFixed(2) : 0
        }
    };
};

/**
 * 2. ระบบขอรหัส OTP สำหรับโหวต
 * ตรวจสอบสิทธิ์และเวลา ก่อนส่งเมล
 */
export const requestVoteOTP = async (studentId) => {
    const event = await electionRepo.getActiveEvent();
    if (!event) throw new Error("ไม่อยู่ในช่วงเวลาการเลือกตั้ง");

    // ตรวจสอบว่าตอนนี้อยู่ในช่วงเวลาที่โหวตได้จริงไหม (Time Validation)
    const now = new Date();
    if (now < new Date(event.start_datetime) || now > new Date(event.end_datetime)) {
        throw new Error("ระบบปิดรับการลงคะแนนแล้ว");
    }

    // ตรวจสอบว่าเคยโหวตไปหรือยัง
    const hasVoted = await studentRepo.checkVoteStatus(studentId, event.event_id);
    if (hasVoted) throw new Error("คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว");

    // ดึงเมลนักเรียน
    const student = await studentRepo.findById(studentId);
    if (!student.student_email) throw new Error("ไม่พบอีเมลนักเรียนในระบบ");

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // สร้าง Stateless Token (เก็บ OTP ไว้ใน Token ไม่ต้องลง DB)
    const voteToken = jwt.sign(
        { studentId, otp, eventId: event.event_id }, 
        process.env.OTP_SECRET, 
        { expiresIn: '5m' } // มีอายุ 5 นาที
    );

    // ส่งเมล
    await sendEmail(
        student.student_email, 
        "รหัส OTP สำหรับยืนยันการโหวต", 
        `รหัสยืนยันของคุณคือ: ${otp} (รหัสนี้มีอายุ 5 นาที)`
    );

    return { voteToken }; // ส่ง Token กลับไปให้ Frontend ถือไว้
};

/**
 * 3. ยืนยันการโหวตและบันทึกคะแนน
 */
export const submitVote = async (studentId, candidateNo, inputOtp, voteToken) => {
    try {
        // ก. ถอดรหัส Token เพื่อเช็ค OTP
        const decoded = jwt.verify(voteToken, process.env.OTP_SECRET);
        
        if (decoded.otp !== inputOtp || decoded.studentId !== studentId) {
            throw new Error("รหัส OTP ไม่ถูกต้อง");
        }

        // ข. สร้างหมายเลขใบเสร็จ (Receipt) เพื่อใช้อ้างอิง (แบบไม่ระบุตัวตน)
        const receipt = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // ค. บันทึกลง Database (ใช้ Transaction ใน Repo)
        await electionRepo.saveVoteTransaction({
            studentId: decoded.studentId,
            eventId: decoded.eventId,
            candidateNo,
            receipt
        });

        return { success: true, receipt };
    } catch (error) {
        if (error.name === 'TokenExpiredError') throw new Error("OTP หมดอายุแล้ว โปรดขอใหม่");
        throw error;
    }
};

/**
 * 4. ดูผลการเลือกตั้งย้อนหลังและปัจจุบัน
 */
export const getResults = async (eventId) => {
    const event = await electionRepo.getElectionHistory(); // ปรับหาเฉพาะ event ที่ระบุ
    // Logic: ถ้า event ยังไม่ปิด (is_active = 1) ห้ามส่งคะแนนรายพรรค
    // ถ้าปิดแล้ว (is_active = 0) ถึงจะเรียก electionRepo.getFinalResults(eventId)
    // ...
};