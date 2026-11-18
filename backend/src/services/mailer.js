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

const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const STATUS_LABEL = {
  PENDING: "Menunggu Ditinjau",
  DITINJAU: "Ditinjau",
  PROSES: "Sedang Diproses",
  SELESAI: "Selesai",
};

const safeSend = async ({ to, subject, text, html }) => {
  if (!to) return;
  if (!transporter) {
    console.log(`\n[MAIL DEV] Ke ${to} | ${subject}\n${text}\n`);
    return;
  }
  try {
    await transporter.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, text, html });
  } catch (err) {
    console.error("[MAIL] Gagal kirim notifikasi:", err.message);
  }
};

const layout = ({ nama, judul, isi, link, tombol }) => `
  <div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;color:#0F4C5C">
    <h2 style="margin-bottom:4px">LaporKeun!</h2>
    <p>Halo ${escapeHtml(nama)},</p>
    <p><b>${escapeHtml(judul)}</b></p>
    <p>${isi}</p>
    <p style="margin:20px 0">
      <a href="${link}" style="background:#0F4C5C;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${escapeHtml(tombol)}</a>
    </p>
    <p style="font-size:12px;color:#64748B">Email otomatis, jangan dibalas. Demi privasi, isi laporan dan pesan tidak ditampilkan di email ini.</p>
  </div>`;

exports.sendStatusChange = ({ to, nama, kodeTiket, status }) => {
  const label = STATUS_LABEL[status] || status;
  const link = `${CLIENT_URL}/riwayat-laporan?kode=${encodeURIComponent(kodeTiket)}`;
  return safeSend({
    to,
    subject: "Status laporanmu diperbarui - LaporKeun!",
    text: `Halo ${nama},\n\nStatus laporan ${kodeTiket} kini: ${label}.\nLihat detail: ${link}`,
    html: layout({
      nama,
      judul: "Status laporanmu diperbarui",
      isi: `Status laporan <b>${escapeHtml(kodeTiket)}</b> kini: <b>${escapeHtml(label)}</b>.`,
      link,
      tombol: "Lihat Laporan",
    }),
  });
};

exports.sendNewMessage = ({ to, nama, kodeTiket, dari }) => {
  const link = `${CLIENT_URL}/chat`; 
  return safeSend({
    to,
    subject: "Ada pesan baru - LaporKeun!",
    text: `Halo ${nama},\n\n${dari} mengirim pesan baru pada laporan ${kodeTiket}.\nBuka chat: ${link}`,
    html: layout({
      nama,
      judul: "Ada pesan baru untukmu",
      isi: `${escapeHtml(dari)} mengirim pesan baru pada laporan <b>${escapeHtml(kodeTiket)}</b>.`,
      link,
      tombol: "Buka Chat",
    }),
  });
};