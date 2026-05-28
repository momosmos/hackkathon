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
        avatar: "🎓",
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
        avatar: "🌱",
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
        avatar: "🎸",
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
    { timestamp: "19 พ.ค. 2026, 10:14:32", voterId: "10001", status: "สำเร็จ (บันทึกเข้ารหัสคีย์นิรนามเรียบร้อย)" },
    { timestamp: "19 พ.ค. 2026, 10:28:11", voterId: "10002", status: "สำเร็จ (บันทึกเข้ารหัสคีย์นิรนามเรียบร้อย)" }
];

// สถานะการเข้าใช้ระบบปัจจุบัน
let currentUser = null;
let authTab = "login";
let currentTab = "home";
let isElectionOpen = true;
let selectedCandidateToVote = null;

// === 2. EVENT LISTENERS & TAB CONTROLLER ===
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    updateUI();

    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
        chatInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                sendChat();
            }
        });
    }
});

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

    if (tabId === "candidate-panel") {
        loadCurrentCandidateData();
    }
    updateUI();
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
        }
    }
    lucide.createIcons();
}

// === GRADUATION YEAR AUTO-CALC ===
// ปีปัจจุบันของระบบ (พ.ศ. 2569)
const CURRENT_YEAR_TH = 2569;

/**
 * calcGraduationYear()
 * คำนวณปีที่จบการศึกษา ม.6 จากระดับชั้นปัจจุบัน
 * ตรรกะ: ปีที่จบ = ปีปัจจุบัน (2569) + (6 - ระดับชั้นปัจจุบัน)
 * ตัวอย่าง:
 *   ม.1 → 2569 + (6-1) = 2574... แต่โจทย์ระบุ ม.1 = 2575
 *   → ใช้สูตร: 2569 + (7 - gradeNum)
 *   ม.1: 2569 + 6 = 2575 ✓
 *   ม.4: 2569 + 3 = 2572 ✓
 *   ม.6: 2569 + 1 = 2570 ✓
 */
function calcGraduationYear() {
    const gradYearInput = document.getElementById("auth-grad-year");
    const gradeSelect = document.getElementById("auth-grade");
    if (!gradYearInput || !gradeSelect) return;

    const gradeVal = gradeSelect.value; // "ม.1" … "ม.6"
    const gradeMatch = gradeVal.match(/(\d+)/);
    const gradeNum = gradeMatch ? parseInt(gradeMatch[1], 10) : null;

    if (!gradeNum) {
        gradYearInput.value = "";
        gradYearInput.placeholder = "เลือกระดับชั้นเพื่อคำนวณอัตโนมัติ";
        return;
    }

    // สูตร: 2569 + (7 - gradeNum)
    // ม.1 → 2575, ม.2 → 2574, ม.3 → 2573, ม.4 → 2572, ม.5 → 2571, ม.6 → 2570
    const gradYear = CURRENT_YEAR_TH + (7 - gradeNum);
    gradYearInput.value = `พ.ศ. ${gradYear}`;
    gradYearInput.dataset.gradYearNum = gradYear;

    const hintEl = document.getElementById("auth-year-hint");
    if (hintEl) hintEl.classList.add("hidden");
}

// === LOGIN SUBMIT (นักเรียน + แอดมิน) ===
function handleAuthSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById("auth-student-id").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorMsgDiv = document.getElementById("auth-error-msg");
    const errorTextSpan = document.getElementById("auth-error-text");
    errorMsgDiv.classList.add("hidden");

    if (studentId.length !== 5) {
        errorTextSpan.innerText = "รหัสนักเรียนต้องประกอบด้วยตัวเลข 5 หลักเท่านั้น";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    if (!password) {
        errorTextSpan.innerText = "กรุณากรอกรหัสผ่าน";
        errorMsgDiv.classList.remove("hidden");
        return;
    }

    const foundUser = students.find(s => s.id === studentId);
    if (!foundUser) {
        errorTextSpan.innerText = "ไม่พบรหัสนักเรียนนี้ในฐานข้อมูล กรุณาลงทะเบียนก่อน";
        errorMsgDiv.classList.remove("hidden");
        return;
    }

    // ตรวจสอบ role: แท็บแอดมินต้องเป็น admin เท่านั้น
    if (authTab === "admin" && foundUser.role !== "admin") {
        errorTextSpan.innerText = "บัญชีนี้ไม่มีสิทธิ์เข้าสู่ระบบแอดมิน";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    if (authTab === "student" && foundUser.role === "admin") {
        errorTextSpan.innerText = "กรุณาใช้แท็บแอดมินเพื่อเข้าสู่ระบบ";
        errorMsgDiv.classList.remove("hidden");
        return;
    }

    if (foundUser.password && foundUser.password !== password) {
        errorTextSpan.innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errorMsgDiv.classList.remove("hidden");
        return;
    }

    currentUser = foundUser;
    closeAuthModal();
    updateUI();
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
    const gradYear = gradYearEl ? parseInt(gradYearEl.dataset.gradYearNum, 10) : null;

    if (!nameInput) {
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
    if (students.some(s => s.id === studentId)) {
        errorTextSpan.innerText = "รหัสนักเรียนนี้เคยทำการลงทะเบียนเรียบร้อยแล้ว";
        errorMsgDiv.classList.remove("hidden");
        return;
    }
    const newStudent = {
        id: studentId,
        name: nameInput,
        grade: gradeInput,
        role: "student",
        password: password,
        gradYear: gradYear,
        voted: false,
        candidateApproved: false
    };
    students.push(newStudent);
    currentUser = newStudent;
    closeAuthModal();
    updateUI();
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

    if (isElectionOpen) {
        dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
        statusText.innerText = "เปิดลงคะแนนอยู่";
        votingBadge.className = "bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1";
        votingBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> เปิดให้ลงคะแนน`;
    } else {
        dot.className = "w-2.5 h-2.5 rounded-full bg-red-500";
        statusText.innerText = "ปิดการลงคะแนนแล้ว";
        votingBadge.className = "bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1";
        votingBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> ปิดรับสิทธิ์โหวต`;
    }
    /* =========================
       REALTIME VOTE PERCENT
    ========================= */

    // จำนวนนักเรียนทั้งหมดและผู้มีสิทธิ์เลือกตั้ง (กำหนดไว้ 2000 คน)
    const totalStudents = TOTAL_ELIGIBLE_VOTERS;

    // จำนวนคนที่โหวตแล้ว (รวม no-vote)
    const totalVoted = students.filter(student => student.voted).length;

    // คิดเปอร์เซ็นต์เทียบกับนักเรียนทั้งหมด 2000 คน
    const percent =
        totalStudents > 0
            ? ((totalVoted / totalStudents) * 100).toFixed(2)
            : 0;

    // จำนวนคนงดออกเสียง
    const noVoteCount = students.filter(s => s.voted && s.votedFor === "no-vote").length;

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

    if (!isElectionOpen) {
        area.innerHTML = `
      <div class="text-center py-10 bg-red-50 rounded-xl border border-red-100 text-red-900">
        <i data-lucide="calendar-off" class="w-12 h-12 text-red-500 mx-auto mb-3"></i>
        <h4 class="font-bold text-lg mb-1">ปิดรับการลงคะแนนการเลือกตั้งเรียบร้อย</h4>
        <p class="text-xs text-red-700 mb-4 max-w-sm mx-auto">ทางคุณครูสภานักเรียนได้ปิดการรับเรื่องคะแนนเป็นทางการแล้ว</p>
        <button onclick="switchTab('results')" class="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-lg mx-auto">
          คลิกดูสรุปคะแนนผู้ชนะ
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
          <span class="text-3xl">${cand.avatar || '🎓'}</span>
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
            <span class="text-4xl p-3 bg-blue-50 rounded-2xl">${cand.avatar || '🎓'}</span>
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
    const noVoteCount = students.filter(s => s.voted && s.votedFor === "no-vote").length;
    const totalAllVotes = totalCandVotes + noVoteCount;

    const medals = ["🥇", "🥈", "🥉"];
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
          <span class="text-3xl">${medals[idx] || `#${idx + 1}`}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-900 text-sm">${cand.name}</span>
              <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">เบอร์ ${cand.id}</span>
              ${isWinner ? `<span class="text-[10px] bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-bold animate-pulse">🏆 ผู้ชนะ!</span>` : ''}
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
          <span>${medals[idx] || `#${idx + 1}`} ${cand.name} <span class="text-slate-400 font-normal">(เบอร์ ${cand.id})</span></span>
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
          <span>🚫 งดออกเสียง</span>
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
        <span class="text-4xl p-3 bg-white/10 rounded-2xl">${cand.avatar || '🎓'}</span>
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

function executeVote() {
    if (!currentUser || selectedCandidateToVote === null) return;
    if (selectedCandidateToVote !== "no-vote") {
        const cand = candidates.find(c => c.id === selectedCandidateToVote);
        if (cand) cand.votes += 1;
    }
    const studentIdx = students.findIndex(s => s.id === currentUser.id);
    if (studentIdx !== -1) {
        students[studentIdx].voted = true;
        students[studentIdx].votedFor = selectedCandidateToVote;
        currentUser.voted = true;
        currentUser.votedFor = selectedCandidateToVote;
    }
    const padTwo = (val) => String(val).padStart(2, '0');
    const now = new Date();
    const timeString = `${now.getDate()} พ.ค. 2026, ${padTwo(now.getHours())}:${padTwo(now.getMinutes())}:${padTwo(now.getSeconds())}`;
    auditLogs.unshift({ timestamp: timeString, voterId: currentUser.id, status: "สำเร็จ (บันทึกเข้ารหัสคีย์นิรนามเรียบร้อย)" });
    closeVoteConfirmModal();
    updateUI();
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

function sendOtp() {
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
    // Generate 6-digit OTP
    otpCode = String(Math.floor(100000 + Math.random() * 900000));
    otpExpired = false;

    // Simulate sending (in real system, call API here)
    const btn = document.getElementById("otp-send-btn");
    const btnText = document.getElementById("otp-send-btn-text");
    btn.disabled = true;
    btn.classList.add("opacity-75", "cursor-not-allowed");
    btnText.innerText = "กำลังส่ง OTP...";

    setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove("opacity-75", "cursor-not-allowed");
        btnText.innerText = "ส่งรหัส OTP ไปยังอีเมล";

        // Switch to verify step
        document.getElementById("otp-step-email").classList.add("hidden");
        document.getElementById("otp-step-verify").classList.remove("hidden");
        document.getElementById("otp-sent-to-email").innerText = otpEmail;
        document.getElementById("otp-dev-code").innerText = otpCode;

        // Reset digit inputs
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
    }, 1000);
}

function resendOtp() {
    otpCode = String(Math.floor(100000 + Math.random() * 900000));
    otpExpired = false;
    document.getElementById("otp-dev-code").innerText = otpCode;
    document.querySelectorAll(".otp-digit").forEach(inp => {
        inp.value = "";
        inp.classList.remove("is-filled", "is-error");
    });
    document.getElementById("otp-verify-error").classList.add("hidden");
    document.getElementById("otp-expired-wrap").classList.add("hidden");
    document.getElementById("otp-countdown-wrap").classList.remove("hidden");
    startOtpCountdown(300);
    document.querySelectorAll(".otp-digit")[0].focus();
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
    if (entered !== otpCode) {
        showOtpVerifyError("รหัส OTP ไม่ถูกต้อง กรุณาลองอีกครั้ง");
        digits.forEach(d => d.classList.add("is-error"));
        setTimeout(() => digits.forEach(d => { d.classList.remove("is-error"); d.value = ""; }), 600);
        return;
    }

    // OTP verified — close OTP modal, open vote confirm modal
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

function handleCandidateRegSubmit(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== "admin") return;

    const adminPw = document.getElementById("reg-cand-admin-pw").value;
    const errEl = document.getElementById("reg-cand-pw-error");
    errEl.classList.add("hidden");

    if (adminPw !== currentUser.password) {
        errEl.querySelector("span").innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        lucide.createIcons();
        return;
    }

    const name = document.getElementById("reg-cand-name").value.trim();
    const grade = document.getElementById("reg-cand-grade").value;
    const party = document.getElementById("reg-cand-party").value.trim();
    const slogan = document.getElementById("reg-cand-slogan").value.trim();
    const rawPolicies = document.getElementById("reg-cand-policies").value.trim();
    const policiesList = rawPolicies.split("\n").filter(l => l.trim() !== "");
    const nextId = candidates.length > 0 ? Math.max(...candidates.map(c => c.id)) + 1 : 1;

    candidates.push({ id: nextId, name, grade, party, slogan, avatar: "🎓", policies: policiesList, votes: 0, approved: true });
    closeCandidateRegModal();
    showAdminToast(`เพิ่มผู้สมัคร "${name}" เรียบร้อยแล้ว`);
    updateUI();
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

function executeAdminPwAction() {
    const pw = document.getElementById("admin-pw-input").value;
    const errEl = document.getElementById("admin-pw-error");
    errEl.classList.add("hidden");
    if (!currentUser || pw !== currentUser.password) {
        errEl.querySelector("span").innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        lucide.createIcons();
        return;
    }
    closeAdminPwModal();
    if (_adminPwCallback) _adminPwCallback();
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

function saveElectionSettings() {
    const pw = document.getElementById("election-settings-admin-pw").value;
    const errEl = document.getElementById("election-settings-pw-error");
    errEl.classList.add("hidden");

    if (!currentUser || pw !== currentUser.password) {
        errEl.innerText = "รหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง";
        errEl.classList.remove("hidden");
        return;
    }

    const title = document.getElementById("election-title-input").value.trim();
    const closeTimeVal = document.getElementById("election-close-time").value;

    if (title) electionTitle = title;
    if (closeTimeVal) {
        electionCloseTime = new Date(closeTimeVal);
        startCountdown();
    } else {
        electionCloseTime = null;
        stopCountdown();
    }

    // ==========================================
    // 🟢 ส่วนที่ต้องเพิ่ม: ดึงค่าสถานะจากหน้าเว็บมาอัปเดตระบบ
    // ==========================================
    // สมมติว่า Element ที่ใช้เลือกสถานะเปิด/ปิดหีบใน HTML มี id ชื่อ "election-status-select"
    const statusSelect = document.getElementById("election-status-select");
    if (statusSelect) {
        // ถ้าเลือก "active" หรือ "open" ให้เป็น true / นอกเหนือจากนั้น (เช่น "closed") ให้เป็น false
        isElectionActive = (statusSelect.value === "active");
    }
    // ==========================================

    closeElectionSettingsModal();
    showAdminToast("บันทึกการตั้งค่าการเลือกตั้งเรียบร้อยแล้ว");
    updateUI();
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
            if (isElectionOpen) { isElectionOpen = false; updateUI(); showAdminToast("⏰ ปิดหีบอัตโนมัติแล้ว!"); }
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
        () => {
            isElectionOpen = !isElectionOpen;
            if (!isElectionOpen) stopCountdown();
            updateUI();
            showAdminToast(isElectionOpen ? "เปิดหีบรับคะแนนแล้ว" : "ปิดหีบรับคะแนนแล้ว");
        }
    );
}

function resetElectionData() {
    openAdminPwModal(
        "⚠ ยืนยันการรีเซ็ตข้อมูลทั้งหมด",
        "จะลบคะแนนโหวตทั้งหมดและคืนสิทธิ์โหวตให้นักเรียนทุกคน ไม่สามารถย้อนกลับได้",
        "ยืนยัน รีเซ็ตทั้งหมด",
        () => {
            candidates.forEach(c => c.votes = 0);
            students.forEach(s => { s.voted = false; delete s.votedFor; });
            auditLogs = [];
            if (currentUser) { currentUser.voted = false; delete currentUser.votedFor; }
            updateUI();
            showAdminToast("รีเซ็ตข้อมูลเรียบร้อยแล้ว");
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
            showAdminToast(`อนุมัติ "${studentName}" เรียบร้อยแล้ว`);
            updateUI();
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
        () => {
            const index = students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                const deletedName = students[index].name;
                students.splice(index, 1);
                const candIdx = candidates.findIndex(c => c.name === deletedName);
                if (candIdx !== -1) candidates.splice(candIdx, 1);
                showAdminToast(`ลบ "${deletedName}" ออกจากระบบแล้ว`);
                updateUI();
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

function handleAddStudentSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("add-std-name").value.trim();
    const id = document.getElementById("add-std-id").value.trim();
    const grade = document.getElementById("add-std-grade").value;
    if (id.length !== 5) { alert("รหัสนักเรียนต้องเป็นตัวเลข 5 หลัก"); return; }
    if (students.some(s => s.id === id)) { alert("รหัสนักเรียนนี้ถูกใช้ไปแล้ว"); return; }
    students.push({ id, name, grade, role: "student", voted: false, candidateApproved: false });
    closeAddStudentModal();
    updateUI();
}

// === 8. AI CHATBOT ===
function sendChat() {
    const input = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");
    const userMessage = input.value.trim();
    if (!userMessage) return;

    chatBox.innerHTML += `
    <div class="flex justify-end">
      <div class="bg-blue-600 text-white p-3 rounded-xl max-w-[80%]">${userMessage}</div>
    </div>
  `;

    let botReply = "ขออภัย ฉันยังไม่มีข้อมูลในด้านนี้";
    const msg = userMessage.toLowerCase();

    if (msg.includes("wifi") || msg.includes("ไวไฟ") || msg.includes("เทคโนโลยี") || msg.includes("การเรียน")) {
        botReply = `🎓 แนะนำ: พรรคพลังนักเรียนใหม่\nเพราะพรรคนี้เน้น:\n• พัฒนา WiFi โรงเรียน\n• เทคโนโลยีการเรียน\n• การศึกษายุคใหม่`;
    } else if (msg.includes("สุขภาพจิต") || msg.includes("ความเครียด") || msg.includes("co-working") || msg.includes("ห้องสมุด")) {
        botReply = `🌱 แนะนำ: พรรคก้าวรุ่งพัฒนา\nเพราะพรรคนี้เน้น:\n• สุขภาพจิตนักเรียน\n• Co-working Space\n• สนับสนุนความหลากหลาย`;
    } else if (msg.includes("กีฬา") || msg.includes("กิจกรรม") || msg.includes("ดนตรี") || msg.includes("esports")) {
        botReply = `🎸 แนะนำ: พรรครวมมิตรกิจกรรม\nเพราะพรรคนี้เน้น:\n• กีฬา\n• ดนตรี\n• Esports\n• กิจกรรมโรงเรียน`;
    } else {
        botReply = `🤖 ฉันสามารถช่วยแนะนำพรรคได้จาก:\n• เทคโนโลยี\n• กีฬา\n• กิจกรรม\n• สุขภาพจิต\n• ห้องสมุด\n• WiFi\n• ดนตรี\nลองถามใหม่อีกครั้ง 😊`;
    }

    setTimeout(() => {
        chatBox.innerHTML += `
      <div class="flex justify-start">
        <div class="bg-slate-200 text-slate-800 p-3 rounded-xl max-w-[80%] whitespace-pre-line">🤖 ${botReply}</div>
      </div>
    `;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);

    input.value = "";
}

/* =========================
   HISTORY RESULTS
========================= */

function toggleHistoryResults() {
    const historySection = document.getElementById("history-results");

    historySection.classList.toggle("hidden");
}
