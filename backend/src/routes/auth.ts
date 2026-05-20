import { Router, Request, Response } from "express";

const router = Router();

// In-memory OTP store: phone → { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

router.post("/send-otp", (req: Request, res: Response) => {
  const { phone } = req.body as { phone: string };
  if (!phone || !/^\d{10}$/.test(phone)) {
    res.status(400).json({ error: "Invalid phone number" });
    return;
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  console.log(`\n📱  OTP for ${phone}:  ${otp}\n`);
  // In production: send via SMS. For dev, return in response.
  res.json({ success: true, otp });
});

router.post("/verify-otp", (req: Request, res: Response) => {
  const { phone, otp } = req.body as { phone: string; otp: string };
  const record = otpStore.get(phone);
  if (!record) {
    res.status(400).json({ error: "OTP not found. Request a new one." });
    return;
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    res.status(400).json({ error: "OTP expired." });
    return;
  }
  if (record.otp !== otp) {
    res.status(400).json({ error: "Invalid OTP." });
    return;
  }
  otpStore.delete(phone);
  res.json({ success: true, phone });
});

export default router;
