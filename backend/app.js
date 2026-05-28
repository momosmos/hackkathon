import express from "express";
import cors from "cors";
import studentRoutes from "./routers/student.route.js";
import adminRoutes from "./routers/admin.route.js"; // นำเข้า Route ของ Admin
import voteRoutes from "./routers/vote.route.js"; // นำเข้า Route ของ vote
// import aiRoutes from "./routers/ai.route.js";     // นำเข้า Route ของ ai
// import electionRoutes from "./routers/election.route.js"; // นำเข้า Route ของ election
import otpRoutes from "./routers/otp.routes.js"; // นำเข้า Route ของ otp

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// ใส่middle

// สารบัญเส้นทาง API ของระบบ
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes); // เรียกใช้ผ่าน /api/ Admin
app.use("/api/votes", voteRoutes); // เรียกใช้ผ่าน /api/vote
// app.use("/api/ai", aiRoutes);  // เรียกใช้ผ่าน /api/ai
// app.use("/api/elections", electionRoutes); // เรียกใช้ผ่าน /api/election
app.use(otpRoutes);


app.get("/health", (req, res) => {
    res.send("Good Health");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend is running on ${PORT}`);
});