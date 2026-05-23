import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

let client: Client | null = null;
let ready = false;
let reinitTimer: ReturnType<typeof setTimeout> | null = null;

function createClient(): Client {
  return new Client({
    authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    },
  });
}

function scheduleReinit() {
  if (reinitTimer) return;
  reinitTimer = setTimeout(() => {
    reinitTimer = null;
    console.log("🔄  WhatsApp reinitializing...");
    startClient();
  }, 5000);
}

function startClient() {
  ready = false;
  client = createClient();

  client.on("qr", (qr) => {
    console.log("\n📱  WhatsApp QR Code — Phone ne scan karo:\n");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    ready = true;
    console.log("✅  WhatsApp connected! OTP messages ready.\n");
  });

  client.on("disconnected", (reason) => {
    ready = false;
    console.log(`⚠️   WhatsApp disconnected (${reason}). Will retry in 5s...`);
    scheduleReinit();
  });

  client.initialize().catch((err) => {
    console.error("WhatsApp init error:", (err as Error).message);
    scheduleReinit();
  });
}

// On ts-node-dev restart, destroy old browser cleanly
process.on("SIGTERM", () => client?.destroy().catch(() => {}));
process.on("exit",    () => client?.destroy().catch(() => {}));

export function initWhatsApp() {
  startClient();
}

export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  if (!client || !ready) {
    console.log(`\n📱  [WhatsApp not ready] OTP for ${phone}:  ${otp}\n`);
    return false;
  }

  const chatId = `91${phone}@c.us`;
  const msg =
    `🥛 *Milk Management System*\n\n` +
    `Your login verification code is:\n\n` +
    `🔑  *${otp}*\n\n` +
    `⏳ Valid for 10 minutes only.\n` +
    `🚫 Do not share this code with anyone.`;

  try {
    await client.sendMessage(chatId, msg);
    console.log(`✅  OTP sent via WhatsApp to ${phone}`);
    return true;
  } catch (err: any) {
    // Detached frame = browser restarted, reinitialize
    if (err?.message?.includes("detached") || err?.message?.includes("Session closed")) {
      ready = false;
      scheduleReinit();
    }
    console.log(`\n📱  Fallback OTP for ${phone}:  ${otp}\n`);
    return false;
  }
}
