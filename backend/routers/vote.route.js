import express from "express";
import * as controller from "../controllers/vote.controller.js";

const router = express.Router();

router.post("/", controller.vote); // สำหรับนักเรียนกดโหวต
router.get("/dashboard/:eventId", controller.getDashboard); // สำหรับ Admin ดูสรุปผล

export default router;