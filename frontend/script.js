// === 1. INITIAL SYSTEM STATE ===

// จำนวนนักเรียนทั้งหมดและผู้มีสิทธิ์เลือกตั้ง (ใช้สำหรับคำนวณสถิติ)
const TOTAL_ELIGIBLE_VOTERS = 2000;

// ฐานข้อมูลนักเรียนเบื้องต้น (password เก็บแบบ plain สำหรับ demo; production ควร hash)
let students = [
    { id: "11111", name: "นายอภิสิทธิ์ รักษาดี", grade: "ม.6", role: "admin", password: "Admin@123", voted: false, candidateApproved: false },
    { id: "22222", name: "นางสาวศิริลักษณ์ ตั้งใจ", grade: "ม.5", role: "student", password: "Student@22", voted: false, candidateApproved: false },
    { id: "33333", name: "นายธนกร พารวย", grade: "ม.4", role: "student", password: "Thanakorn@1", voted: false, candidateApproved: false },
    { id: "10001", name: "นายสุรวิชญ์ เก่งงาน", grade: "ม.6", role: "student", password: "Surawit@10001", voted: true, votedFor: 1, candidateApproved: true, candidateId: 1 },
    { id: "10002", name: "นางสาวพิมพรรณ พรประเสริฐ", grade: "ม.6", role: "student", password: "Pimphun@10002", voted: true, votedFor: 2, candidateApproved: true, candidateId: 2 },
    { id: "10003", name: "นายอนุทิน วิสุทธิชน", grade: "ม.5", role: "student", password: "Anutin@10003", voted: false, candidateApproved: true, candidateId: 3 }
];

// รายชื่อผู้สมัครรับเลือกตั้ง
let candidates = [
    {
        id: 1,
        name: "นายสุรวิชญ์ เก่งงาน",
        grade: "ม.5",
        party: "พรรคพลังนักเรียนใหม่ (New Power Party)",
        slogan: "เพื่อมัธยมปลายยุคใหม่ มุ่งมั่นปรับปรุงเทคโนโลยีและการศึกษาเพื่อความเป็นเลิศทางวิชาการและวิชาชีพ",
        avatar: "",
        policies: [
            "ปรับปรุงระบบการเชื่อมต่อ Wi-Fi ความเร็วสูงให้ครอบคลุมโรงเรียน 100%",
            "ริเริ่มสัปดาห์กีฬาและนวัตกรรมเพื่อส่งเสริมเด็กสายศิลป์และสายวิทย์อย่างสมดุล",
            "พัฒนาระบบสวัสดิการอาหารมื้อกลางวันเพื่อสุขภาพ ในราคาที่สบายกระเป๋า"
        ],
        votes: 4,
        approved: true
    },
    {
        id: 2,
        name: "นางสาวพิมพรรณ พรประเสริฐ",
        grade: "ม.5",
        party: "พรรคก้าวรุ่งพัฒนา (Step Up Party)",
        slogan: "สร้างพื้นที่ปลอดภัยและสนับสนุนความหลากหลาย เสริมสร้างความสุขและเสียงของทุกคนมีความหมายเท่าเทียม",
        avatar: "",
        policies: [
            "ก่อตั้งกลุ่มประคับประคองและสนับสนุนสุขภาพจิตโดยมีผู้เชี่ยวชาญให้คำแนะนำประจำสัปดาห์",
            "ยกเครื่องห้องสมุดและห้องเรียนกิจกรรมสร้างสรรค์ให้เป็น Co-working Space สบายๆ ยุคใหม่",
            "เพิ่มงบประมาณและเวลาทำกิจกรรมชมรมเสรีในบ่ายวันศุกร์เพื่อปลดล็อกไอเดียเด็กมัธยม"
        ],
        votes: 3,
        approved: true
    },
    {
        id: 3,
        name: "นายอนุทิน วิสุทธิชน",
        grade: "ม.5",
        party: "พรรครวมมิตรกิจกรรม (Harmony Team)",
        slogan: "สร้างรอยยิ้ม ความสุข และมิตรภาพ สนับสนุนกิจกรรมกีฬา ศิลปะดนตรีอย่างจัดเต็มไม่มีอั้น",
        avatar: "",
        policies: [
            "จัดการแข่งขันกีฬา Esports, ฟุตซอล และบาสเกตบอลชิงแชมป์สโมสรภายในโรงเรียน",
            "อนุญาตให้เปิดเวทีดนตรีกลางสนามเพื่อโชว์ความสามารถศิลปะการแสดงช่วงพักเที่ยงของสัปดาห์",
            "เปิดให้มีการโหวตจัดทัศนศึกษาปลายปีตามที่นักเรียนชอบจริง"
        ],
        votes: 2,
        approved: true
    }
];

// บันทึก Log การลงคะแนนป้องกันการทุจริต
let auditLogs = [
    { timestamp: "28 พ.ค. 2569, 10:14:32", voterId: "10001", status: "สำเร็จ (บันทึกเข้ารหัสคีย์นิรนามเรียบร้อย)" },
    { timestamp: "28 พ.ค. 2569, 10:28:11", voterId: "10002", status: "สำเร็จ (บันทึกเข้ารหัสคีย์นิรนามเรียบร้อย)" }
];

// สถานะการเข้าใช้ระบบปัจจุบัน
let currentUser = null;
let authTab = "login";
let currentTab = "home";
let isElectionOpen = true;
let selectedCandidateToVote = null;

// สถานะที่ดึงจาก Backend
let currentEventId = null;     // event_id ของงานที่กำลังแสดง
let currentVoteToken = null;   // voteToken (ถือ OTP) ที่ได้จาก /request-otp
let currentEnteredOtp = null;  // OTP 6 หลักที่ผู้ใช้กรอก

// === 2. EVENT LISTENERS & TAB CONTROLLER ===
document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();
    restoreSession();
    await loadElectionData();
    updateUI();
    // เปิดหน้าให้ตรงกับ URL (#hash) ถ้ามี
    routeFromHash();

    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
        chatInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                sendChat();
            }
        });
    }

    // อัปเดตสถานะอัตโนมัติทุก 15 วินาที — เมื่อแอดมินปิดหีบ หน้าผู้ใช้ที่เปิดค้างไว้
    // จะเปลี่ยนเป็นสถานะปิด (แถบแดง + คูหาปิด) เองโดยไม่ต้องรีเฟรช
    setInterval(async () => {
        const wasOpen = isElectionOpen;
        await loadElectionData();
        // อัปเดต UI เฉพาะเมื่อสถานะเปลี่ยน หรือยังอยู่หน้าหลัก/ผล (กันรีเฟรชถี่เกินจำเป็น)
        if (wasOpen !== isElectionOpen || currentTab === "home" || currentTab === "results") {
            updateUI();
            if (wasOpen && !isElectionOpen) {
                showAdminToast("ปิดหีบรับคะแนนแล้ว — ระบบลงคะแนนปิดทันที");
            }
        }
    }, 8000);
});

// คืนสถานะผู้ใช้จาก localStorage (กันรีเฟรชแล้วหลุด)
function restoreSession() {
    const u = ApiClient.Auth.getUser();
    if (u && ApiClient.Auth.getToken()) currentUser = u;
}

// แปลงข้อมูลผู้สมัครจาก Backend -> รูปแบบที่หน้าบ้านใช้
function mapCandidate(c, voteMap) {
    const policies = (c.policy_detail || "").split("\n").map(s => s.trim()).filter(Boolean);
    return {
        id: c.candidate_no,
        candidate_id: c.candidate_id,
        name: c.party_name,
        grade: "",
        party: c.party_name,
        slogan: policies[0] || c.party_name,
        avatar: "",
        policies,
        votes: voteMap ? (voteMap[c.candidate_no] || 0) : 0,
        approved: (c.candidate_status || "Active") === "Active",
    };
}

// ดึงข้อมูลการเลือกตั้ง (ผู้สมัคร + สถิติ + สถานะเปิด/ปิด) จาก Backend
async function loadElectionData() {
    try {
        const res = await ApiClient.getDashboard();
        const d = res.data || {};
        currentEventId = d.event_info ? d.event_info.event_id : null;
        isElectionOpen = Boolean(d.is_open);
        if (d.event_info && d.event_info.event_name) {
            electionTitle = d.event_info.event_name;
        }

        // นับถอยหลังที่แอดมินตั้งไว้ (เวลาปิดหีบจาก DB) — แสดงให้ผู้ใช้ทุกคนเห็น
        electionCloseTime = (d.event_info && d.event_info.end_datetime)
            ? new Date(d.event_info.end_datetime) : null;
        if (isElectionOpen && electionCloseTime) {
            startCountdown();
        } else {
            stopCountdown();
        }

        // ถ้าปิดหีบแล้ว ดึงคะแนนรายเบอร์มาแสดงด้วย
        let voteMap = null;
        try {
            const r = await ApiClient.getResults();
            const rd = r.data || {};
            if (rd.is_closed && Array.isArray(rd.results)) {
                voteMap = {};
                rd.results.forEach(x => { voteMap[x.candidate_no] = x.total_votes; });
            }
            if (rd.statistics) window.__turnout = rd.statistics;
        } catch (_) { /* ไม่เป็นไร */ }

        candidates = (d.candidates || []).map(c => mapCandidate(c, voteMap));

        // เก็บสถิติ turnout ไว้ให้ updateUI ใช้
        window.__stats = d.statistics || null;
    } catch (err) {
        console.error("loadElectionData error:", err);
    }
}

function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("border-blue-600", "text-blue-600");
        btn.classList.add("border-transparent", "text-slate-500");
    });
    const activeTabBtn = document.getElementById(`tab-${tabId}`);
    if (activeTabBtn) {
        activeTabBtn.classList.add("border-blue-600", "text-blue-600");
        activeTabBtn.classList.remove("border-transparent", "text-slate-500");
    }
    document.querySelectorAll(".tab-page").forEach(page => page.classList.add("hidden"));
    document.getElementById(`page-${tabId}`).classList.remove("hidden");

    if (tabId === "chatbot") {
        loadChatHistory();
    }
    if (tabId === "candidate-panel") {
        loadCurrentCandidateData();
    }
    if (tabId === "admin") {
        loadAdminStudents();
    }
    // หน้าหลัก/ผลการเลือกตั้ง: ดึงข้อมูลล่าสุดเสมอ เพื่อให้กราฟผล/สถิติอัปเดตทันทีเมื่อปิดหีบ
    if (tabId === "results" || tabId === "home") {
        loadElectionData().then(updateUI);
    }

    // ซิงก์กับ URL เสมอ (เปลี่ยนหน้า = เปลี่ยน #hash ใน address bar รองรับปุ่ม Back/Forward)
    if (location.hash !== "#" + tabId) {
        location.hash = tabId;
    }
    updateUI();
}

// เปิดหน้าตามค่า #hash ใน URL (ใช้ตอนโหลดครั้งแรกและตอนกดปุ่มย้อนกลับของเบราว์เซอร์)
const VALID_TABS = ["home", "candidates", "results", "chatbot", "candidate-panel", "admin"];
function routeFromHash() {
    let t = (location.hash || "").replace("#", "") || "home";
    if (!VALID_TABS.includes(t)) t = "home";
    // หน้า admin / candidate-panel ต้องล็อกอินสิทธิ์ที่เหมาะสมก่อน
    if (t === "admin" && (!currentUser || currentUser.role !== "admin")) t = "home";
    if (t === "candidate-panel" && !currentUser) t = "home";
    if (t !== currentTab) switchTab(t);
}

// กดปุ่ม Back/Forward หรือแก้ #hash เอง -> เปลี่ยนหน้าให้ตรง
window.addEventListener("hashchange", routeFromHash);

// ดึงรายชื่อนักเรียน/ผู้สมัครจาก Backend มาแสดงในตารางแอดมิน
async function loadAdminStudents() {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
        const rows = await ApiClient.adminGetStudents();
        students = (rows || []).map(r => ({
            id: r.student_id,
            name: r.student_name,
            grade: r.student_class,
            role: "student",
            member_type: r.member_type,
        }));
        // โหลดประวัติ Vote Receipt ก่อนแสดงผล Admin Panel
        await loadVoteReceiptLogs();
        renderAdminPanel();
        lucide.createIcons();
    } catch (err) {
        console.error("loadAdminStudents error:", err);
    }
}

function scrollToRules() {
    switchTab('home');
    setTimeout(() => {
        document.getElementById('rules-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// === 3. AUTHENTICATION SERVICES ===
function openAuthModal() {
    document.getElementById("auth-modal").classList.remove("hidden");
    switchAuthTab("student");
}

function closeAuthModal() {
    document.getElementById("auth-modal").classList.add("hidden");
    // reset login form
    const sid = document.getElementById("auth-student-id");
    const pw = document.getElementById("auth-password");
    if (sid) sid.value = "";
    if (pw) pw.value = "";
    const errMsg = document.getElementById("auth-error-msg");
    if (errMsg) errMsg.classList.add("hidden");
    // reset register form
    const fields = ["auth-name", "auth-reg-student-id", "auth-reg-password", "auth-confirm-password"];
    fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
    const gradYear = document.getElementById("auth-grad-year");
    if (gradYear) { gradYear.value = ""; delete gradYear.dataset.gradYearNum; }
    const startYear = document.getElementById("auth-start-year");
    if (startYear) { startYear.value = ""; delete startYear.dataset.startYearNum; }
    const strengthWrap = document.getElementById("password-strength-wrap");
    if (strengthWrap) strengthWrap.classList.add("hidden");
    const regErr = document.getElementById("auth-reg-error-msg");
    if (regErr) regErr.classList.add("hidden");
    // reset grade select
    const gradeSelect = document.getElementById("auth-grade");
    if (gradeSelect) gradeSelect.value = "ม.1";
    // back to default view
    switchAuthTab("student");
}

function switchAuthTab(type) {
    authTab = type;
    const titleEl = document.getElementById("auth-title");
    const subtitleEl = document.getElementById("auth-subtitle");
    const tabBar = document.getElementById("auth-tab-bar");
    const loginForm = document.getElementById("auth-login-form");
    const registerForm = document.getElementById("auth-register-form");
    const tabStudent = document.getElementById("tab-auth-student");
    const tabAdmin = document.getElementById("tab-auth-admin");
    const passwordLabel = document.getElementById("auth-password-label");
    const registerLink = document.getElementById("auth-register-link");
    const forgotLink = document.getElementById("auth-forgot-link");
    const btnText = document.getElementById("auth-btn-text");

    // clear errors on switch
    const errMsg = document.getElementById("auth-error-msg");
    if (errMsg) errMsg.classList.add("hidden");

    if (type === "register") {
        // แสดงฟอร์มลงทะเบียน, ซ่อน tab bar
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        if (tabBar) tabBar.classList.add("hidden");
        if (titleEl) titleEl.innerText = "ลงทะเบียนสำหรับนักเรียน";
        if (subtitleEl) subtitleEl.innerText = "กรอกข้อมูลเพื่อสร้างบัญชีใหม่";
    } else {
        // แสดงฟอร์ม login, แสดง tab bar
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        if (tabBar) tabBar.classList.remove("hidden");

        if (type === "student") {
            // activate นักเรียน tab
            tabStudent.classList.add("border-blue-600", "text-blue-600");
            tabStudent.classList.remove("border-transparent", "text-slate-500");
            tabAdmin.classList.remove("border-blue-600", "text-blue-600");
            tabAdmin.classList.add("border-transparent", "text-slate-500");
            if (titleEl) titleEl.innerText = "เข้าสู่ระบบสำหรับนักเรียน";
            if (subtitleEl) subtitleEl.innerText = "ใช้รหัสนักเรียนและรหัสผ่านของคุณเพื่อเข้าใช้งาน";
            if (passwordLabel) passwordLabel.innerText = "รหัสผ่าน";
            if (btnText) btnText.innerText = "เข้าสู่ระบบตอนนี้";
            if (registerLink) registerLink.classList.remove("hidden");
            if (forgotLink) forgotLink.classList.remove("hidden");
        } else {
            // admin tab
            tabAdmin.classList.add("border-blue-600", "text-blue-600");
            tabAdmin.classList.remove("border-transparent", "text-slate-500");
            tabStudent.classList.remove("border-blue-600", "text-blue-600");
            tabStudent.classList.add("border-transparent", "text-slate-500");
            if (titleEl) titleEl.innerText = "เข้าสู่ระบบแอดมิน";
            if (subtitleEl) subtitleEl.innerText = "สำหรับผู้ดูแลระบบเท่านั้น";
            if (passwordLabel) passwordLabel.innerText = "รหัสผ่านแอดมิน";
            if (btnText) btnText.innerText = "เข้าสู่ระบบแอดมิน";
            if (registerLink) registerLink.classList.add("hidden");
            if (forgotLink) forgotLink.classList.add("hidden");
        }
    }
    lucide.createIcons();
}

// === GRADUATION YEAR AUTO-CALC ===
// ปีปัจจุบันของระบบ (พ.ศ. 2569)
const CURRENT_YEAR_TH = 2569;

/**
 * calcGraduationYear()
 * คำนวณปีที่เข้า-จบจากระดับชั้น
 * ม.1-ม.3: คำนวณทันที (โรงเรียนเดียวต่อเนื่อง)
 * ม.4-ม.6: แสดงช่องเลือกว่าเข้าตั้งแต่ ม.1 หรือ ม.4 ก่อนแล้วคำนวณ
 */
function calcGraduationYear() {
    const gradYearInput = document.getElementById("auth-grad-year");
    const startYearInput = document.getElementById("auth-start-year");
    const gradeSelect = document.getElementById("auth-grade");
    const entryLevelWrap = document.getElementById("entry-level-wrap");
    if (!gradYearInput || !gradeSelect) return;

    const gradeVal = gradeSelect.value; // "ม.1" … "ม.6"
    const gradeMatch = gradeVal.match(/(\d+)/);
    const gradeNum = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

    // ซ่อน/ล้างช่องเลือกระดับชั้นที่เข้า (เป็น null เมื่อไม่ใช่ ม.4-ม.6)
    window._entryGrade = null;
    if (entryLevelWrap) entryLevelWrap.classList.add("hidden");

    if (!gradeNum) {
        gradYearInput.value = "";
        if (startYearInput) startYearInput.value = "";
        delete gradYearInput.dataset.gradYearNum;
        if (startYearInput) delete startYearInput.dataset.startYearNum;
        gradYearInput.placeholder = "เลือกระดับชั้นเพื่อคำนวณอัตโนมัติ";
        return;
    }

    // --- ม.4-ม.6: ต้องเลือกก่อนว่าเข้ามาตั้งแต่ ม.1 หรือ ม.4 ---
    if (gradeNum >= 4) {
        gradYearInput.value = "";
        if (startYearInput) startYearInput.value = "";
        delete gradYearInput.dataset.gradYearNum;
        if (startYearInput) delete startYearInput.dataset.startYearNum;
        if (entryLevelWrap) entryLevelWrap.classList.remove("hidden");
        // เคลียร์ radio
        const radios = document.getElementsByName("entry-grade");
        for (const r of radios) r.checked = false;
        return;
    }

    // --- ม.1-ม.3: ใช้ค่าตายตัว (Hardcode) อิงจาก currentYear = 2569 ---
    if (gradeNum === 1) {
        endYear = 2575;  // currentYear + 6
        startYear = 2569; // currentYear
    } else if (gradeNum === 2) {
        endYear = 2574;  // currentYear + 5
        startYear = 2568; // currentYear - 1
    } else if (gradeNum === 3) {
        endYear = 2573;  // currentYear + 4
        startYear = 2567; // currentYear - 2
    }

    gradYearInput.value = `พ.ศ. ${endYear}`;
    gradYearInput.dataset.gradYearNum = endYear;

    if (startYearInput) {
        startYearInput.value = `พ.ศ. ${startYear}`;
        startYearInput.dataset.startYearNum = startYear;
    }

    const hintEl = document.getElementById("auth-year-hint");
    if (hintEl) hintEl.classList.add("hidden");
}

/**
 * onEntryGradeChange()
 * เรียกเมื่อผู้ใช้เลือกระดับชั้นที่เข้ามา (สำหรับ ม.4-ม.6)
 */
function onEntryGradeChange() {
    const gradYearInput = document.getElementById("auth-grad-year");
    const startYearInput = document.getElementById("auth-start-year");
    const gradeSelect = document.getElementById("auth-grade");
    if (!gradYearInput || !gradeSelect) return;

    const gradeVal = gradeSelect.value;
    const gradeMatch = gradeVal.match(/(\d+)/);
    const gradeNum = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

    const entryRadios = document.getElementsByName("entry-grade");
    let entryGrade = null;
    for (const r of entryRadios) {
        if (r.checked) { entryGrade = parseInt(r.value, 10); break; }
    }

    if (!gradeNum || !entryGrade) return;

    let endYear, startYear;

    if (gradeNum === 4) {
        endYear = 2572;
        startYear = entryGrade === 1 ? 2566 : 2569;
    } else if (gradeNum === 5) {
        endYear = 2571;
        startYear = entryGrade === 1 ? 2565 : 2568;
    } else if (gradeNum === 6) {
        endYear = 2570;
        startYear = entryGrade === 1 ? 2564 : 2567;
    }

    gradYearInput.value = `พ.ศ. ${endYear}`;
    gradYearInput.dataset.gradYearNum = endYear;

    if (startYearInput) {
        startYearInput.value = `พ.ศ. ${startYear}`;
        startYearInput.dataset.startYearNum = startYear;
    }

    const hintEl = document.getElementById("auth-year-hint");
    if (hintEl) hintEl.classList.add("hidden");
}

// === LOGIN SUBMIT (นักเรียน + แอดมิน) — เชื่อม Backend จริง ===
async function handleAuthSubmit(e) {
    e.preventDefault();
    const idVal = document.getElementById("auth-student-id").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorMsgDiv = document.getElementById("auth-error-msg");
    const errorTextSpan = document.getElementById("auth-error-text");
    errorMsgDiv.classList.add("hidden");

    const showErr = (msg) => { errorTextSpan.innerText = msg; errorMsgDiv.classList.remove("hidden"); };

    if (!idVal) { showErr(authTab === "admin" ? "กรุณากรอกชื่อผู้ใช้แอดมิน" : "กรุณากรอกรหัสนักเรียน"); return; }
    if (!password) { showErr("กรุณากรอกรหัสผ่าน"); return; }

    try {
        if (authTab === "admin") {
            // เข้าสู่ระบบแอดมิน (ตรวจรหัสผ่าน bcrypt ฝั่ง Backend + ออก JWT role=admin)
            const res = await ApiClient.loginAdmin(idVal, password);
            ApiClient.Auth.setToken(res.token);
            currentUser = { id: res.data.username, name: res.data.admin_name || res.data.username, grade: "ผู้ดูแลระบบ", role: "admin" };
        } else {
            if (idVal.length !== 5) { showErr("รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก"); return; }
            // เข้าสู่ระบบนักเรียน (ตรวจรหัสผ่าน bcrypt ฝั่ง Backend + ออก JWT)
            const res = await ApiClient.loginStudent(idVal, password);
            ApiClient.Auth.setToken(res.data.token);
            const s = res.data.student;
            currentUser = { id: s.student_id, name: s.student_name, grade: s.student_class, role: "student", voted: false };
        }
        ApiClient.Auth.setUser(currentUser);
        closeAuthModal();
        await loadElectionData();
        updateUI();
        if (currentUser.role === "admin") loadAdminStudents();
    } catch (err) {
        showErr(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
}

// === REGISTER SUBMIT (นักเรียนใหม่) ===
function handleRegisterSubmit(e) {
    e.preventDefault();
    const errorMsgDiv = document.getElementById("auth-reg-error-msg");
    const errorTextSpan = document.getElementById("auth-reg-error-text");
    errorMsgDiv.classList.add("hidden");

    const nameInput = document.getElementById("auth-name").value.trim();
    const studentId = document.getElementById("auth-reg-student-id").value.trim();
    const password = document.getElementById("auth-reg-password").value;
    const confirmPassword = document.getElementById("auth-confirm-password").value;
    const gradeInput = document.getElementById("auth-grade").value;
    const gradYearEl = document.getElementById("auth-grad-year");
    const startYearEl = document.getElementById("auth-start-year");
    
  // ดูดตัวเลขจากช่อง Input โดยตรง
    const gradYear = (gradYearEl && gradYearEl.value) ? parseInt(gradYearEl.value.replace(/\D/g, ''), 10) : null;
    const startYear = (startYearEl && startYearEl.value) ? parseInt(startYearEl.value.replace(/\D/g, ''), 10) : null;

    console.log("ปีที่เข้า:", startYear, "| ปีที่จบ:", gradYear);

    // 🚨 เติม 3 บรรทัดนี้ลงไปตรงนี้เลยครับ! 🚨
    console.log("=== ตรวจกระเป๋าก่อนส่ง API ===");
    console.log("startYear ที่ดึงมาได้คือ:", startYear);
    console.log("gradYear ที่ดึงมาได้คือ:", gradYear);

    if (!nameInput) {
        // ... โค้ดเดิมยาวๆ ... {
        errorTextSpan.innerText = "กรุณากรอกชื่อและนามสกุลจริงของคุณ";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    if (studentId.length !== 5) {
        errorTextSpan.innerText = "รหัสนักเรียนต้องประกอบด้วยตัวเลข 5 หลักเท่านั้น";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    if (!gradYear) {
        errorTextSpan.innerText = "กรุณาเลือกระดับชั้นเพื่อคำนวณปีที่จบการศึกษา";
        errorMsgDiv.classList.remove("hidden");
        document.getElementById("auth-grade").focus();
        return;
    }
    if (password.length < 6) {
        errorTextSpan.innerText = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    if (password !== confirmPassword) {
        errorTextSpan.innerText = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง";
        errorMsgDiv.classList.remove("hidden");
        const confirmEl = document.getElementById("auth-confirm-password");
        confirmEl.classList.add("border-red-400");
        setTimeout(() => confirmEl.classList.remove("border-red-400"), 800);
        return;
    }
    // ส่งไปลงทะเบียนที่ Backend (Hash รหัสผ่านด้วย bcrypt ฝั่งเซิร์ฟเวอร์) แล้วล็อกอินอัตโนมัติ
    (async () => {
        try {
            await ApiClient.registerStudent({
                student_id: studentId,
                student_name: nameInput,
                student_class: gradeInput,
                start_year: startYear,
                end_year: gradYear,
                password,
                confirm_password: confirmPassword,
            });
            // ลงทะเบียนสำเร็จ -> ล็อกอินทันที
            const res = await ApiClient.loginStudent(studentId, password);
            ApiClient.Auth.setToken(res.data.token);
            const s = res.data.student;
            currentUser = { id: s.student_id, name: s.student_name, grade: s.student_class, role: "student", voted: false };
            ApiClient.Auth.setUser(currentUser);
            closeAuthModal();
            await loadElectionData();
            updateUI();
        } catch (err) {
            errorTextSpan.innerText = err.message || "ลงทะเบียนไม่สำเร็จ";
            errorMsgDiv.classList.remove("hidden");
        }
    })();
}

// === PASSWORD VISIBILITY & STRENGTH ===

/**
 * togglePasswordVisibility(inputId, iconId)
 * สลับแสดง/ซ่อนรหัสผ่านในช่อง input และเปลี่ยนไอคอนตา
 */
function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (icon) icon.setAttribute("data-lucide", "eye-off");
    } else {
        input.type = "password";
        if (icon) icon.setAttribute("data-lucide", "eye");
    }
    lucide.createIcons();
}

/**
 * checkPasswordStrength(password)
 * คืนค่า object { score: 0-4, label: string, color: string }
 * ระดับ: 0=อ่อนมาก, 1=อ่อน, 2=ปานกลาง, 3=แข็งแกร่ง, 4=แข็งแกร่งมาก
 */
function checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "bg-slate-200" };
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Normalize to 4 bars
    const normalizedScore = Math.min(4, score);
    const levels = [
        { label: "อ่อนมาก", color: "bg-red-500" },
        { label: "อ่อน", color: "bg-orange-400" },
        { label: "ปานกลาง", color: "bg-yellow-400" },
        { label: "แข็งแกร่ง", color: "bg-emerald-500" },
        { label: "แข็งแกร่งมาก", color: "bg-emerald-600" }
    ];
    return { score: normalizedScore, label: levels[normalizedScore].label, color: levels[normalizedScore].color };
}

/**
 * onPasswordInput()
 * เรียกเมื่อพิมรหัสผ่านในช่องลงทะเบียน → อัปเดต strength meter
 */
function onPasswordInput() {
    const pw = document.getElementById("auth-reg-password") ? document.getElementById("auth-reg-password").value : "";
    const strengthWrap = document.getElementById("password-strength-wrap");
    const label = document.getElementById("strength-label");
    if (!strengthWrap) return;

    if (authTab !== "register") return;

    if (!pw) {
        strengthWrap.classList.add("hidden");
        return;
    }
    strengthWrap.classList.remove("hidden");

    const result = checkPasswordStrength(pw);
    const bars = [
        document.getElementById("str-bar-1"),
        document.getElementById("str-bar-2"),
        document.getElementById("str-bar-3"),
        document.getElementById("str-bar-4"),
    ];
    bars.forEach((bar, i) => {
        if (!bar) return;
        bar.className = "strength-bar h-1 flex-1 rounded-full transition-all";
        if (i < result.score) {
            bar.classList.add(result.color);
        } else {
            bar.classList.add("bg-slate-200");
        }
    });
    if (label) {
        label.innerText = result.label;
        label.className = `text-[11px] font-medium ${result.score <= 1 ? "text-red-500" :
            result.score === 2 ? "text-yellow-500" : "text-emerald-600"
            }`;
    }
}

function logout() {
    currentUser = null;
    ApiClient.Auth.clear();
    document.getElementById("tab-candidate-panel").classList.add("hidden");
    document.getElementById("tab-admin").classList.add("hidden");
    if (currentTab === "candidate-panel" || currentTab === "admin") {
        switchTab("home");
    } else {
        updateUI();
    }
}

// === 4. APPS CORE & UI RENDERING SERVICES ===
function updateUI() {

    const dot = document.getElementById("nav-election-status-dot");
    const statusText = document.getElementById("nav-election-status");
    const votingBadge = document.getElementById("voting-badge-status");
    const navPill = document.getElementById("nav-status-pill");

    if (isElectionOpen) {
        dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
        statusText.innerText = "เปิดลงคะแนนอยู่";
        statusText.className = "text-emerald-100 font-medium";
        if (navPill) navPill.className = "flex items-center space-x-2 bg-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors";
        votingBadge.className = "bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1";
        votingBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> เปิดให้ลงคะแนน`;
    } else {
        // ปิดหีบ -> แถบสถานะมุมขวาเป็นสีแดงชัดเจน
        dot.className = "w-2.5 h-2.5 rounded-full bg-white";
        statusText.innerText = "ปิดการลงคะแนนเสียงแล้ว";
        statusText.className = "text-white font-bold";
        if (navPill) navPill.className = "flex items-center space-x-2 bg-red-600 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-lg ring-2 ring-red-300/50";
        votingBadge.className = "bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1";
        votingBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> ปิดรับสิทธิ์โหวต`;
    }

    // แบนเนอร์แดงเต็มหน้าจอเมื่อปิดหีบ + ซ่อนแบนเนอร์นับถอยหลัง
    const closedBanner = document.getElementById("election-closed-banner");
    const countdownBanner = document.getElementById("election-countdown-banner");
    if (!isElectionOpen) {
        if (closedBanner) closedBanner.classList.remove("hidden");
        if (countdownBanner) countdownBanner.classList.add("hidden");
    } else {
        if (closedBanner) closedBanner.classList.add("hidden");
    }
    /* =========================
       REALTIME VOTE PERCENT
    ========================= */

    // สถิติจาก Backend (ถ้ามี) มิฉะนั้น fallback เป็นการคำนวณจากข้อมูลในหน่วยความจำ
    const stats = window.__stats;
    const totalStudents = stats ? Number(stats.total_eligible) : TOTAL_ELIGIBLE_VOTERS;
    const totalVoted = stats ? Number(stats.voted_count) : students.filter(s => s.voted).length;
    const percent = stats
        ? Number(stats.percent_voted)
        : (totalStudents > 0 ? ((totalVoted / totalStudents) * 100).toFixed(2) : 0);
    // งดออกเสียง = ผู้กดงดออกเสียงจริง (เริ่มต้น 0 เพิ่มตามจริง) จาก backend
    const noVoteCount = stats ? Number(stats.abstain_count || 0) : 0;

    // อัปเดตการ์ดสถิติด่วน (หน้าหลัก)
    document.getElementById("stat-total-votes").innerText = totalVoted;
    document.getElementById("stat-percent-votes").innerText = percent + "%";

    // อัปเดตหน้าผลการเลือกตั้ง — กราฟวงกลม
    const circle = document.getElementById("vote-circle");
    if (circle) {
        const circumference = 628;
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    const circlePercent = document.getElementById("circle-percent");
    if (circlePercent) {
        circlePercent.innerText = percent + "%";
    }

    // อัปเดตกริดสถิติ 3 ช่อง (บน)
    document.getElementById("result-total-voters").innerText = totalStudents + " คน";
    document.getElementById("result-voted-count").innerText = totalVoted + " คน";
    document.getElementById("result-percent").innerText = percent + "%";

    // อัปเดตกริดสถิติ 3 ช่อง (ล่าง)
    document.getElementById("result-total-voters-2").innerText = totalStudents + " คน";
    document.getElementById("result-voted-count-2").innerText = totalVoted + " คน";
    document.getElementById("result-novote-count").innerText = noVoteCount + " คน";

    const candTab = document.getElementById("tab-candidate-panel");
    const adminTab = document.getElementById("tab-admin");
    if (currentUser) {
        if (currentUser.role === "admin") {
            adminTab.classList.remove("hidden");
        } else {
            adminTab.classList.add("hidden");
        }
        const isCandidate = candidates.some(c => c.name === currentUser.name && c.approved);
        if (isCandidate) {
            candTab.classList.remove("hidden");
        } else {
            candTab.classList.add("hidden");
        }
    } else {
        adminTab.classList.add("hidden");
        candTab.classList.add("hidden");
    }

    renderNavbarProfile();
    renderUserStatusCard();
    renderVotingArea();
    renderJoinCandidateBtn();
    renderCandidatesGrid();
    // โหลดประวัติ Vote Receipt ก่อนแสดงผล Admin Panel (fire-and-forget)
    loadVoteReceiptLogs();
    renderAdminPanel();
    renderWinnerResults();
    lucide.createIcons();
}

function renderNavbarProfile() {
    const container = document.getElementById("user-profile-nav");
    if (currentUser) {
        container.innerHTML = `
      <div class="flex items-center space-x-3 bg-blue-950/60 p-1.5 pr-4 rounded-full border border-blue-800">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase">
          ${currentUser.name.charAt(0)}
        </div>
        <div class="text-left">
          <span class="block text-xs font-semibold max-w-[120px] truncate">${currentUser.name}</span>
          <span class="block text-[10px] text-blue-300 -mt-0.5">${currentUser.role === 'admin' ? 'ผู้ดูแลระบบ' : currentUser.grade}</span>
        </div>
        <button onclick="logout()" class="text-blue-300 hover:text-white transition pl-1.5" title="ออกจากระบบ">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>
    `;
    } else {
        container.innerHTML = `
      <button onclick="openAuthModal()" class="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-md flex items-center gap-1.5">
        <i data-lucide="user" class="w-4 h-4"></i> เข้าสู่ระบบ / ลงทะเบียน
      </button>
    `;
    }
}

function renderUserStatusCard() {
    const card = document.getElementById("user-status-card");
    if (!currentUser) {
        card.innerHTML = `
      <div class="text-center py-4">
        <i data-lucide="fingerprint" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
        <h4 class="font-bold text-slate-800 text-sm mb-1">ยังไม่ได้เข้าสู่ระบบ</h4>
        <p class="text-xs text-slate-500 mb-4">เข้าสู่ระบบเพื่อใช้สิทธิ์เลือกตั้งสภานักเรียน</p>
        <button onclick="openAuthModal()" class="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2.5 rounded-xl text-xs transition border border-blue-200">
          คลิกเพื่อเข้าสู่ระบบ
        </button>
      </div>
    `;
    } else {
        const hasVoted = currentUser.voted;
        const votedChoice = hasVoted ? (currentUser.votedFor === "no-vote" ? "งดออกเสียง" : `ผู้สมัครหมายเลข ${currentUser.votedFor}`) : "ยังไม่ได้ใช้สิทธิ์";
        card.innerHTML = `
      <h3 class="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
        <i data-lucide="user-check" class="w-4 h-4 text-blue-600"></i> สิทธิ์และผู้ใช้งานปัจจุบัน
      </h3>
      <div class="space-y-3.5 text-xs text-slate-600">
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>ผู้ใช้งาน:</span>
          <span class="font-semibold text-slate-800">${currentUser.name}</span>
        </div>
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>รหัสนักเรียน:</span>
          <span class="font-mono font-medium text-slate-800">${currentUser.id}</span>
        </div>
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>ระดับชั้นเรียน:</span>
          <span class="font-semibold text-slate-800">${currentUser.grade}</span>
        </div>
        ${currentUser.entryYear ? `
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>ปีที่เข้าศึกษา:</span>
          <span class="font-semibold text-slate-800">พ.ศ. ${currentUser.entryYear}</span>
        </div>
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>ปีที่จบการศึกษา:</span>
          <span class="font-semibold text-emerald-700">พ.ศ. ${currentUser.gradYear}</span>
        </div>` : ''}
        <div class="flex justify-between border-b border-slate-50 pb-2">
          <span>สิทธิ์โหวต (1สิทธิ์):</span>
          <span class="${hasVoted ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'} flex items-center gap-1">
            <i data-lucide="${hasVoted ? 'check-circle' : 'alert-circle'}" class="w-3.5 h-3.5"></i>
            ${hasVoted ? 'ใช้สิทธิ์เรียบร้อย' : 'ยังไม่ใช้สิทธิ์'}
          </span>
        </div>
        ${hasVoted ? `
        <div class="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
          <i data-lucide="lock" class="w-4 h-4 text-emerald-600"></i>
          <div>
            <span class="text-[10px] text-slate-500 block">สัญลักษณ์ยืนยันการโหวตความปลอดภัย:</span>
            <span class="font-mono text-[10px] text-emerald-800 font-bold">VOTE-OK-${currentUser.id}-SECURE</span>
          </div>
        </div>` : ''}
      </div>
    `;
    }
}

function renderVotingArea() {
    const area = document.getElementById("voting-area");

    // ✅ เช็ก "ปิดหีบ" ก่อนเสมอ — ไม่ว่าจะล็อกอินหรือยัง ต้องเห็นสถานะปิดหีบสีแดง
    if (!isElectionOpen) {
        area.innerHTML = `
      <div class="text-center py-10 bg-red-50 rounded-xl border-2 border-red-200 text-red-900">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="lock" class="w-9 h-9 text-red-600"></i>
        </div>
        <h4 class="font-bold text-xl mb-1">ปิดหีบรับคะแนนแล้ว</h4>
        <p class="text-sm text-red-700 mb-4 max-w-sm mx-auto">ขณะนี้ระบบปิดรับการลงคะแนนเสียง ไม่สามารถโหวตได้</p>
        <button onclick="switchTab('results')" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-lg mx-auto">
          ดูสรุปผลคะแนน
        </button>
      </div>
    `;
        return;
    }

    if (!currentUser) {
        area.innerHTML = `
      <div class="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <i data-lucide="lock" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
        <h4 class="font-bold text-slate-800 mb-1">กรุณาเข้าสู่ระบบก่อนลงคะแนนเสียง</h4>
        <p class="text-xs text-slate-400 mb-4 max-w-sm mx-auto">ทางสภานักเรียนกำหนดสิทธิ์เฉพาะนักเรียนที่ระบุตัวตนถูกต้องเท่านั้น</p>
        <button onclick="openAuthModal()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-lg flex items-center gap-1.5 mx-auto">
          <i data-lucide="log-in" class="w-4 h-4"></i> ลงทะเบียนสิทธิ์ / เข้าสู่ระบบ
        </button>
      </div>
    `;
        return;
    }

    if (currentUser.voted) {
        area.innerHTML = `
      <div class="text-center py-10 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i data-lucide="badge-check" class="w-10 h-10 text-emerald-600"></i>
        </div>
        <h4 class="font-bold text-lg mb-1">ลงทะเบียนสิทธิ์และโหวตสำเร็จ!</h4>
        <p class="text-xs text-emerald-700 mb-4 max-w-sm mx-auto">ขอขอบคุณที่ร่วมใช้สิทธิ์ของคุณ</p>
        <button onclick="switchTab('results')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-lg mx-auto">
          ดูผลสถิติความก้าวหน้า
        </button>
      </div>
    `;
        return;
    }

    const approvedCandidates = candidates.filter(c => c.approved);
    let listHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">`;
    approvedCandidates.forEach(cand => {
        listHTML += `
      <div class="border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition bg-white">
        <div class="flex items-center gap-3">
          <span class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0"><i data-lucide="user-round" class="w-6 h-6"></i></span>
          <div>
            <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">หมายเลข ${cand.id}</span>
            <h4 class="font-bold text-slate-800 text-sm mt-1 leading-tight">${cand.name}</h4>
            <span class="text-[10px] text-slate-400 block">${cand.party}</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button onclick="openPolicyModal(${cand.id})" class="text-slate-400 hover:text-blue-600 text-xs flex items-center gap-1 transition">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> ตรวจสอบนโยบาย
          </button>
          <button onclick="promptVote(${cand.id})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
            เลือกผู้สมัคร
          </button>
        </div>
      </div>
    `;
    });

    listHTML += `
    <div class="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col justify-between hover:border-slate-400 hover:bg-slate-50 transition">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
          <i data-lucide="slash" class="w-6 h-6"></i>
        </div>
        <div>
          <span class="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">ไม่เลือกใคร</span>
          <h4 class="font-bold text-slate-800 text-sm mt-1">งดออกเสียง (No Vote)</h4>
          <span class="text-[10px] text-slate-400 block">สิทธิ์ในการงดออกความเห็นเสรี</span>
        </div>
      </div>
      <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
        <button onclick="promptVote('no-vote')" class="bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
          เลือกงดออกเสียง
        </button>
      </div>
    </div>
  `;
    listHTML += `</div>`;
    area.innerHTML = listHTML;
}

function renderJoinCandidateBtn() {
    const area = document.getElementById("join-candidate-btn-area");
    if (!currentUser) { area.innerHTML = ''; return; }

    if (currentUser.role === "admin") {
        area.innerHTML = `
      <button onclick="openCandidateRegModal()" class="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5">
        <i data-lucide="user-plus" class="w-4 h-4"></i> เพิ่มผู้สมัคร (Admin)
      </button>
    `;
    } else {
        area.innerHTML = '';
    }
}

function renderCandidatesGrid() {
    const grid = document.getElementById("candidates-grid");
    const approvedCandidates = candidates.filter(c => c.approved);
    if (approvedCandidates.length === 0) {
        grid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
        <i data-lucide="users" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
        <p class="text-slate-500 text-sm">ยังไม่มีผู้สมัครที่ได้รับการอนุมัติอย่างเป็นทางการในตอนนี้</p>
      </div>
    `;
        return;
    }

    let gridHTML = "";
    approvedCandidates.forEach(cand => {
        gridHTML += `
      <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between mb-4">
            <span class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><i data-lucide="user-round" class="w-7 h-7"></i></span>
            <span class="bg-blue-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm">เบอร์ ${cand.id}</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 leading-tight">${cand.name} (${cand.grade})</h3>
          <span class="text-xs text-blue-600 font-medium block mt-1 mb-3">${cand.party}</span>
          <p class="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed italic">"${cand.slogan}"</p>
        </div>
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
          <span class="text-[10px] text-slate-400">ผู้รับรองสิทธิ์โรงเรียน</span>
          <button onclick="openPolicyModal(${cand.id})" class="text-blue-600 hover:text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition">
            ดูนโยบายโดดเด่น <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        ${currentUser && currentUser.role === "admin" ? `
        <div class="mt-3 pt-3 border-t border-dashed border-slate-200 flex items-center gap-2">
          <button onclick="openEditPartyModal(${cand.candidate_id})" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold py-1.5 rounded-lg transition flex items-center justify-center gap-1">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> แก้ไขพรรค
          </button>
          <button onclick="deleteParty(${cand.candidate_id}, '${(cand.party || '').replace(/'/g, "\\'")}')" class="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-1.5 rounded-lg transition flex items-center justify-center gap-1">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> ลบพรรค
          </button>
        </div>` : ''}
      </div>
    `;
    });
    grid.innerHTML = gridHTML;
}

// ข้อ 4: แสดงผลผู้ชนะหลังปิดหีบเท่านั้น
function renderWinnerResults() {
    const winnerSection = document.getElementById("winner-announcement");
    const lockedMsg = document.getElementById("results-locked-msg");
    if (!winnerSection || !lockedMsg) return;

    if (isElectionOpen) {
        // ยังไม่ปิดหีบ — ซ่อนผล แสดงข้อความล็อก
        winnerSection.classList.add("hidden");
        lockedMsg.classList.remove("hidden");
        return;
    }

    // ปิดหีบแล้ว — แสดงผล
    lockedMsg.classList.add("hidden");
    winnerSection.classList.remove("hidden");

    const titleEl = document.getElementById("election-title-display");
    if (titleEl) titleEl.innerText = electionTitle;

    const approvedCands = candidates.filter(c => c.approved);
    const sorted = [...approvedCands].sort((a, b) => b.votes - a.votes);
    const totalCandVotes = sorted.reduce((s, c) => s + c.votes, 0);
    // งดออกเสียง จาก backend (จำนวนบัตรที่กดงดออกเสียงจริง)
    const noVoteCount = Number((window.__stats && window.__stats.abstain_count) || 0);
    const totalAllVotes = totalCandVotes + noVoteCount;

    const rankColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
    const medals = rankColors.map(c => `<i data-lucide="medal" class="w-7 h-7 ${c}"></i>`);
    const rankBadge = (idx) => medals[idx] || `<span class="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center">${idx + 1}</span>`;
    const barColors = ["bg-amber-400", "bg-slate-400", "bg-amber-700", "bg-blue-500", "bg-indigo-500"];

    // --- ลำดับผู้ชนะ ---
    const winnerList = document.getElementById("winner-list");
    if (!winnerList) return;
    if (sorted.length === 0) {
        winnerList.innerHTML = `<p class="text-center text-slate-400 text-sm py-4">ยังไม่มีผู้สมัครในระบบ</p>`;
    } else {
        winnerList.innerHTML = sorted.map((cand, idx) => {
            const pct = totalAllVotes > 0 ? ((cand.votes / totalAllVotes) * 100).toFixed(1) : 0;
            const isWinner = idx === 0 && cand.votes > 0;
            return `
        <div class="flex items-center gap-4 p-4 rounded-2xl border ${isWinner ? 'border-amber-300 bg-amber-50' : 'border-slate-100 bg-slate-50'}">
          <span class="flex items-center justify-center w-9">${rankBadge(idx)}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-900 text-sm">${cand.name}</span>
              <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">เบอร์ ${cand.id}</span>
              ${isWinner ? `<span class="text-[10px] bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold animate-pulse inline-flex items-center gap-1"><i data-lucide="trophy" class="w-3 h-3"></i> ผู้ชนะ!</span>` : ''}
            </div>
            <span class="text-xs text-slate-500">${cand.party}</span>
          </div>
          <div class="text-right flex-shrink-0">
            <span class="block text-xl font-bold ${isWinner ? 'text-amber-600' : 'text-slate-700'}">${cand.votes.toLocaleString()}</span>
            <span class="text-xs text-slate-400">คะแนน (${pct}%)</span>
          </div>
        </div>
      `;
        }).join("");
    }

    // --- กราฟแท่ง ---
    const winnerBars = document.getElementById("winner-bars");
    if (!winnerBars) return;
    let barsHTML = sorted.map((cand, idx) => {
        const pct = totalAllVotes > 0 ? ((cand.votes / totalAllVotes) * 100).toFixed(1) : 0;
        return `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
          <span class="inline-flex items-center gap-1.5">${rankBadge(idx)} ${cand.name} <span class="text-slate-400 font-normal">(เบอร์ ${cand.id})</span></span>
          <span>${cand.votes.toLocaleString()} คะแนน — ${pct}%</span>
        </div>
        <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full transition-all duration-700 ${barColors[idx % barColors.length]}" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
    }).join("");

    // งดออกเสียง
    if (noVoteCount > 0) {
        const novPct = totalAllVotes > 0 ? ((noVoteCount / totalAllVotes) * 100).toFixed(1) : 0;
        barsHTML += `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-500 mb-1">
          <span class="inline-flex items-center gap-1.5"><i data-lucide="ban" class="w-3.5 h-3.5"></i> งดออกเสียง</span>
          <span>${noVoteCount.toLocaleString()} คน — ${novPct}%</span>
        </div>
        <div class="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full rounded-full bg-slate-300 transition-all duration-700" style="width: ${novPct}%"></div>
        </div>
      </div>
    `;
    }
    winnerBars.innerHTML = barsHTML;
}

/**
 * ดึงประวัติ Vote Receipt จากฐานข้อมูลมาแสดงใน Audit Log
 */
async function loadVoteReceiptLogs() {
    if (!currentUser || currentUser.role !== "admin") return;
    if (!currentEventId) return;
    try {
        const res = await ApiClient.adminAnalytics(currentEventId);
        const receipts = res.vote_receipts || [];
        // แปลงเป็นรูปแบบเดียวกับ auditLogs เดิม
        auditLogs = receipts.map(r => ({
            voterId: r.vote_receipt,
            timestamp: new Date(r.voted_at).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
        }));
    } catch (err) {
        console.warn("loadVoteReceiptLogs error:", err);
    }
}

function renderAdminPanel() {
    const tbody = document.getElementById("admin-students-tbody");
    const auditLogsContainer = document.getElementById("admin-audit-logs");
    const toggleBtn = document.getElementById("admin-toggle-btn");
    const toggleText = document.getElementById("admin-toggle-text");

    if (isElectionOpen) {
        toggleBtn.className = "bg-red-700 hover:bg-red-600 font-medium px-4 py-2 rounded-xl text-xs transition flex items-center gap-2";
        toggleText.innerText = "ปิดหีบรับคะแนนเลือกตั้ง";
    } else {
        toggleBtn.className = "bg-emerald-600 hover:bg-emerald-500 font-medium px-4 py-2 rounded-xl text-xs transition flex items-center gap-2";
        toggleText.innerText = "เปิดหีบรับคะแนนเลือกตั้ง";
    }

    let tbodyHTML = "";
    students.forEach(student => {
        const isCandidate = candidates.some(c => c.name === student.name);
        const isCandidateApproved = candidates.some(c => c.name === student.name && c.approved);
        let statusBadge = '';
        if (isCandidateApproved) {
            statusBadge = `<span class="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">ผู้สมัครอนุมัติแล้ว</span>`;
        } else if (isCandidate && !isCandidateApproved) {
            statusBadge = `<span class="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">รอพิจารณา</span>`;
        } else {
            statusBadge = `<span class="text-slate-400 text-[10px]">นักเรียนทั่วไป</span>`;
        }
        tbodyHTML += `
      <tr>
        <td class="px-3 py-3 font-mono font-bold text-slate-800">${student.id}</td>
        <td class="px-3 py-3 font-medium text-slate-700">${student.name}</td>
        <td class="px-3 py-3">${student.grade}</td>
        <td class="px-3 py-3 text-right space-x-1">
          ${isCandidate && !isCandidateApproved ? `
          <button onclick="approveCandidate('${student.name}')" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[10px] font-semibold transition">
            อนุมัติสมัคร
          </button>` : ''}
          ${student.role !== 'admin' ? `
          <button onclick="deleteStudent('${student.id}')" class="text-red-500 hover:text-red-700 px-2 py-1 rounded text-[10px] font-semibold transition">
            ลบออก
          </button>` : '<span class="text-[10px] text-slate-400 italic">เจ้าหน้าที่</span>'}
        </td>
      </tr>
    `;
    });
    tbody.innerHTML = tbodyHTML;

    if (auditLogs.length === 0) {
        auditLogsContainer.innerHTML = `<p class="p-4 text-center text-xs text-slate-400">ยังไม่มีบันทึกข้อมูลโหวตใดๆ</p>`;
    } else {
        let logsHTML = "";
        auditLogs.forEach(log => {
            logsHTML += `
        <div class="p-3 text-xs flex justify-between items-center hover:bg-slate-50 transition">
          <div class="flex items-center gap-2">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-blue-600"></i>
            <div>
              <span class="font-bold text-slate-700">รหัสนักเรียนโหวต: SEC-SYS-${log.voterId}</span>
              <span class="text-[10px] text-slate-400 block">${log.timestamp}</span>
            </div>
          </div>
          <span class="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
            <span class="w-1 h-1 bg-emerald-500 rounded-full"></span> Secure Block
          </span>
        </div>
      `;
        });
        auditLogsContainer.innerHTML = logsHTML;
    }
}

// === 5. ACTIONS AND INTERACTION SERVICES ===
function openPolicyModal(candId) {
    const cand = candidates.find(c => c.id === candId);
    if (!cand) return;
    const modal = document.getElementById("policy-modal");
    const content = document.getElementById("policy-modal-content");
    let policiesHTML = "";
    cand.policies.forEach((policy, idx) => {
        policiesHTML += `
      <li class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <span class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">${idx + 1}</span>
        <p class="text-slate-700 text-sm leading-relaxed">${policy}</p>
      </li>
    `;
    });
    content.innerHTML = `
    <div class="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-6 relative">
      <button onclick="closePolicyModal()" class="absolute top-4 right-4 text-white hover:text-blue-200 transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="flex items-center gap-4">
        <span class="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><i data-lucide="user-round" class="w-7 h-7"></i></span>
        <div>
          <span class="bg-blue-600 text-blue-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">ผู้สมัครพรรค เบอร์ ${cand.id}</span>
          <h3 class="text-xl font-bold mt-1">${cand.name} (${cand.grade})</h3>
          <p class="text-xs text-blue-200">${cand.party}</p>
        </div>
      </div>
    </div>
    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">สโลแกนนำเสนอนักเรียน</h4>
        <p class="text-slate-800 italic font-medium leading-relaxed bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r-xl">"${cand.slogan}"</p>
      </div>
      <div>
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ชุดนโยบายการขับเคลื่อนหลัก</h4>
        <ul class="space-y-3">${policiesHTML}</ul>
      </div>
    </div>
    <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
      <button onclick="closePolicyModal()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow">
        เข้าใจนโยบายแล้ว
      </button>
    </div>
  `;
    modal.classList.remove("hidden");
    lucide.createIcons();
}

function closePolicyModal() {
    document.getElementById("policy-modal").classList.add("hidden");
}

function promptVote(candId) {
    if (!currentUser) return;
    selectedCandidateToVote = candId;
    // Open OTP verification modal first
    openOtpModal();
}

function closeVoteConfirmModal() {
    document.getElementById("vote-confirm-modal").classList.add("hidden");
    selectedCandidateToVote = null;
}

async function executeVote() {
    if (!currentUser || selectedCandidateToVote === null) return;

    // 'no-vote' (งดออกเสียง) ส่งเป็นค่า 'novote' — นับเป็นผู้มาใช้สิทธิ์ แต่ไม่ตรงเบอร์ใด
    const candidateNo = selectedCandidateToVote === "no-vote" ? "novote" : selectedCandidateToVote;

    try {
        const res = await ApiClient.submitVote(candidateNo, currentEnteredOtp, currentVoteToken);
        currentUser.voted = true;
        currentUser.votedFor = selectedCandidateToVote;
        ApiClient.Auth.setUser(currentUser);
        currentVoteToken = null;
        currentEnteredOtp = null;
        closeVoteConfirmModal();
        await loadElectionData();
        updateUI();
        // แสดง Popup สำเร็จพร้อม Receipt และนับถอยหลัง 15 วินาที
        showVoteSuccessPopup(res.receipt || "VOTE-SUCCESS");
    } catch (err) {
        closeVoteConfirmModal();
        if (err.status === 409) {
            currentUser.voted = true;
            ApiClient.Auth.setUser(currentUser);
            updateUI();
        }
        showAdminToast(err.message || "ลงคะแนนไม่สำเร็จ กรุณาลองใหม่");
    }
}

// === OTP EMAIL VERIFICATION ===
let otpCode = null;
let otpCountdownInterval = null;
let otpExpired = false;
let otpEmail = "";

function openOtpModal() {
    otpCode = null;
    otpExpired = false;
    otpEmail = "";
    clearOtpCountdown();
    document.getElementById("otp-email-input").value = "";
    document.getElementById("otp-email-error").classList.add("hidden");
    document.getElementById("otp-step-email").classList.remove("hidden");
    document.getElementById("otp-step-verify").classList.add("hidden");
    document.getElementById("otp-modal").classList.remove("hidden");
    lucide.createIcons();
    setTimeout(() => document.getElementById("otp-email-input").focus(), 100);
}

function closeOtpModal() {
    document.getElementById("otp-modal").classList.add("hidden");
    clearOtpCountdown();
    selectedCandidateToVote = null;
}

function clearOtpEmailError() {
    document.getElementById("otp-email-error").classList.add("hidden");
}

async function sendOtp() {
    const emailInput = document.getElementById("otp-email-input").value.trim();
    const errorDiv = document.getElementById("otp-email-error");
    const errorText = document.getElementById("otp-email-error-text");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailInput) {
        errorText.innerText = "กรุณากรอกอีเมลของคุณ";
        errorDiv.classList.remove("hidden");
        lucide.createIcons();
        return;
    }
    if (!emailRegex.test(emailInput)) {
        errorText.innerText = "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        errorDiv.classList.remove("hidden");
        lucide.createIcons();
        return;
    }

    otpEmail = emailInput;
    otpExpired = false;

    const btn = document.getElementById("otp-send-btn");
    const btnText = document.getElementById("otp-send-btn-text");
    btn.disabled = true;
    btn.classList.add("opacity-75", "cursor-not-allowed");
    btnText.innerText = "กำลังส่ง OTP...";

    try {
        // ขอ OTP จาก Backend (ออก voteToken ที่ถือ OTP ไว้ + ส่งอีเมลจริงถ้าตั้งค่าไว้)
        const res = await ApiClient.requestOtp(emailInput);
        currentVoteToken = res.voteToken;

        // โหมดสาธิต: Backend ส่ง devOtp กลับมาให้โชว์บนหน้าจอ (ถ้าตั้งค่าอีเมลจริงจะเป็น null)
        const devHint = document.getElementById("otp-dev-hint");
        if (res.devOtp) {
            document.getElementById("otp-dev-code").innerText = res.devOtp;
            if (devHint) devHint.classList.remove("hidden");
        } else if (devHint) {
            devHint.classList.add("hidden");
        }

        // Switch to verify step
        document.getElementById("otp-step-email").classList.add("hidden");
        document.getElementById("otp-step-verify").classList.remove("hidden");
        document.getElementById("otp-sent-to-email").innerText = res.email || otpEmail;

        document.querySelectorAll(".otp-digit").forEach(inp => {
            inp.value = "";
            inp.classList.remove("is-filled", "is-error");
        });
        document.getElementById("otp-verify-error").classList.add("hidden");
        document.getElementById("otp-countdown-wrap").classList.remove("hidden");
        document.getElementById("otp-expired-wrap").classList.add("hidden");

        startOtpCountdown(300);
        lucide.createIcons();
        document.querySelectorAll(".otp-digit")[0].focus();
    } catch (err) {
        errorText.innerText = err.message || "ขอรหัส OTP ไม่สำเร็จ";
        errorDiv.classList.remove("hidden");
        lucide.createIcons();
    } finally {
        btn.disabled = false;
        btn.classList.remove("opacity-75", "cursor-not-allowed");
        btnText.innerText = "ส่งรหัส OTP ไปยังอีเมล";
    }
}

async function resendOtp() {
    // ขอ OTP ใหม่จาก Backend (ออก voteToken ใหม่)
    try {
        const res = await ApiClient.requestOtp(otpEmail);
        currentVoteToken = res.voteToken;
        otpExpired = false;
        const devHint = document.getElementById("otp-dev-hint");
        if (res.devOtp) {
            document.getElementById("otp-dev-code").innerText = res.devOtp;
            if (devHint) devHint.classList.remove("hidden");
        } else if (devHint) {
            devHint.classList.add("hidden");
        }
        document.querySelectorAll(".otp-digit").forEach(inp => {
            inp.value = "";
            inp.classList.remove("is-filled", "is-error");
        });
        document.getElementById("otp-verify-error").classList.add("hidden");
        document.getElementById("otp-expired-wrap").classList.add("hidden");
        document.getElementById("otp-countdown-wrap").classList.remove("hidden");
        startOtpCountdown(300);
        document.querySelectorAll(".otp-digit")[0].focus();
    } catch (err) {
        showOtpVerifyError(err.message || "ขอรหัสใหม่ไม่สำเร็จ");
    }
}

function goBackToEmail() {
    clearOtpCountdown();
    document.getElementById("otp-step-verify").classList.add("hidden");
    document.getElementById("otp-step-email").classList.remove("hidden");
    lucide.createIcons();
}

function startOtpCountdown(seconds) {
    clearOtpCountdown();
    let remaining = seconds;
    const countdownEl = document.getElementById("otp-countdown");

    function tick() {
        const m = String(Math.floor(remaining / 60)).padStart(2, "0");
        const s = String(remaining % 60).padStart(2, "0");
        if (countdownEl) countdownEl.innerText = `${m}:${s}`;
        if (remaining <= 0) {
            clearOtpCountdown();
            otpExpired = true;
            document.getElementById("otp-countdown-wrap").classList.add("hidden");
            document.getElementById("otp-expired-wrap").classList.remove("hidden");
            lucide.createIcons();
        }
        remaining--;
    }
    tick();
    otpCountdownInterval = setInterval(tick, 1000);
}

function clearOtpCountdown() {
    if (otpCountdownInterval) {
        clearInterval(otpCountdownInterval);
        otpCountdownInterval = null;
    }
}

function verifyOtp() {
    if (otpExpired) {
        showOtpVerifyError("รหัส OTP หมดอายุแล้ว กรุณากดส่งรหัสใหม่");
        return;
    }
    const digits = document.querySelectorAll(".otp-digit");
    const entered = Array.from(digits).map(d => d.value).join("").trim();

    if (entered.length < 6) {
        showOtpVerifyError("กรุณากรอกรหัส OTP ให้ครบ 6 หลัก");
        digits.forEach(d => { if (!d.value) d.classList.add("is-error"); });
        return;
    }

    // เก็บ OTP ที่กรอกไว้ (Backend จะตรวจสอบตอนกดยืนยันลงคะแนนจริง)
    currentEnteredOtp = entered;

    // ปิดโมดัล OTP แล้วเปิดโมดัลยืนยันการโหวต
    clearOtpCountdown();
    document.getElementById("otp-modal").classList.add("hidden");

    const modal = document.getElementById("vote-confirm-modal");
    const confirmName = document.getElementById("confirm-candidate-name");
    if (selectedCandidateToVote === "no-vote") {
        confirmName.innerText = '"งดออกเสียง (No Vote)"';
    } else {
        const cand = candidates.find(c => c.id === selectedCandidateToVote);
        confirmName.innerText = `"${cand.name} (หมายเลข ${cand.id} - ${cand.party})"`;
    }
    modal.classList.remove("hidden");
}

function showOtpVerifyError(msg) {
    document.getElementById("otp-verify-error-text").innerText = msg;
    document.getElementById("otp-verify-error").classList.remove("hidden");
    lucide.createIcons();
}

// OTP digit box keyboard navigation
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("input", function (e) {
        if (!e.target.classList.contains("otp-digit")) return;
        const input = e.target;
        const val = input.value.replace(/\D/g, "");
        input.value = val ? val[val.length - 1] : "";
        if (input.value) {
            input.classList.add("is-filled");
            input.classList.remove("is-error");
            const idx = parseInt(input.dataset.index);
            const next = document.querySelector(`.otp-digit[data-index="${idx + 1}"]`);
            if (next) next.focus();
        } else {
            input.classList.remove("is-filled");
        }
    });

    document.addEventListener("keydown", function (e) {
        if (!e.target.classList.contains("otp-digit")) return;
        const input = e.target;
        const idx = parseInt(input.dataset.index);
        if (e.key === "Backspace" && !input.value) {
            const prev = document.querySelector(`.otp-digit[data-index="${idx - 1}"]`);
            if (prev) { prev.value = ""; prev.classList.remove("is-filled"); prev.focus(); }
        }
        if (e.key === "Enter") verifyOtp();
    });

    // Allow paste into first digit
    document.addEventListener("paste", function (e) {
        if (!e.target.classList.contains("otp-digit")) return;
        e.preventDefault();
        const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        document.querySelectorAll(".otp-digit").forEach((inp, i) => {
            inp.value = pasted[i] || "";
            if (inp.value) inp.classList.add("is-filled"); else inp.classList.remove("is-filled");
        });
        const lastFilled = Math.min(pasted.length, 5);
        document.querySelectorAll(".otp-digit")[lastFilled].focus();
    });
});


function openCandidateRegModal() {
    if (!currentUser || currentUser.role !== "admin") return;
    document.getElementById("candidate-reg-modal").classList.remove("hidden");
    lucide.createIcons();
}

function closeCandidateRegModal() {
    document.getElementById("candidate-reg-modal").classList.add("hidden");
    document.getElementById("reg-cand-name").value = "";
    document.getElementById("reg-cand-party").value = "";
    document.getElementById("reg-cand-slogan").value = "";
    document.getElementById("reg-cand-policies").value = "";
    document.getElementById("reg-cand-admin-pw").value = "";
    const errEl = document.getElementById("reg-cand-pw-error");
    if (errEl) errEl.classList.add("hidden");
}

async function handleCandidateRegSubmit(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;

    const adminPw = document.getElementById("reg-cand-admin-pw").value;
    const errEl = document.getElementById("reg-cand-pw-error");
    errEl.classList.add("hidden");

    // ยืนยันรหัสผ่านแอดมินกับ Backend ก่อนบันทึก
    try {
        const r = await ApiClient.loginAdmin(currentUser.id, adminPw);
        ApiClient.Auth.setToken(r.token);
    } catch (_) {
        errEl.querySelector("span").innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        lucide.createIcons();
        return;
    }

    const party = document.getElementById("reg-cand-party").value.trim();
    const slogan = document.getElementById("reg-cand-slogan").value.trim();
    const rawPolicies = document.getElementById("reg-cand-policies").value.trim();
    // รวมสโลแกน + นโยบาย เป็น policy_detail (บรรทัดแรก = สโลแกน)
    const policyDetail = [slogan, ...rawPolicies.split("\n")].filter(l => l.trim() !== "").join("\n");
    const nextNo = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;

    if (!currentEventId) { showAdminToast("ไม่พบงานเลือกตั้งสำหรับเพิ่มผู้สมัคร"); return; }

    try {
        await ApiClient.adminAddCandidate({
            candidate_no: nextNo,
            event_id: currentEventId,
            party_name: party,
            policy_detail: policyDetail,
        });
        closeCandidateRegModal();
        await loadElectionData();
        updateUI();
        showSuccessPopup("เพิ่มผู้สมัครเรียบร้อย", `เพิ่มพรรค "${party}" (เบอร์ ${nextNo}) เข้าระบบและฐานข้อมูลแล้ว`);
    } catch (err) {
        errEl.querySelector("span").innerText = err.message || "เพิ่มผู้สมัครไม่สำเร็จ";
        errEl.classList.remove("hidden");
        lucide.createIcons();
    }
}

function saveCandidateChanges(e) {
    e.preventDefault();
    if (!currentUser) return;
    const partyName = document.getElementById("edit-party-name").value.trim();
    const avatar = document.getElementById("edit-avatar").value.trim();
    const slogan = document.getElementById("edit-slogan").value.trim();
    const policiesRaw = document.getElementById("edit-policies").value.trim();
    const policiesList = policiesRaw.split("\n").filter(p => p.trim() !== "");
    const candIdx = candidates.findIndex(c => c.name === currentUser.name);
    if (candIdx !== -1) {
        candidates[candIdx].party = partyName;
        candidates[candIdx].avatar = avatar;
        candidates[candIdx].slogan = slogan;
        candidates[candIdx].policies = policiesList;
    }
    const successMsg = document.getElementById("candidate-save-success");
    successMsg.classList.remove("hidden");
    setTimeout(() => successMsg.classList.add("hidden"), 3000);
    updateUI();
}

function loadCurrentCandidateData() {
    if (!currentUser) return;
    const cand = candidates.find(c => c.name === currentUser.name && c.approved);
    if (!cand) return;
    document.getElementById("edit-party-name").value = cand.party;
    document.getElementById("edit-avatar").value = cand.avatar;
    document.getElementById("edit-slogan").value = cand.slogan;
    document.getElementById("edit-policies").value = cand.policies.join("\n");
}

// === 7. ADMIN FUNCTIONS ===

// --- Admin Password Modal (ใช้สำหรับ delete/reset) ---
let _adminPwCallback = null;

function openAdminPwModal(title, desc, btnLabel, callback) {
    _adminPwCallback = callback;
    document.getElementById("admin-pw-modal-title").innerText = title;
    document.getElementById("admin-pw-modal-desc").innerText = desc;
    document.getElementById("admin-pw-confirm-btn").innerText = btnLabel;
    document.getElementById("admin-pw-input").value = "";
    document.getElementById("admin-pw-error").classList.add("hidden");
    document.getElementById("admin-pw-modal").classList.remove("hidden");
    lucide.createIcons();
    setTimeout(() => document.getElementById("admin-pw-input").focus(), 100);
}

function closeAdminPwModal() {
    document.getElementById("admin-pw-modal").classList.add("hidden");
    _adminPwCallback = null;
}

async function executeAdminPwAction() {
    const pw = document.getElementById("admin-pw-input").value;
    const errEl = document.getElementById("admin-pw-error");
    errEl.classList.add("hidden");
    if (!currentUser || currentUser.role !== "admin") return;

    // ยืนยันรหัสผ่านแอดมินกับ Backend จริง (re-authenticate ก่อนทำงานสำคัญ)
    try {
        const res = await ApiClient.loginAdmin(currentUser.id, pw);
        ApiClient.Auth.setToken(res.token); // ต่ออายุ token
    } catch (err) {
        console.error("[FRONTEND] executeAdminPwAction re-auth error:", err);
        errEl.querySelector("span").innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        lucide.createIcons();
        return;
    }

    // เก็บ callback ไว้ก่อน เพราะ closeAdminPwModal() จะล้าง _adminPwCallback เป็น null
    const cb = _adminPwCallback;
    closeAdminPwModal();
    if (cb) cb();
}

// --- Admin Toast ---
function showAdminToast(msg) {
    let t = document.getElementById("admin-toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "admin-toast";
        t.className = "fixed bottom-6 right-6 z-[999] bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transition-all duration-300";
        document.body.appendChild(t);
    }
    t.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 text-emerald-400 flex-shrink-0"></i><span>${msg}</span>`;
    t.style.opacity = "1"; t.style.transform = "translateY(0)";
    lucide.createIcons();
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; }, 3000);
}

// --- Vote Success Popup (แสดงหลังโหวตสำเร็จพร้อม Receipt และนับถอยหลัง 15 วินาที) ---
let voteSuccessTimer = null;
let voteSuccessCountdown = 15;

function showVoteSuccessPopup(receipt) {
    voteSuccessCountdown = 15;
    let p = document.getElementById("vote-success-popup");
    if (!p) {
        p = document.createElement("div");
        p.id = "vote-success-popup";
        p.className = "fixed inset-0 z-[1000] hidden items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm";
        p.innerHTML = `
            <div id="vote-success-popup-card" class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden" style="animation: modalPop .25s cubic-bezier(0.34,1.4,0.64,1) both;">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 text-center relative">
                    <button onclick="closeVoteSuccessPopup()" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                    <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="check-circle" class="w-10 h-10"></i>
                    </div>
                    <h3 class="text-xl font-bold mb-1">โหวตสำเร็จ!</h3>
                    <p class="text-emerald-100 text-sm">บันทึกการลงคะแนนเรียบร้อยแล้ว</p>
                </div>
                <div class="p-6 text-center">
                    <div class="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
                        <p class="text-xs text-slate-500 mb-1">หมายเลขใบเสร็จรับเงิน (Vote Receipt)</p>
                        <p id="vote-receipt-code" class="font-mono text-lg font-bold text-emerald-700 tracking-wider"></p>
                    </div>
                    <div class="flex items-center justify-center gap-2 mb-4">
                        <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
                        <p class="text-xs text-slate-500">การลงคะแนนของคุณถูกบันทึกด้วยระบบเข้ารหัสนิรนาม</p>
                    </div>
                    <div class="flex items-center justify-center gap-2 text-sm text-slate-600 mb-6">
                        <i data-lucide="clock" class="w-4 h-4"></i>
                        <span>ปิดอัตโนมัติในอีก <b id="vote-success-countdown" class="text-emerald-600 font-bold">15</b> วินาที</span>
                    </div>
                    <button onclick="closeVoteSuccessPopup()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2">
                        <i data-lucide="arrow-right" class="w-4 h-4"></i> ดูผลสถิติการเลือกตั้ง
                    </button>
                </div>
            </div>`;
        document.body.appendChild(p);
    }

    // Set receipt code
    document.getElementById("vote-receipt-code").innerText = receipt || "N/A";
    p.classList.remove("hidden");
    p.classList.add("flex");
    lucide.createIcons();

    // Clear any existing timer
    if (voteSuccessTimer) clearInterval(voteSuccessTimer);

    // Start countdown
    voteSuccessTimer = setInterval(() => {
        voteSuccessCountdown--;
        const countdownEl = document.getElementById("vote-success-countdown");
        if (countdownEl) countdownEl.innerText = voteSuccessCountdown;
        if (voteSuccessCountdown <= 0) {
            closeVoteSuccessPopup();
        }
    }, 1000);
}

function closeVoteSuccessPopup() {
    if (voteSuccessTimer) {
        clearInterval(voteSuccessTimer);
        voteSuccessTimer = null;
    }
    const p = document.getElementById("vote-success-popup");
    if (p) {
        p.classList.add("hidden");
        p.classList.remove("flex");
    }
}

// --- Success Popup (Pop-up กลางจอแจ้งผลการทำงานสำคัญของแอดมิน) ---
function showSuccessPopup(title, message, variant) {
    // variant: "success" (เขียว, ค่าเริ่มต้น) | "danger" (แดง สำหรับการลบ)
    const isDanger = variant === "danger";
    let p = document.getElementById("success-popup");
    if (!p) {
        p = document.createElement("div");
        p.id = "success-popup";
        p.className = "fixed inset-0 z-[1000] hidden items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm";
        p.innerHTML = `
          <div id="success-popup-card" class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" style="animation: modalPop .22s cubic-bezier(0.34,1.4,0.64,1) both;">
            <div id="success-popup-icon-wrap" class="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <i id="success-popup-icon" data-lucide="check" class="w-9 h-9"></i>
            </div>
            <h3 id="success-popup-title" class="text-lg font-bold text-slate-900 mb-1"></h3>
            <p id="success-popup-msg" class="text-sm text-slate-500 mb-5"></p>
            <button id="success-popup-btn" onclick="closeSuccessPopup()" class="w-full text-white font-semibold py-2.5 rounded-xl text-sm transition">ตกลง</button>
          </div>`;
        document.body.appendChild(p);
        p.addEventListener("click", (e) => { if (e.target === p) closeSuccessPopup(); });
    }
    const iconWrap = document.getElementById("success-popup-icon-wrap");
    const icon = document.getElementById("success-popup-icon");
    const btn = document.getElementById("success-popup-btn");
    iconWrap.className = `mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDanger ? "bg-red-100" : "bg-emerald-100"}`;
    icon.className = `w-9 h-9 ${isDanger ? "text-red-600" : "text-emerald-600"}`;
    icon.setAttribute("data-lucide", isDanger ? "trash-2" : "check");
    btn.className = `w-full text-white font-semibold py-2.5 rounded-xl text-sm transition ${isDanger ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`;
    document.getElementById("success-popup-title").innerText = title || "ดำเนินการเสร็จสิ้น";
    document.getElementById("success-popup-msg").innerText = message || "";
    p.classList.remove("hidden");
    p.classList.add("flex");
    lucide.createIcons();
}

function closeSuccessPopup() {
    const p = document.getElementById("success-popup");
    if (p) { p.classList.add("hidden"); p.classList.remove("flex"); }
}

// --- Election Settings ---
let electionTitle = "การเลือกตั้งสภานักเรียน ปีการศึกษา 2569";
let electionCloseTime = null;
let countdownTimer = null;

function openElectionSettingsModal() {
    document.getElementById("election-title-input").value = electionTitle;
    if (electionCloseTime) {
        const local = new Date(electionCloseTime.getTime() - electionCloseTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        document.getElementById("election-close-time").value = local;
    }
    document.getElementById("election-settings-admin-pw").value = "";
    document.getElementById("election-settings-pw-error").classList.add("hidden");
    document.getElementById("election-settings-modal").classList.remove("hidden");
    lucide.createIcons();
}

function closeElectionSettingsModal() {
    document.getElementById("election-settings-modal").classList.add("hidden");
}

async function saveElectionSettings() {
    const pw = document.getElementById("election-settings-admin-pw").value;
    const errEl = document.getElementById("election-settings-pw-error");
    errEl.classList.add("hidden");

    if (!currentUser || currentUser.role !== "admin") return;
    // ยืนยันรหัสผ่านแอดมินกับ Backend ก่อนบันทึกการตั้งค่า
    try {
        const r = await ApiClient.loginAdmin(currentUser.id, pw);
        ApiClient.Auth.setToken(r.token);
    } catch (_) {
        errEl.innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        return;
    }

    const title = document.getElementById("election-title-input").value.trim();
    const closeTimeVal = document.getElementById("election-close-time").value;

    if (!currentEventId) { errEl.innerText = "ไม่พบงานเลือกตั้งที่จะตั้งค่า"; errEl.classList.remove("hidden"); return; }
    if (!closeTimeVal) { errEl.innerText = "กรุณาเลือกวันและเวลาปิดหีบ"; errEl.classList.remove("hidden"); return; }

    // แปลงค่า datetime-local ("YYYY-MM-DDTHH:mm") -> รูปแบบ MySQL ("YYYY-MM-DD HH:mm:00")
    const endDatetime = closeTimeVal.replace("T", " ") + ":00";

    try {
        // บันทึกชื่องาน + เวลาปิดหีบลง DB เพื่อให้นับถอยหลังแชร์ไปยังผู้ใช้ทุกคน
        await ApiClient.adminUpdateSettings(currentEventId, title || electionTitle, endDatetime);
        closeElectionSettingsModal();
        await loadElectionData(); // โหลดเวลาปิดหีบใหม่ -> เริ่มนับถอยหลังให้ทุกคน
        updateUI();
        showSuccessPopup("บันทึกการตั้งค่าเรียบร้อย", "อัปเดตชื่องานและเวลาปิดหีบแล้ว ระบบจะนับถอยหลังและปิดหีบอัตโนมัติเมื่อถึงเวลา");
    } catch (err) {
        errEl.innerText = err.message || "บันทึกการตั้งค่าไม่สำเร็จ";
        errEl.classList.remove("hidden");
    }
}

function startCountdown() {
    stopCountdown();
    const banner = document.getElementById("election-countdown-banner");
    if (!electionCloseTime) { if (banner) banner.classList.add("hidden"); return; }
    if (banner) {
        banner.classList.remove("hidden");
        document.getElementById("election-banner-title").innerText = electionTitle;
    }
    countdownTimer = setInterval(() => {
        const now = new Date();
        const diff = electionCloseTime - now;
        if (diff <= 0) {
            stopCountdown();
            const cdH = document.getElementById("cd-hours");
            const cdM = document.getElementById("cd-minutes");
            const cdS = document.getElementById("cd-seconds");
            if (cdH) cdH.innerText = "00";
            if (cdM) cdM.innerText = "00";
            if (cdS) cdS.innerText = "00";
            // หมดเวลาที่แอดมินตั้งไว้ — ดึงสถานะล่าสุดจากเซิร์ฟเวอร์ (แอดมินเป็นผู้ควบคุมการปิดหีบจริง)
            loadElectionData().then(updateUI);
            return;
        }
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        const pad = n => String(n).padStart(2, "0");
        const cdH = document.getElementById("cd-hours");
        const cdM = document.getElementById("cd-minutes");
        const cdS = document.getElementById("cd-seconds");
        if (cdH) cdH.innerText = pad(h);
        if (cdM) cdM.innerText = pad(m);
        if (cdS) cdS.innerText = pad(s);
    }, 1000);
}

function stopCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    const banner = document.getElementById("election-countdown-banner");
    if (banner) banner.classList.add("hidden");
}

function toggleElectionStatus() {
    openAdminPwModal(
        isElectionOpen ? "ยืนยันการปิดหีบ" : "ยืนยันการเปิดหีบ",
        isElectionOpen ? "การปิดหีบจะหยุดรับคะแนนทันที" : "การเปิดหีบจะอนุญาตให้โหวตได้อีกครั้ง",
        isElectionOpen ? "ยืนยัน ปิดหีบ" : "ยืนยัน เปิดหีบ",
        async () => {
            if (!currentEventId) { showAdminToast("ไม่พบงานเลือกตั้งที่จะปรับสถานะ"); return; }
            const newActive = isElectionOpen ? 0 : 1;
            try {
                await ApiClient.adminSetEventStatus(currentEventId, newActive);
                if (newActive === 0) stopCountdown();
                await loadElectionData();
                updateUI();
                showSuccessPopup(
                    newActive === 1 ? "เปิดหีบเรียบร้อย" : "ปิดหีบเรียบร้อย",
                    newActive === 1
                        ? "ระบบเปิดรับการลงคะแนนแล้ว"
                        : "ระบบปิดรับการลงคะแนนเสียงทันที ผู้ใช้จะไม่สามารถโหวตได้อีก"
                );
            } catch (err) {
                showAdminToast(err.message || "ปรับสถานะไม่สำเร็จ");
            }
        }
    );
}

function resetElectionData() {
    openAdminPwModal(
        "ยืนยันการรีเซ็ตข้อมูลทั้งหมด",
        "จะลบคะแนนโหวต, สิทธิ์โหวต, พรรคผู้สมัคร และรอบเลือกตั้งทั้งหมด ข้อมูลนักเรียนและประวัติแชท AI จะถูกเก็บไว้ ไม่สามารถย้อนกลับได้",
        "ยืนยัน รีเซ็ตทั้งหมด",
        async () => {
            try {
                await ApiClient.adminFullReset();
                await loadElectionData();
                updateUI();
                showSuccessPopup("รีเซ็ตข้อมูลเรียบร้อย", "ข้อมูลการเลือกตั้งถูกล้างทั้งหมดแล้ว ระบบพร้อมเริ่มรอบใหม่");
            } catch (err) {
                console.error("[FRONTEND] resetElectionData error:", err);
                showAdminToast(err.message || "เกิดข้อผิดพลาดในการรีเซ็ต");
            }
        }
    );
}

function approveCandidate(studentName) {
    openAdminPwModal(
        "ยืนยันการอนุมัติผู้สมัคร",
        `อนุมัติ "${studentName}" เป็นผู้สมัครรับเลือกตั้งอย่างเป็นทางการ`,
        "ยืนยัน อนุมัติ",
        () => {
            const candIdx = candidates.findIndex(c => c.name === studentName);
            if (candIdx !== -1) candidates[candIdx].approved = true;
            const stdIdx = students.findIndex(s => s.name === studentName);
            if (stdIdx !== -1) {
                students[stdIdx].candidateApproved = true;
                students[stdIdx].candidateId = candidates[candIdx].id;
            }
            updateUI();
            showSuccessPopup("อนุมัติผู้สมัครเรียบร้อย", `อนุมัติ "${studentName}" เป็นผู้สมัครอย่างเป็นทางการแล้ว`);
        }
    );
}

function deleteStudent(studentId) {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    openAdminPwModal(
        "ยืนยันการลบนักเรียน",
        `ลบ "${target.name}" (${target.id}) ออกจากระบบ ข้อมูลจะหายถาวร`,
        "ยืนยัน ลบออก",
        async () => {
            try {
                await ApiClient.adminDeleteStudent(studentId);
                await loadAdminStudents();
                updateUI();
                showSuccessPopup("ลบนักเรียนเรียบร้อย", `ลบ "${target.name}" (${target.id}) ออกจากระบบและฐานข้อมูลแล้ว`, "danger");
            } catch (err) {
                showAdminToast(err.message || "ลบนักเรียนไม่สำเร็จ");
            }
        }
    );
}

function openAddStudentModal() {
    document.getElementById("add-student-modal").classList.remove("hidden");
}

function closeAddStudentModal() {
    document.getElementById("add-student-modal").classList.add("hidden");
    document.getElementById("add-std-name").value = "";
    document.getElementById("add-std-id").value = "";
}

async function handleAddStudentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("add-std-name").value.trim();
    const id = document.getElementById("add-std-id").value.trim();
    const grade = document.getElementById("add-std-grade").value;
    if (id.length !== 5) { alert("รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก"); return; }
    try {
        await ApiClient.adminAddStudent({
            student_id: id,
            student_name: name,
            student_class: grade,
            student_email: `${id}@student.local`,
            student_status: "Active",
            // ไม่ส่ง password -> Backend ใช้รหัสนักเรียนเป็นรหัสผ่านเริ่มต้น (และ Hash ให้)
        });
        closeAddStudentModal();
        await loadAdminStudents();
        updateUI();
        showSuccessPopup("เพิ่มนักเรียนเรียบร้อย", `เพิ่ม "${name}" (${id}) เข้าระบบและฐานข้อมูลแล้ว`);
    } catch (err) {
        alert(err.message || "เพิ่มนักเรียนไม่สำเร็จ");
    }
}

// === 8. AI CHATBOT (เชื่อม Gemini ผ่าน Backend) ===
async function loadChatHistory() {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    chatBox.innerHTML = `
    <div class="flex justify-start items-start gap-2">
      <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0"><i data-lucide="bot" class="w-4 h-4"></i></span>
      <div class="bg-slate-200 text-slate-800 p-3 rounded-xl max-w-[80%]">
        สวัสดีค่ะ! ฉันคือผู้ช่วยการเลือกตั้ง มีคำถามเกี่ยวกับนโยบายพรรคหรือกำหนดการเลือกตั้งอะไรไหมคะ?
      </div>
    </div>`;
    lucide.createIcons();

    // โหลดประวัติแชทเก่าจาก DB
    if (!currentUser) return;
    try {
        const res = await ApiClient.getChatHistory();
        const history = res.data || [];
        history.forEach(item => {
            chatBox.innerHTML += `
            <div class="flex justify-end">
              <div class="bg-blue-600 text-white p-3 rounded-xl max-w-[80%]">${escapeHtml(item.student_prompt)}</div>
            </div>
            <div class="flex justify-start items-start gap-2">
              <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0"><i data-lucide="bot" class="w-4 h-4"></i></span>
              <div class="bg-slate-200 text-slate-800 p-3 rounded-xl max-w-[80%] whitespace-pre-line">${escapeHtml(item.ai_response)}</div>
            </div>`;
        });
        lucide.createIcons();
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        console.warn("loadChatHistory error:", err);
    }
}
async function sendChat() {
    const input = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // ข้อความผู้ใช้
    chatBox.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-blue-600 text-white p-3 rounded-xl max-w-[80%]">${escapeHtml(userMessage)}</div>
    </div>
  `;
    input.value = "";

    // ฟองข้อความ "กำลังพิมพ์..."
    const loadingId = "chat-loading-" + Date.now();
    chatBox.innerHTML += `
    <div class="flex justify-start items-start gap-2" id="${loadingId}">
      <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0"><i data-lucide="bot" class="w-4 h-4"></i></span>
      <div class="bg-slate-200 text-slate-500 p-3 rounded-xl italic">กำลังคิดคำตอบ...</div>
    </div>
  `;
    lucide.createIcons();
    chatBox.scrollTop = chatBox.scrollHeight;

    let reply;
    try {
        const res = await ApiClient.askAI(userMessage);
        reply = (res.data && res.data.reply) || "ขออภัย ไม่สามารถตอบได้ในขณะนี้";
    } catch (err) {
        reply = err.message || "ขออภัย ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่";
    }

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();
    chatBox.innerHTML += `
      <div class="flex justify-start items-start gap-2">
        <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0"><i data-lucide="bot" class="w-4 h-4"></i></span>
        <div class="bg-slate-200 text-slate-800 p-3 rounded-xl max-w-[80%] whitespace-pre-line">${escapeHtml(reply)}</div>
      </div>
    `;
    lucide.createIcons();
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ป้องกัน HTML injection ในฟองแชท
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* =========================
   HISTORY RESULTS
========================= */

function toggleHistoryResults() {
    const historySection = document.getElementById("history-results");

    historySection.classList.toggle("hidden");
}

/* =========================
   FORGOT PASSWORD (รีเซ็ตรหัสผ่านด้วย OTP ทางอีเมล)
========================= */
let forgotResetToken = null;

function openForgotModal() {
    forgotResetToken = null;
    document.getElementById("forgot-student-id").value = "";
    document.getElementById("forgot-email").value = "";
    document.getElementById("forgot-otp").value = "";
    document.getElementById("forgot-new-pw").value = "";
    document.getElementById("forgot-err-1").classList.add("hidden");
    document.getElementById("forgot-err-2").classList.add("hidden");
    document.getElementById("forgot-step-1").classList.remove("hidden");
    document.getElementById("forgot-step-2").classList.add("hidden");
    closeAuthModal();
    document.getElementById("forgot-modal").classList.remove("hidden");
    lucide.createIcons();
}

function closeForgotModal() {
    document.getElementById("forgot-modal").classList.add("hidden");
}

function forgotBackToStep1() {
    document.getElementById("forgot-step-2").classList.add("hidden");
    document.getElementById("forgot-step-1").classList.remove("hidden");
}

async function forgotRequestOtp() {
    const sid = document.getElementById("forgot-student-id").value.trim();
    const email = document.getElementById("forgot-email").value.trim();
    const err = document.getElementById("forgot-err-1");
    err.classList.add("hidden");

    if (sid.length !== 5) { err.innerText = "รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก"; err.classList.remove("hidden"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.innerText = "กรุณากรอกอีเมลให้ถูกต้อง"; err.classList.remove("hidden"); return; }

    const btn = document.getElementById("forgot-send-btn");
    const txt = document.getElementById("forgot-send-text");
    btn.disabled = true; txt.innerText = "กำลังส่ง...";
    try {
        const res = await ApiClient.forgotPassword(sid, email);
        forgotResetToken = res.resetToken;
        document.getElementById("forgot-email-display").innerText = res.email || email;
        document.getElementById("forgot-step-1").classList.add("hidden");
        document.getElementById("forgot-step-2").classList.remove("hidden");
        lucide.createIcons();
    } catch (e) {
        err.innerText = e.message || "ส่ง OTP ไม่สำเร็จ";
        err.classList.remove("hidden");
    } finally {
        btn.disabled = false; txt.innerText = "ส่งรหัส OTP";
    }
}

async function forgotResetPassword() {
    const otp = document.getElementById("forgot-otp").value.trim();
    const newPw = document.getElementById("forgot-new-pw").value;
    const confirmPw = document.getElementById("forgot-confirm-pw").value;
    const err = document.getElementById("forgot-err-2");
    err.classList.add("hidden");

    if (otp.length !== 6) { err.innerText = "กรุณากรอกรหัส OTP 6 หลัก"; err.classList.remove("hidden"); return; }

    // Validate password strength (at least score 2 = ปานกลาง)
    const strength = checkPasswordStrength(newPw);
    if (strength.score < 2) {
        err.innerText = "รหัสผ่านใหม่ต้องมีความแข็งแกร่งอย่างน้อยระดับ 'ปานกลาง' (มีตัวพิมพ์ใหญ่ ตัวเลข หรืออักขระพิเศษ)";
        err.classList.remove("hidden");
        return;
    }
    if (newPw.length < 6) { err.innerText = "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"; err.classList.remove("hidden"); return; }
    if (newPw !== confirmPw) { err.innerText = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน"; err.classList.remove("hidden"); return; }

    try {
        await ApiClient.resetPassword(forgotResetToken, otp, newPw);
        closeForgotModal();
        showAdminToast("ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว เข้าสู่ระบบด้วยรััสใหม่ได้เลย");
        openAuthModal();
    } catch (e) {
        err.innerText = e.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ";
        err.classList.remove("hidden");
    }
}

/**
 * onForgotPasswordInput()
 * อัปเดต Strength Meter เมื่อพิมพ์รหัสผ่านใหม่ในหน้าลืมรหัสผ่าน
 */
function onForgotPasswordInput() {
    const pw = document.getElementById("forgot-new-pw") ? document.getElementById("forgot-new-pw").value : "";
    const strengthWrap = document.getElementById("forgot-strength-wrap");
    const label = document.getElementById("forgot-strength-label");
    if (!strengthWrap) return;

    if (!pw) {
        strengthWrap.classList.add("hidden");
        return;
    }
    strengthWrap.classList.remove("hidden");

    const result = checkPasswordStrength(pw);
    const bars = [
        document.getElementById("forgot-str-bar-1"),
        document.getElementById("forgot-str-bar-2"),
        document.getElementById("forgot-str-bar-3"),
        document.getElementById("forgot-str-bar-4"),
    ];
    bars.forEach((bar, i) => {
        if (!bar) return;
        bar.className = "strength-bar h-1 flex-1 rounded-full transition-all";
        if (i < result.score) {
            bar.classList.add(result.color);
        } else {
            bar.classList.add("bg-slate-200");
        }
    });
    if (label) {
        label.innerText = result.label;
        label.className = `text-[11px] font-medium ${result.score <= 1 ? "text-red-500" :
            result.score === 2 ? "text-yellow-500" : "text-emerald-600"
            }`;
    }
}

/**
 * onForgotConfirmInput()
 * แสดงข้อความเปรียบเทียบรหัสผ่านที่ยืนยันกับรหัสผ่านใหม่
 */
function onForgotConfirmInput() {
    const newPw = document.getElementById("forgot-new-pw") ? document.getElementById("forgot-new-pw").value : "";
    const confirmPw = document.getElementById("forgot-confirm-pw") ? document.getElementById("forgot-confirm-pw").value : "";
    const msg = document.getElementById("forgot-match-msg");
    if (!msg) return;

    if (!confirmPw) {
        msg.classList.add("hidden");
        return;
    }
    msg.classList.remove("hidden");
    if (newPw === confirmPw) {
        msg.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3 text-emerald-500"></i> รหัสผ่านตรงกัน';
        msg.className = "text-[11px] mt-1 flex items-center gap-1 text-emerald-600";
    } else {
        msg.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3 text-red-500"></i> รหัสผ่านไม่ตรงกัน';
        msg.className = "text-[11px] mt-1 flex items-center gap-1 text-red-500";
    }
    lucide.createIcons();
}

/* =========================
   ADMIN: แก้ไข / ลบ พรรค
========================= */
function openEditPartyModal(candidateId) {
    if (!currentUser || currentUser.role !== "admin") return;
    const cand = candidates.find(c => c.candidate_id === candidateId);
    if (!cand) return;
    document.getElementById("edit-party-cand-id").value = candidateId;
    document.getElementById("edit-party-name-input").value = cand.party;
    document.getElementById("edit-party-policies-input").value = (cand.policies || []).join("\n");
    document.getElementById("edit-party-err").classList.add("hidden");
    document.getElementById("edit-party-modal").classList.remove("hidden");
    lucide.createIcons();
}

function closeEditPartyModal() {
    document.getElementById("edit-party-modal").classList.add("hidden");
}

async function saveEditParty(e) {
    e.preventDefault();
    const id = Number(document.getElementById("edit-party-cand-id").value);
    const name = document.getElementById("edit-party-name-input").value.trim();
    const policyDetail = document.getElementById("edit-party-policies-input").value
        .split("\n").map(s => s.trim()).filter(Boolean).join("\n");
    const err = document.getElementById("edit-party-err");
    err.classList.add("hidden");
    try {
        await ApiClient.adminUpdateCandidate(id, name, policyDetail);
        closeEditPartyModal();
        await loadElectionData();
        updateUI();
        showSuccessPopup("แก้ไขพรรคเรียบร้อย", "บันทึกชื่อพรรคและนโยบายใหม่ลงฐานข้อมูลแล้ว");
    } catch (e2) {
        err.innerText = e2.message || "แก้ไขพรรคไม่สำเร็จ";
        err.classList.remove("hidden");
    }
}

function deleteParty(candidateId, partyName) {
    openAdminPwModal(
        "ยืนยันการลบพรรค",
        `ลบพรรค "${partyName}" ออกจากระบบ ข้อมูลและลูกทีมในพรรคจะถูกลบถาวร`,
        "ยืนยัน ลบพรรค",
        async () => {
            try {
                await ApiClient.adminDeleteCandidate(candidateId);
                await loadElectionData();
                updateUI();
                showSuccessPopup("ลบพรรคเรียบร้อย", `ลบพรรค "${partyName}" ออกจากระบบและฐานข้อมูลแล้ว`, "danger");
            } catch (e) {
                showAdminToast(e.message || "ลบพรรคไม่สำเร็จ");
            }
        }
    );
}

/* =========================
   EXPORT DASHBOARD -> EXCEL (.xlsx) ด้วย SheetJS
========================= */
async function exportDashboardExcel() {
    if (!currentUser || currentUser.role !== "admin") { showAdminToast("เฉพาะแอดมินเท่านั้น"); return; }
    if (typeof XLSX === "undefined") { showAdminToast("ไลบรารี Excel ยังโหลดไม่เสร็จ ลองใหม่อีกครั้ง"); return; }
    if (!currentEventId) { showAdminToast("ไม่พบงานเลือกตั้ง"); return; }

    try {
        const a = await ApiClient.adminAnalytics(currentEventId);
        const results = (a.voting_results || []).slice().sort((x, y) => y.total_votes - x.total_votes);
        const totalEligible = Number(a.total_eligible) || 2000;
        const voted = Number(a.total_voters_turnout) || 0;
        const validVotes = results.reduce((s, r) => s + Number(r.total_votes), 0);
        const abstain = Math.max(0, voted - validVotes);
        const noShow = totalEligible - voted;
        const pct = (n) => (voted > 0 ? ((n / voted) * 100).toFixed(2) + "%" : "0%");

        // ชีต 1: ผลการเลือกตั้งอย่างเป็นทางการ
        const sheet1 = [["อันดับ", "เบอร์", "พรรค", "คะแนน", "% จากผู้มาใช้สิทธิ์"]];
        results.forEach((r, i) => {
            sheet1.push([i + 1, r.candidate_no, r.party_name || "", Number(r.total_votes), pct(r.total_votes)]);
        });
        sheet1.push(["-", "-", "งดออกเสียง (No Vote)", abstain, pct(abstain)]);

        // ชีต 2: จำนวนผู้เข้ามาใช้สิทธิ์
        const turnoutPct = totalEligible > 0 ? ((voted / totalEligible) * 100).toFixed(2) + "%" : "0%";
        const sheet2 = [
            ["รายการ", "จำนวน (คน)"],
            ["นักเรียนผู้มีสิทธิ์ทั้งหมด", totalEligible],
            ["มาใช้สิทธิ์", voted],
            ["งดออกเสียง (กดงดออกเสียง)", abstain],
            ["ไม่มาใช้สิทธิ์", noShow],
            ["คิดเป็น % ผู้มาใช้สิทธิ์", turnoutPct],
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet1), "ผลการเลือกตั้ง");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet2), "ผู้มาใช้สิทธิ์");

        const stamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `dashboard-เลือกตั้ง-${stamp}.xlsx`);
        showAdminToast("ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว");
    } catch (err) {
        showAdminToast(err.message || "Export ไม่สำเร็จ");
    }
}
