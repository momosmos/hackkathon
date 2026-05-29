import jwt from 'jsonwebtoken';
import * as electionRepo from '../repositories/election.repository.js';
import * as studentRepo from '../repositories/student.repository.js';
import * as voteRepo from '../repositories/vote.repository.js';
import { sendEmail, isEmailConfigured } from '../utils/emailHelper.js';

/**
 * 1. ดึงข้อมูลหน้าโหวตและสถิติเบื้องต้น
 * สำหรับ Frontend: "ตรวจสอบนโยบาย" และ "ดูเปอร์เซ็นต์คนโหวตปัจจุบัน"
 */
export const getElectionDashboard = async () => {
    // ใช้งานที่เปิดอยู่ก่อน ถ้าไม่มีให้ fallback เป็นงานล่าสุด (เพื่อให้หน้าบ้านมีข้อมูลเสมอ)
    let event = await electionRepo.getActiveEvent();
    let isOpen = Boolean(event);
    if (!event) {
        const history = await electionRepo.getElectionHistory();
        event = history[0] || null;
    }

    if (!event) {
        return {
            event_info: null,
            is_open: false,
            candidates: [],
            statistics: { total_eligible: 0, voted_count: 0, percent_voted: "0.00" },
        };
    }

    const candidates = await electionRepo.getCandidatesByEvent(event.event_id);
    // ผู้มีสิทธิ์ทั้งหมด = ค่าคงที่ 2000 คน (จาก .env) ; ผู้มาใช้สิทธิ์ = นับจาก voter_participation
    const totalStudents = Number(process.env.TOTAL_ELIGIBLE_VOTERS) || 2000;
    const votedCount = await electionRepo.getVoterCount(event.event_id);

    // งดออกเสียง = ผู้มาใช้สิทธิ์ที่บัตรไม่ตรงเบอร์ใด (กดงดออกเสียง) — เริ่มต้น 0 เพิ่มตามจริง
    // (เปิดเผยได้เพราะไม่บอกการกระจายคะแนนรายเบอร์)
    const tally = await voteRepo.getVoteCounting(event.event_id);
    const validVotes = tally.reduce((s, x) => s + Number(x.total_votes), 0);
    const abstainCount = Math.max(0, votedCount - validVotes);

    return {
        event_info: event,
        is_open: isOpen,
        candidates: candidates,
        statistics: {
            total_eligible: totalStudents,
            voted_count: votedCount,
            abstain_count: abstainCount,           // งดออกเสียง (กดงดออกเสียง)
            no_show_count: totalStudents - votedCount, // ไม่มาใช้สิทธิ์
            percent_voted: totalStudents > 0 ? ((votedCount / totalStudents) * 100).toFixed(2) : "0.00"
        }
    };
};

/**
 * 2. ระบบขอรหัส OTP สำหรับโหวต
 * ตรวจสอบสิทธิ์และเวลา ก่อนส่งเมล
 */
export const requestVoteOTP = async (studentId, inputEmail) => {
    // คูหาเปิด/ปิด ควบคุมโดยสถานะ is_active ที่แอดมินสลับ (getActiveEvent คืนเฉพาะงานที่ is_active=1)
    const event = await electionRepo.getActiveEvent();
    if (!event) throw new Error("ขณะนี้ไม่มีการเปิดคูหาเลือกตั้ง");

    // ตรวจสอบว่าเคยโหวตไปหรือยัง
    const hasVoted = await studentRepo.checkVoteStatus(studentId, event.event_id);
    if (hasVoted) throw new Error("คุณได้ใช้สิทธิ์ลงคะแนนไปแล้ว");

    // อีเมลปลายทาง: ใช้ที่ผู้ใช้กรอก (ถ้ามี) มิฉะนั้นใช้อีเมลในระบบ
    const student = await studentRepo.findById(studentId);
    const targetEmail = (inputEmail && inputEmail.trim()) || (student && student.student_email);
    if (!targetEmail) throw new Error("ไม่พบอีเมลสำหรับส่งรหัส OTP กรุณากรอกอีเมล");

    // กัน 1 อีเมล = 1 ครั้ง: ถ้าอีเมลนี้ถูกใช้ยืนยันสิทธิ์ในงานนี้ไปแล้ว ห้ามขอ OTP อีก
    const emailUsed = await voteRepo.isEmailUsed(event.event_id, targetEmail);
    if (emailUsed) throw new Error("อีเมลนี้ถูกใช้ยืนยันสิทธิ์ไปแล้ว ไม่สามารถใช้ซ้ำได้");

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // สร้าง Stateless Token (เก็บ OTP ไว้ใน Token ไม่ต้องลง DB)
    const voteToken = jwt.sign(
        { studentId, otp, eventId: event.event_id, email: targetEmail },
        process.env.OTP_SECRET,
        { expiresIn: '5m' } // มีอายุ 5 นาที
    );

    // ส่งอีเมลจริง (ถ้ายังไม่ตั้งค่า EMAIL_USER/EMAIL_PASS จะ throw ให้ทราบชัดเจน)
    const { sent } = await sendEmail(
        targetEmail,
        "รหัส OTP สำหรับยืนยันการโหวต",
        `รหัสยืนยันของคุณคือ: ${otp}\n(รหัสนี้มีอายุ 5 นาที)`
    );

    return {
        voteToken,
        email: targetEmail,
        emailSent: sent,
    };
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

        // ค. บันทึกลง Database (Transaction + Hash เบอร์แบบ one-way ใน vote.repository)
        //    แนบอีเมลที่ใช้ยืนยัน เพื่อบังคับ 1 อีเมล = 1 ครั้ง
        await voteRepo.castVote({
            student_id: decoded.studentId,
            event_id: decoded.eventId,
            candidate_no: candidateNo,
            vote_receipt: receipt,
            voter_email: decoded.email
        });

        return { success: true, receipt };
    } catch (error) {
        if (error.name === 'TokenExpiredError') throw new Error("OTP หมดอายุแล้ว โปรดขอใหม่");
        throw error;
    }
};

/**
 * 4. ผลการเลือกตั้ง (Results)
 * - คืนสถิติผู้มาใช้สิทธิ์เสมอ
 * - คืนคะแนนรายเบอร์ "เฉพาะเมื่อปิดหีบแล้ว" (ความลับของบัตรเลือกตั้ง)
 */
export const getResults = async () => {
    // หา event ล่าสุดที่เกี่ยวข้อง: ถ้ามีงานที่เปิดอยู่ใช้ตัวนั้น ไม่งั้นใช้งานล่าสุดในประวัติ
    let event = await electionRepo.getActiveEvent();
    let isClosed = false;
    if (!event) {
        const history = await electionRepo.getElectionHistory();
        event = history[0] || null;
        isClosed = event ? event.is_active === 0 : false;
    }

    if (!event) {
        return { event_info: null, is_closed: false, statistics: null, results: null };
    }

    const stats = await voteRepo.getVoterStatistics(event.event_id);
    const turnoutRate = stats.total > 0 ? ((stats.voted / stats.total) * 100).toFixed(2) : "0.00";

    // คำนวณคะแนนรายเบอร์ไว้ใช้ทั้งสรุปงดออกเสียง และ (เมื่อปิดหีบ) เปิดเผยผล
    const tally = await voteRepo.getVoteCounting(event.event_id);
    const validVotes = tally.reduce((s, x) => s + Number(x.total_votes), 0);
    const abstainCount = Math.max(0, stats.voted - validVotes);

    const statistics = {
        total_eligible: stats.total,
        voted_count: stats.voted,
        abstain_count: abstainCount,                // งดออกเสียง (กดงดออกเสียง)
        no_show_count: stats.total - stats.voted,   // ไม่มาใช้สิทธิ์
        no_vote_count: stats.total - stats.voted,   // (คงไว้เพื่อความเข้ากันได้)
        percent_voted: turnoutRate,
    };

    // เปิดเผยคะแนนรายเบอร์เฉพาะเมื่อปิดหีบแล้ว
    const closed = event.is_active === 0 || isClosed;
    const results = closed ? tally : null;

    return {
        event_info: event,
        is_closed: closed,
        statistics,
        results,
    };
};

/**
 * 5. ประวัติ/รายการการเลือกตั้งทั้งหมด
 */
export const getHistory = async () => {
    return await electionRepo.getElectionHistory();
};