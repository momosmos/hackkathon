-- 1. ปิดการเช็คความสัมพันธ์ (Foreign Key) ชั่วคราว
SET FOREIGN_KEY_CHECKS = 0;

-- 2. ล้างตารางเดิมทั้งหมด
DROP TABLE IF EXISTS ai_recommendation;
DROP TABLE IF EXISTS vote_record;
DROP TABLE IF EXISTS voter_participation;
DROP TABLE IF EXISTS candidate_member;
DROP TABLE IF EXISTS candidate;
DROP TABLE IF EXISTS election_event;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS admin;

-- 3. เปิดระบบเช็คความสัมพันธ์กลับมาทำงานตามปกติ
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- เริ่มสร้างตารางใหม่ (เวอร์ชันอัปเดตสถานะ & ปรับปรุง Admin)
-- ==========================================

-- 1. ตารางผู้ดูแลระบบ (Admin) - เก็บ ชื่อ + รหัสผู้ใช้ + รหัสผ่าน (bcrypt)
CREATE TABLE admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,           -- ชื่อ-นามสกุลผู้ดูแลระบบ
    username VARCHAR(50) NOT NULL UNIQUE,        -- รหัส/ชื่อผู้ใช้สำหรับล็อกอิน
    password VARCHAR(255) NOT NULL               -- รหัสผ่าน (เก็บแบบ bcrypt)
);

-- 2. ตารางข้อมูลนักเรียน (Student) - [อัปเดต] เพิ่มคอลัมน์ student_status
CREATE TABLE student (
    student_id VARCHAR(5) PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_class VARCHAR(10) NOT NULL, 
    major VARCHAR(50) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    password VARCHAR(255) NOT NULL, 
    student_email VARCHAR(100) NOT NULL UNIQUE,
    student_status VARCHAR(20) NOT NULL -- สถานะนักเรียน เช่น 'Active', 'Graduated'
);

-- 3. ตารางรอบการเลือกตั้ง (Election Event)
CREATE TABLE election_event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    academic_year INT NOT NULL,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 0,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES admin(admin_id) ON DELETE SET NULL
);

-- 4. ตารางพรรคผู้สมัคร (Candidate) - [อัปเดต] เพิ่มคอลัมน์ candidate_status
CREATE TABLE candidate (
    candidate_id INT AUTO_INCREMENT PRIMARY KEY, 
    candidate_no INT NOT NULL, -- เบอร์ผู้สมัครหน้าคูหา
    event_id INT NOT NULL,
    party_name VARCHAR(100) NOT NULL,
    policy_detail TEXT NOT NULL,
    party_image VARCHAR(255) NULL,
    candidate_status VARCHAR(20) NOT NULL DEFAULT 'Active', -- สถานะพรรค เช่น 'Active', 'Disqualified'
    FOREIGN KEY (event_id) REFERENCES election_event(event_id) ON DELETE CASCADE
);

-- 5. ตารางทีมงานของพรรค (Candidate Member)
CREATE TABLE candidate_member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL, 
    student_id VARCHAR(5) NOT NULL,
    member_role VARCHAR(100) NOT NULL,
    FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);

-- 6. สมุดเช็คชื่อผู้มาใช้สิทธิ์ (Voter Participation)
CREATE TABLE voter_participation (
    participation_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(5) NOT NULL,
    event_id INT NOT NULL,
    voter_email VARCHAR(100) NULL,              -- อีเมลที่ใช้ยืนยัน (กัน 1 อีเมลโหวตซ้ำ)
    voted_at DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES election_event(event_id) ON DELETE CASCADE,
    UNIQUE (student_id, event_id),              -- 1 บัญชี โหวตได้ 1 ครั้งต่อ 1 งาน
    UNIQUE (event_id, voter_email)              -- 1 อีเมล ยืนยันได้ 1 ครั้งต่อ 1 งาน
);

-- 7. ตารางหีบเก็บคะแนนลับ (Vote Record)
CREATE TABLE vote_record (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL, 
    vote_receipt VARCHAR(100) NOT NULL UNIQUE,
    candidate_no VARBINARY(255) NOT NULL, -- คะแนนเข้ารหัสลับ
    voted_at DATETIME NOT NULL,
    FOREIGN KEY (event_id) REFERENCES election_event(event_id) ON DELETE CASCADE
);

-- 8. ตารางบันทึกประวัติการแชทกับ AI (AI Recommendation)
CREATE TABLE ai_recommendation (
    chat_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(5) NOT NULL,
    student_prompt TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    chat_datetime DATETIME NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
);