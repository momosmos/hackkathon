// --- CONFIG (Phase 1: Setup) ---
const ELECTION = {
    title: "การเลือกตั้งประธานรุ่นปี 2569",
    start: new Date("2026-05-26T08:00:00"),
    end: new Date("2026-05-26T18:00:00"), // ปิดหีบ 6 โมงเย็น
    totalStudents: 1200
};

// Data พรรคและทีมงาน (candidate_member)
const candidates = [
    { id: 1, party: "พรรคก้าวหน้า", lead: "นายสมชาย", slogan: "WiFi แรงทุกตึก ห้องน้ำสะอาด", members: ["นาย A", "นางสาว B"], votes: 450 },
    { id: 2, party: "พรรคพลังไอที", lead: "นางสาวสมหญิง", slogan: "เรียนโค้ดดิ้งฟรี มีอีสปอร์ต", members: ["นาย C", "นาย D"], votes: 320 }
];

// ข้อมูลนักศึกษา (student)
let user = { id: "69001", name: "จิรายุ รักเรียน", voted_status: 0 }; 
let selectedCandidateId = null;

// --- INITIALIZE ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.getElementById('election-title').innerText = ELECTION.title;
    renderUserStatus();
    renderCandidates();
    updateDashboard();
    startTimer();
});

// --- TIMER (Phase 1) ---
function startTimer() {
    const timerEl = document.getElementById('timer');
    setInterval(() => {
        const now = new Date();
        if (now < ELECTION.start) {
            timerEl.innerText = "ยังไม่เปิดหีบ";
        } else if (now > ELECTION.end) {
            timerEl.innerText = "ปิดหีบแล้ว";
            timerEl.classList.add('text-red-500');
        } else {
            const diff = ELECTION.end - now;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            timerEl.innerText = `${h}:${m}:${s}`;
        }
    }, 1000);
}

// --- VOTING (Phase 2) ---
function renderCandidates() {
    const grid = document.getElementById('candidate-grid');
    grid.innerHTML = candidates.map(can => `
        <div class="candidate-card bg-white p-6 rounded-3xl border-2 ${user.voted_status === 1 ? 'border-slate-100 opacity-60 voted' : 'border-slate-50 cursor-pointer'}" 
             onclick="openModal(${can.id}, '${can.party}')">
            <div class="flex justify-between items-start mb-4">
                <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">เบอร์ ${can.id}</span>
                <i data-lucide="award" class="text-slate-200"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-900">${can.party}</h3>
            <p class="text-blue-600 text-sm font-medium mb-3">"${can.slogan}"</p>
            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-4">ทีมงาน: ${can.members.join(', ')}</div>
            <button class="w-full py-3 rounded-2xl font-bold text-sm transition ${user.voted_status === 1 ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-blue-600'}">
                ${user.voted_status === 1 ? 'ใช้สิทธิ์ไปแล้ว' : 'ลงคะแนน'}
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

function openModal(id, name) {
    if (user.voted_status === 1) return;
    const now = new Date();
    if (now < ELECTION.start || now > ELECTION.end) return alert("นอกเวลาทำการเลือกตั้ง");
    
    selectedCandidateId = id;
    document.getElementById('confirm-target').innerText = name;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function executeVote() {
    // Phase 2: Transaction Process (Mock)
    // Step A: โยนบัตรลงหีบ
    const candidate = candidates.find(c => c.id === selectedCandidateId);
    candidate.votes++;
    
    // Step B: ตัดสิทธิ์
    user.voted_status = 1;

    closeModal();
    renderUserStatus();
    renderCandidates();
    updateDashboard();
    alert("ลงคะแนนสำเร็จ! ระบบบันทึกข้อมูลของคุณเรียบร้อยแล้ว");
}

// --- AI HELPER (Phase 2) ---
function sendChat() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    if (!input.value.trim()) return;

    box.innerHTML += `<div class="bg-blue-600 p-3 rounded-2xl rounded-tr-none ml-8 text-white">${input.value}</div>`;
    
    const query = input.value;
    input.value = '';
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
        let reply = "ขออภัยครับ ผมยังไม่มีข้อมูลนโยบายเรื่องนี้ ลองถามเรื่อง 'WiFi' หรือ 'อีสปอร์ต' ดูครับ";
        if (query.includes("WiFi")) reply = "พรรคก้าวหน้า (เบอร์ 1) มีนโยบายเน้น WiFi แรงทั่วตึกครับ!";
        if (query.includes("อีสปอร์ต")) reply = "พรรคพลังไอที (เบอร์ 2) มีนโยบายส่งเสริมแข่งอีสปอร์ตครับ!";
        
        box.innerHTML += `<div class="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">🤖: ${reply}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 600);
}

// --- DASHBOARD (Phase 3) ---
function updateDashboard() {
    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
    const percent = ((totalVotes / ELECTION.totalStudents) * 100).toFixed(1);
    
    document.getElementById('turnout-bar').style.width = percent + "%";
    document.getElementById('turnout-count').innerText = `${totalVotes} คน`;
    document.getElementById('turnout-percent').innerText = `${percent}%`;
}

function renderUserStatus() {
    const nav = document.getElementById('user-nav');
    nav.innerHTML = `
        <span class="opacity-50">|</span>
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-xs border border-blue-700">👤</div>
            <div class="text-left">
                <p class="leading-none">${user.name}</p>
                <p class="text-[10px] ${user.voted_status === 1 ? 'text-emerald-400' : 'text-amber-400'}">${user.voted_status === 1 ? 'ใช้สิทธิ์แล้ว' : 'ยังไม่ใช้สิทธิ์'}</p>
            </div>
        </div>
    `;
}

function closeModal() { document.getElementById('confirm-modal').classList.add('hidden'); }
// ตัวอย่างการดึงข้อมูลตอนโหลดหน้าเว็บ
async function loadData() {
    const res = await fetch('http://localhost:3000/api/election-status');
    const data = await res.json();
    // นำ data.candidates ไป render...
}

// ตัวอย่างการส่งโหวตไป Backend
async function executeVote() {
    try {
        const response = await fetch('http://localhost:3000/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: user.id,
                candidate_id: selectedCandidateId
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("ลงคะแนนสำเร็จ!");
            window.location.reload(); // รีโหลดเพื่ออัปเดตสถานะ
        } else {
            alert(result.message);
        }
    } catch (err) {
        alert("การเชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    }
}