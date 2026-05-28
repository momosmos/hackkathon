import * as otpRepository from "../repositories/otp.repository.js";
import { sendOTPEmail } from "../utils/email.util.js";
import { generateOTP } from "../utils/otp.util.js";

export const requestOTP = async (email) => {
    const otpCode = generateOTP();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 นาที

    // สั่งส่งเมล
    await sendOTPEmail(email, otpCode);
    
    // สั่งบันทึกข้อมูล
    otpRepository.saveOTP(email, otpCode, expiresAt);

    return { success: true, otpCode }; // otpCode ส่งกลับไป log ดูเฉยๆ
};