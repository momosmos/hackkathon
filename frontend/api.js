// ===== API CLIENT =====
// เชื่อมต่อ Frontend กับ Backend (เสิร์ฟจาก Express เดียวกัน จึงใช้ path สัมพัทธ์ได้)
const API_BASE = "/api";

const TOKEN_KEY = "sv_token";
const USER_KEY = "sv_user";

const Auth = {
    getToken: () => localStorage.getItem(TOKEN_KEY) || null,
    setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
    getUser: () => {
        try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
    },
    setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
    clear: () => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

async function apiFetch(path, { method = "GET", body = null, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const t = Auth.getToken();
        if (t) headers["Authorization"] = `Bearer ${t}`;
    }
    console.log(`[API] ${method} ${path} auth=${auth} token=${Auth.getToken() ? 'yes' : 'no'}`);
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) {
        console.error(`[API] Error ${res.status} for ${method} ${path}:`, data);
        const msg = (data && (data.message || data.error)) || `เกิดข้อผิดพลาด (HTTP ${res.status})`;
        const err = new Error(msg);
        err.status = res.status;
        err.data = data;
        throw err;
    }
    console.log(`[API] ${method} ${path} success`);
    return data;
}

const ApiClient = {
    Auth,

    // ----- Auth -----
    loginStudent: (student_id, password) =>
        apiFetch("/students/login", { method: "POST", body: { student_id, password } }),
    registerStudent: (payload) =>
        apiFetch("/students/register", { method: "POST", body: payload }),
    loginAdmin: (username, password) =>
        apiFetch("/admin/login", { method: "POST", body: { username, password } }),
    me: () => apiFetch("/students/me", { auth: true }),
    forgotPassword: (student_id, email) =>
        apiFetch("/students/forgot-password", { method: "POST", body: { student_id, email } }),
    resetPassword: (resetToken, otp, new_password) =>
        apiFetch("/students/reset-password", { method: "POST", body: { resetToken, otp, new_password } }),

    // ----- Election / Voting -----
    getDashboard: () => apiFetch("/votes/dashboard"),
    getResults: () => apiFetch("/votes/results"),
    requestOtp: (email) =>
        apiFetch("/votes/request-otp", { method: "POST", auth: true, body: { email } }),
    submitVote: (candidate_no, otp, voteToken) =>
        apiFetch("/votes/submit", { method: "POST", auth: true, body: { candidate_no, otp, voteToken } }),

    // ----- AI -----
    askAI: (message) =>
        apiFetch("/ai/ask", { method: "POST", auth: true, body: { message } }),
    getChatHistory: () =>
        apiFetch("/ai/history", { auth: true }),

    // ----- Admin -----
    adminGetStudents: () => apiFetch("/admin/students", { auth: true }),
    adminAddStudent: (payload) =>
        apiFetch("/admin/students", { method: "POST", auth: true, body: payload }),
    adminDeleteStudent: (student_id) =>
        apiFetch(`/admin/students/${encodeURIComponent(student_id)}`, { method: "DELETE", auth: true }),
    adminAddCandidate: (payload) =>
        apiFetch("/admin/candidates", { method: "POST", auth: true, body: payload }),
    adminSetCandidateStatus: (candidate_id, status) =>
        apiFetch("/admin/candidates/status", { method: "PUT", auth: true, body: { candidate_id, status } }),
    adminUpdateCandidate: (candidate_id, party_name, policy_detail) =>
        apiFetch(`/admin/candidates/${candidate_id}`, { method: "PUT", auth: true, body: { party_name, policy_detail } }),
    adminDeleteCandidate: (candidate_id) =>
        apiFetch(`/admin/candidates/${candidate_id}`, { method: "DELETE", auth: true }),
    adminUpdateSettings: (event_id, event_name, end_datetime) =>
        apiFetch("/admin/events/settings", { method: "PUT", auth: true, body: { event_id, event_name, end_datetime } }),
    adminGetEvents: () => apiFetch("/admin/events", { auth: true }),
    adminSetEventStatus: (event_id, is_active) =>
        apiFetch("/admin/events/status", { method: "PUT", auth: true, body: { event_id, is_active } }),
    adminAnalytics: (event_id) =>
        apiFetch(`/admin/analytics/${event_id}`, { auth: true }),
    adminFullReset: () =>
        apiFetch("/admin/full-reset", { method: "DELETE", auth: true }),
};

window.ApiClient = ApiClient;
