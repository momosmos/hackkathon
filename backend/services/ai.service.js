import * as repository from "../repositories/vote.repository.js";
import * as studentRepo from "../repositories/student.repository.js";
import * as aiRepo from "../repositories/ai.repository.js";
import * as electionRepo from "../repositories/election.repository.js";
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

// ==========================================
// 🤖 AI ผู้ช่วยการเลือกตั้ง (Google Gemini)
// ==========================================

/**
 * สร้าง System Instruction + Context จากนโยบายพรรคและกำหนดการจริงใน DB
 * แล้วส่งคำถามไปยัง Gemini API เพื่อให้ตอบอย่างเป็นกลางตามข้อมูลที่ให้เท่านั้น
 */
export const askGemini = async (studentId, message) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("ยังไม่ได้ตั้งค่า GEMINI_API_KEY ในระบบ");
    const MODEL_Name = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    // ดึงข้อมูลจริงมาเป็นบริบทให้ AI
    const activeEvent = await electionRepo.getActiveEvent();
    let candidates = [];
    if (activeEvent) {
        candidates = await aiRepo.getAllPolicies(activeEvent.event_id);
    }

    // เตรียมข้อความนโยบาย
    const policyContext = candidates
        .map((c) => `เบอร์ ${c.candidate_no} พรรค ${c.party_name}: นโยบายคือ ${c.policy_detail}`)
        .join("\n");

    // เตรียมข้อความกำหนดการและกติกา
    const scheduleContext = `
            ชื่องาน: ${activeEvent?.event_name}
            ปีการศึกษา: ${activeEvent?.academic_year}
            วันลงคะแนน: วันที่ 26 พฤษภาคม 2569 (ลงคะแนนวันเดียว)
            เวลาเปิด-ปิดหีบในวันลงคะแนน: ${activeEvent?.start_datetime} ถึง ${activeEvent?.end_datetime}
            วันประกาศและรับรองผล: วันที่ 27 พฤษภาคม 2569
            กติกาการเลือกตั้ง:
            - นักเรียน 1 คน โหวตได้เพียง 1 ครั้ง
            - ต้องใช้รหัส OTP ยืนยันผ่านอีเมลของผู้ใช้
            - การโหวตเป็นความลับ ระบบจะไม่เก็บว่าใครเลือกเบอร์ใด
            - ผลคะแนนรายเบอร์จะเปิดเผยหลังปิดหีบและในวันประกาศผล (27 พ.ค. 2569) เท่านั้น
        `;

    // ประวัติผลการเลือกตั้งย้อนหลัง (สำหรับตอบคำถามอย่าง "ปีที่แล้วใครชนะ")
    const historyContext = `
            ผลการเลือกตั้งย้อนหลัง:
            - ปีการศึกษา 2568: ผู้ชนะคือ "นายกิตติพงศ์ ใจดี" พรรคอนาคตใหม่เยาวชน
              ได้ 1,842 คะแนน (52%) | รองลงมา เบอร์ 2 ได้ 31% และ เบอร์ 3 ได้ 17%
        `;

    // ตั้งค่า System Instruction (คำสั่งควบคุมพฤติกรรม)
    const systemInstruction = `
            คุณคือ "ผู้ช่วยการเลือกตั้งสภานักเรียน"
            หน้าที่ของคุณคือ:
            1. ตอบคำถามเกี่ยวกับนโยบายผู้สมัคร โดยอ้างอิงจากข้อมูลที่ให้เท่านั้น
            2. บอกกำหนดการเลือกตั้ง วันเวลาเปิด-ปิดหีบ ให้ชัดเจน
            3. อธิบายกติกาการเลือกตั้งให้ถูกต้องตามระเบียบ
            4. หากถามเรื่อง "ผลการเลือกตั้ง":
               - ถ้ายังไม่ปิดหีบ ให้ตอบแค่เปอร์เซ็นต์ผู้มาใช้สิทธิ์รวม (ห้ามบอกคะแนนรายเบอร์)
               - ถ้าปิดหีบแล้ว ให้สรุปผลตามประกาศอย่างเป็นทางการ
            5. ความเป็นกลาง: ห้ามชี้นำ ห้ามชมพรรคใดพรรคหนึ่งว่าดีกว่าพรรคอื่น
            6. หากถามถึง "ผลการเลือกตั้งย้อนหลัง / ปีที่แล้ว / ผู้ชนะปีก่อน" ให้ตอบตามข้อมูลในส่วน
               "ผลการเลือกตั้งย้อนหลัง" ที่ให้ไว้ (เช่น ผู้ชนะปีการศึกษา 2568 คือ นายกิตติพงศ์ ใจดี)

            === ข้อมูลผู้สมัครและนโยบาย ===
            ${policyContext || "ยังไม่มีข้อมูลผู้สมัครในระบบ"}

            === กำหนดการและกติกา ===
            ${scheduleContext}

            === ${historyContext} ===
        `;

    const API_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        MODEL_Name +
        ":generateContent?key=" +
        apiKey;

    const body = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    };

    const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!resp.ok) {
        const errText = await resp.text();
        console.error("Gemini API error:", resp.status, errText);
        throw new Error("AI ไม่สามารถตอบได้ในขณะนี้ (Gemini API)");
    }

    const data = await resp.json();
    const reply =
        data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
        "ขออภัย ฉันไม่สามารถประมวลผลคำตอบได้ในขณะนี้";

    // บันทึกประวัติแชท (เฉพาะเมื่อมี studentId จริงในระบบ เพื่อไม่ให้ติด FK)
    if (studentId) {
        try {
            await aiRepo.saveChatLog(studentId, message, reply);
        } catch (e) {
            console.warn("saveChatLog skipped:", e.code || e.message);
        }
    }

    return reply;
};

/**
 * ดึงประวัติการแชทของนักเรียนคนนี้
 */
export const getChatHistory = async (studentId) => {
    return await aiRepo.getChatHistory(studentId);
};