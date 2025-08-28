const nodemailer = require("nodemailer");

let cachedTransport;

async function getTransport() {
  if (cachedTransport) return cachedTransport;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  // Optional: auto-create an Ethereal account for dev if missing creds
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransport = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return cachedTransport;
  }

  cachedTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return cachedTransport;
}

async function sendMail({ to, subject, html }) {
  const transporter = await getTransport();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@example.com",
    to,
    subject,
    html,
  });

  // For dev: log preview URL if using Ethereal
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log("[mail] Preview URL:", preview);
  }
  return info;
}

module.exports = { sendMail };
