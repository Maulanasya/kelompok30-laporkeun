const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, 
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Mengirim kode verifikasi reset password.
exports.sendResetCode = async (to, nama, code) => {
  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP belum dikonfigurasi.");
    }
    console.log(`\n[MAIL DEV] Kode reset password untuk ${to}: ${code}\n`);
    return;
  }

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject: "Kode verifikasi reset password LaporKeun!",
    text:
      `Halo ${nama},\n\n` +
      `Kode verifikasi untuk membuat kata sandi baru: ${code}\n\n` +
      `Kode berlaku 10 menit. Jangan bagikan kode ini kepada siapa pun.\n` +
      `Kalau kamu tidak meminta reset kata sandi, abaikan email ini.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;color:#0F4C5C">
        <h2 style="margin-bottom:4px">LaporKeun!</h2>
        <p>Halo ${escapeHtml(nama)},</p>
        <p>Gunakan kode berikut untuk membuat kata sandi baru:</p>
        <p style="font-size:34px;letter-spacing:10px;font-weight:700;background:#EAF4F6;border-radius:12px;padding:14px 0;text-align:center">${escapeHtml(code)}</p>
        <p style="font-size:13px;color:#475569">Kode berlaku 10 menit. Jangan bagikan kode ini kepada siapa pun.<br>Kalau kamu tidak meminta reset kata sandi, abaikan email ini.</p>
      </div>`,
  });
};