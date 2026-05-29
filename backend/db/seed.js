// Seed script: เตรียมข้อมูลให้ระบบพร้อมใช้งาน/สาธิต
//  - Hash รหัสผ่านแอดมินด้วย bcrypt (ของเดิมเก็บเป็น plain text)
//  - เพิ่มนักเรียนตัวอย่าง (รหัสผ่าน bcrypt)
//  - เปิดงานเลือกตั้ง 1 งาน ให้ช่วงเวลาครอบคลุมวันนี้
//  - เพิ่มพรรคผู้สมัครตัวอย่าง
//
// รันด้วย: npm run seed   (idempotent — รันซ้ำได้)

import dotenv from "dotenv";
import bcrypt from "bcrypt";
import db from "../config/db.js";

dotenv.config();

// แอดมิน: เหลือบัญชีเดียวตามที่กำหนด (ลบของเก่า admin_id 1 และ 6 ออก) เก็บรหัสผ่านแบบ bcrypt
const ADMINS = [
    { name: "นายอภิสิทธิ์ รักษาดี", username: "11111", password: "Admin@123" },
];

// นักเรียน (ตามรายชื่อที่กำหนด — รหัสผ่านตามที่ระบุ เก็บแบบ bcrypt)
const STUDENTS = [
    { id: "22222", name: "นางสาวศิริลักษณ์ ตั้งใจ", cls: "ม.5", email: "sirilak@student.local", pass: "Student@22" },
    { id: "33333", name: "นายธนกร พารวย", cls: "ม.4", email: "thanakorn@student.local", pass: "Thanakorn@1" },
    { id: "10001", name: "นายสุรวิชญ์ เก่งงาน", cls: "ม.6", email: "surawit@student.local", pass: "Surawit@10001" },
    { id: "10002", name: "นางสาวพิมพรรณ พรประเสริฐ", cls: "ม.6", email: "pimphan@student.local", pass: "Pimphun@10002" },
    { id: "10003", name: "นายอนุทิน วิสุทธิชน", cls: "ม.5", email: "anutin@student.local", pass: "Anutin@10003" },
];

const CANDIDATES = [
    {
        no: 1,
        party: "พรรคพลังนักเรียนใหม่ (New Power Party)",
        policy:
            "ปรับปรุงระบบ Wi-Fi ความเร็วสูงครอบคลุมโรงเรียน 100%\nริเริ่มสัปดาห์กีฬาและนวัตกรรม\nพัฒนาสวัสดิการอาหารกลางวันเพื่อสุขภาพราคาประหยัด",
    },
    {
        no: 2,
        party: "พรรคก้าวรุ่งพัฒนา (Step Up Party)",
        policy:
            "ตั้งกลุ่มสนับสนุนสุขภาพจิตโดยผู้เชี่ยวชาญประจำสัปดาห์\nยกเครื่องห้องสมุดเป็น Co-working Space\nเพิ่มงบและเวลาทำกิจกรรมชมรมเสรีบ่ายวันศุกร์",
    },
    {
        no: 3,
        party: "พรรครวมมิตรกิจกรรม (Harmony Team)",
        policy:
            "จัดแข่งกีฬา Esports/ฟุตซอล/บาสเกตบอลภายในโรงเรียน\nเปิดเวทีดนตรีกลางสนามช่วงพักเที่ยง\nโหวตจัดทัศนศึกษาปลายปีตามที่นักเรียนต้องการ",
    },
];

// Migration ช่วย: เพิ่มคอลัมน์ถ้ายังไม่มี (รองรับ DB เดิมที่สร้างไว้แล้ว)
async function ensureColumn(table, column, definition) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [table, column]
    );
    if (rows[0].n === 0) {
        await db.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
        console.log(`  ✓ migrate: เพิ่มคอลัมน์ ${table}.${column}`);
    }
}
async function ensureUniqueIndex(table, indexName, columnsSql) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS n FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
        [table, indexName]
    );
    if (rows[0].n === 0) {
        await db.query(`ALTER TABLE \`${table}\` ADD UNIQUE \`${indexName}\` (${columnsSql})`);
        console.log(`  ✓ migrate: เพิ่ม unique ${table}.${indexName}`);
    }
}

async function run() {
    console.log("เริ่ม seed ข้อมูล...");

    // -1) Migrations สำหรับ DB เดิม
    await ensureColumn("admin", "admin_name", "admin_name VARCHAR(100) NOT NULL DEFAULT '' AFTER admin_id");
    await ensureColumn("voter_participation", "voter_email", "voter_email VARCHAR(100) NULL");
    await ensureUniqueIndex("voter_participation", "uq_event_email", "event_id, voter_email");

    // 0) ล้างคะแนน/การเช็คชื่อเดิม เพื่อเริ่มสาธิตใหม่ (ตารางคะแนนเป็นความลับ ไม่กระทบตัวตน)
    // await db.query("DELETE FROM voter_participation");
    // await db.query("DELETE FROM vote_record");
    // console.log("  ✓ ล้างคะแนนและบันทึกการใช้สิทธิ์เดิม");

    // 1) Admins: ลบของเก่าทั้งหมด (รวม admin_id 1 และ 6) แล้วใส่บัญชีที่กำหนดใหม่ (bcrypt)
    await db.query("DELETE FROM admin");
    for (const a of ADMINS) {
        const adminHash = await bcrypt.hash(a.password, 10);
        await db.query(
            `INSERT INTO admin (admin_name, username, password) VALUES (?, ?, ?)`,
            [a.name, a.username, adminHash]
        );
        console.log(`  ✓ admin '${a.username}' (${a.name}) bcrypt, ค่าเดิม '${a.password}'`);
    }

    // 2) Students: bcrypt + ข้อมูลครบตาม schema
    for (const s of STUDENTS) {
        const hash = await bcrypt.hash(s.pass, 10);
        await db.query(
            `INSERT INTO student
                (student_id, student_name, student_class, major, start_year, end_year, password, student_email, student_status)
             VALUES (?, ?, ?, 'N/A', 0, 0, ?, ?, 'Active')
             ON DUPLICATE KEY UPDATE
                student_name = VALUES(student_name),
                student_class = VALUES(student_class),
                password = VALUES(password),
                student_email = VALUES(student_email),
                student_status = 'Active'`,
            [s.id, s.name, s.cls, hash, s.email]
        );
    }
    console.log(`  ✓ students ${STUDENTS.length} คน (รหัสผ่าน bcrypt)`);

    // 3) เปิดงานเลือกตั้ง event_id=1 และตั้งเวลาให้ครอบคลุมวันนี้
    //    ปิดงานอื่น ๆ ก่อน (ให้มีงานเปิดอยู่งานเดียว)
    await db.query("UPDATE election_event SET is_active = 0");
    const [evs] = await db.query("SELECT event_id FROM election_event ORDER BY event_id ASC LIMIT 1");
    let eventId;
    if (evs.length) {
        eventId = evs[0].event_id;
        // ตั้งช่วงเวลาให้สัมพัทธ์กับเวลาจริงของเซิร์ฟเวอร์ (เปิดตอนนี้ และปิดอัตโนมัติในอีก 1 วัน)
        // เพื่อให้สาธิตได้จริง และระบบ auto-close ทำงานเมื่อถึงเวลา ส่วนแอดมินกดปิด manual ได้ทุกเมื่อ
        await db.query(
            `UPDATE election_event
             SET is_active = 1,
                 start_datetime = DATE_SUB(NOW(), INTERVAL 1 DAY),
                 end_datetime   = DATE_ADD(NOW(), INTERVAL 1 DAY)
             WHERE event_id = ?`,
            [eventId]
        );
    } else {
        const [[{ admin_id: adminId }]] = await db.query("SELECT admin_id FROM admin WHERE username = '11111' LIMIT 1");
        const [r] = await db.query(
            `INSERT INTO election_event (event_name, academic_year, start_datetime, end_datetime, is_active, admin_id)
             VALUES ('เลือกตั้งประธานนักเรียน ประจำปีการศึกษา 2569', 2569, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 1, ?)`,
            [adminId]
        );
        eventId = r.insertId;
    }
    console.log(`  ✓ เปิดงานเลือกตั้ง event_id=${eventId} (เปิดตอนนี้ ปิดอัตโนมัติในอีก 1 วัน)`);

    // 4) Candidates สำหรับงานนี้
    for (const c of CANDIDATES) {
        const [exist] = await db.query(
            "SELECT candidate_id FROM candidate WHERE event_id = ? AND candidate_no = ?",
            [eventId, c.no]
        );
        if (exist.length) {
            await db.query(
                "UPDATE candidate SET party_name = ?, policy_detail = ?, candidate_status = 'Active' WHERE candidate_id = ?",
                [c.party, c.policy, exist[0].candidate_id]
            );
        } else {
            await db.query(
                `INSERT INTO candidate (candidate_no, event_id, party_name, policy_detail, party_image, candidate_status)
                 VALUES (?, ?, ?, ?, NULL, 'Active')`,
                [c.no, eventId, c.party, c.policy]
            );
        }
    }
    console.log(`  ✓ candidates ${CANDIDATES.length} พรรค`);

    console.log("seed เสร็จสมบูรณ์ ✓");
    await db.end();
}

run().catch((e) => {
    console.error("seed ล้มเหลว:", e);
    process.exit(1);
});
