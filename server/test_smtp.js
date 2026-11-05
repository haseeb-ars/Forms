// server/test_smtp.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

console.log("=== TESTING RESEND API & SMTP CONFIGURATION ===");

const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + "..." : "NOT SET"}`);

// 1. Direct Resend REST API Test
async function testResendRestApi() {
  console.log("\n--- TEST 1: Resend REST API Test ---");
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CarePlus Health <onboarding@resend.dev>",
        to: ["info@careplushealth.co.uk"],
        subject: "Test Email from CarePlus Health (Resend Active)",
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 2px solid #0d9488; border-radius: 8px;">
            <h2 style="color: #0d9488;">✓ CarePlus Health Email Dispatch is Working!</h2>
            <p>Congratulations! Resend has been successfully connected to the CarePlus Health Forms portal.</p>
            <p>Order purchase orders will now be automatically emailed to suppliers and internal management.</p>
          </div>
        `,
      }),
    });

    const data = await resp.json();
    console.log("Resend API Response Status:", resp.status);
    console.log("Resend API Response Data:", data);

    if (resp.ok) {
      console.log("🎉 SUCCESS! Live email delivered to info@careplushealth.co.uk via Resend API!");
    } else {
      console.log("API returned notice:", data.message);
    }
    return { ok: resp.ok, data };
  } catch (err) {
    console.error("REST API fetch error:", err.message);
    return { ok: false, error: err.message };
  }
}

// 2. Resend SMTP Test (Port 587 STARTTLS or 465 SSL)
async function testResendSmtp() {
  console.log("\n--- TEST 2: Resend SMTP Test (smtp.resend.com:465) ---");
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: "resend",
      pass: apiKey,
    },
  });

  try {
    await transporter.verify();
    console.log("✓ Resend SMTP connection verified!");

    const info = await transporter.sendMail({
      from: "CarePlus Health <onboarding@resend.dev>",
      to: "info@careplushealth.co.uk",
      subject: "Test Email (Resend SMTP)",
      text: "Resend SMTP is working perfectly.",
    });
    console.log("✓ SMTP message sent! ID:", info.messageId);
  } catch (err) {
    console.log("SMTP notice:", err.message);
  }
}

async function main() {
  await testResendRestApi();
  await testResendSmtp();
}

main();
