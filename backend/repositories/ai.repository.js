import dbconnect1 from '../config/db.js';

// 1. ดึงนโยบายของทุกพรรคใน Event นั้นๆ มาเป็น Context ให้ AI
export const getAllPolicies = async (eventId) => {
    const [rows] = await dbconnect1.query(
        'SELECT candidate_no, party_name, policy_detail FROM candidate WHERE event_id = ? AND candidate_status = "Active"',
        [eventId]
    );
    return rows;
};

// 2. บันทึกประวัติการคุยลงตาราง ai_recommendation
export const saveChatLog = async (studentId, prompt, response) => {
    const [result] = await dbconnect1.query(
        'INSERT INTO ai_recommendation (student_id, student_prompt, ai_response, chat_datetime) VALUES (?, ?, ?, NOW())',
        [studentId, prompt, response]
    );
    return result.insertId;
};

// 3. ดึงประวัติการแชทของนักเรียนคนหนึ่ง (ใหม่สุดก่อน)
export const getChatHistory = async (studentId) => {
    const [rows] = await dbconnect1.query(
        'SELECT chat_id, student_prompt, ai_response, chat_datetime FROM ai_recommendation WHERE student_id = ? ORDER BY chat_datetime DESC LIMIT 50',
        [studentId]
    );
    return rows;
};