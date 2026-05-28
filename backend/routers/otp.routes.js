import express from "express";
import { handleRequestOTP } from "../controllers/otp.controller.js";

const router = express.Router();

router.post('/request-otp', handleRequestOTP);

export default router;