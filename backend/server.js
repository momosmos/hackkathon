// const express = require('express');
// const cors = require('cors');
// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());

// // --- DATABASE จำลอง (จำลองตามโครงสร้างที่คุณออกแบบ) ---

// // เฟส 1: ข้อมูลการเลือกตั้งและผู้สมัคร
// let electionEvent = {
//     id: "E2026",
//     name: "การเลือกตั้งสภานักเรียน 2569",
//     start_datetime: "2026-05-26T08:00:00",
//     end_datetime: "2026-05-26T18:00:00"
// };

// let candidates = [
//     { id: 1, party: "พรรคก้าวหน้า", lead: "นายสมชาย", votes: 0, members: ["นาย A", "นางสาว B"] },
//     { id: 2, party: "พรรคพลังไอที", lead: "นางสาวสมหญิง", votes: 0, members: ["นาย C", "นาย D"] }
// ];

// // ข้อมูลนักศึกษา (voted_status: 0 ยังไม่โหวต, 1 โหวตแล้ว)
// let students = [
//     { id: "69001", name: "จิรายุ รักเรียน", voted_status: 0 },
//     { id: "69002", name: "มานี มีนา", voted_status: 0 },
//     { id: "69003", name: "ชูใจ ไปเรียน", voted_status: 0 }
// ];

// // ตารางเก็บประวัติการโหวต (Secret Ballot - ไม่เก็บว่าใครโหวต)
// let voteRecords = [];

// // --- API ROUTES ---

// // 1. ดึงข้อมูลพื้นฐาน (เฟส 1)
// app.get('/api/election-status', (req, res) => {
//     res.json({
//         event: electionEvent,
//         candidates: candidates
//     });
// });

// // 2. ยืนยันตัวตนนักศึกษา (เฟส 2)
// app.post('/api/login', (req, res) => {
//     const { student_id } = req.body;
//     const student = students.find(s => s.id === student_id);
    
//     if (!student) return res.status(404).json({ message: "ไม่พบรหัสนักศึกษานี้ในระบบ" });
//     res.json(student);
// });

// // 3. ระบบกดโหวต (Transaction Process - เฟส 2)
// app.post('/api/vote', (req, res) => {
//     const { student_id, candidate_id } = req.body;
//     const now = new Date();

//     // เช็คเวลาปิดหีบ
//     if (now > new Date(electionEvent.end_datetime)) {
//         return res.status(403).json({ message: "ปิดหีบเลือกตั้งแล้ว ไม่สามารถลงคะแนนได้" });
//     }

//     const student = students.find(s => s.id === student_id);
    
//     // เช็คว่าเคยโหวตหรือยัง (Prevention Logic)
//     if (!student || student.voted_status === 1) {
//         return res.status(400).json({ message: "คุณได้ใช้สิทธิ์ไปแล้ว ไม่สามารถโหวตซ้ำได้" });
//     }

//     // --- TRANSACTION START ---
//     // สเตป A: โยนบัตรลงหีบ (ไม่บันทึกตัวตน)
//     voteRecords.push({
//         candidate_id: candidate_id,
//         voted_at: new Date()
//     });

//     // สเตป B: ตัดสิทธิ์นักศึกษา
//     student.voted_status = 1;

//     // อัปเดตคะแนนพรรค
//     const targetCandidate = candidates.find(c => c.id === candidate_id);
//     if (targetCandidate) targetCandidate.votes++;
//     // --- TRANSACTION END ---

//     console.log(`Vote recorded for candidate ${candidate_id} by student ${student_id}`);
//     res.json({ success: true, message: "ลงคะแนนสำเร็จ ขอบคุณที่ใช้สิทธิ์" });
// });

// // 4. สรุปผลการเลือกตั้ง (เฟส 3)
// app.get('/api/results', (req, res) => {
//     const totalVoters = students.length;
//     const votedCount = students.filter(s => s.voted_status === 1).length;
    
//     res.json({
//         candidateResults: candidates,
//         turnout: {
//             total: totalVoters,
//             voted: votedCount,
//             percent: ((votedCount / totalVoters) * 100).toFixed(2)
//         }
//     });
// });

// app.listen(PORT, () => {
//     console.log(`✅ Backend running at http://localhost:${PORT}`);
// });