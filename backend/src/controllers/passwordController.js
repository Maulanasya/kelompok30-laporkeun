const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { sendResetCode } = require("../services/mailer");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_kode_jwt_laporkeun_123";
const RESET_SECRET = `${JWT_SECRET}:reset-password`;

const CODE_LENGTH = 4;
const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_SEC = 60;
const MAX_ATTEMPTS = 5;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const fail = (res, status, error, field) =>
  res.status(status).json({ error, ...(field ? { field } : {}) });

const SESSION_ENDED = "Sesi reset sudah berakhir. Ulangi dari awal.";

// Langkah 1: Minta kode verifikasi reset password ke email
exports.forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) return fail(res, 400, "Email wajib diisi.", "email");
    if (!EMAIL_REGEX.test(email)) {
      return fail(res, 400, "Format email belum benar.", "email");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail(res, 404, "Email belum terdaftar.", "email");
    if (!user.isActive) {
      return fail(res, 403, "Akun tidak aktif. Hubungi admin sekolah.");
    }

    // Rate limiting permintaan kode
    const last = await prisma.passwordReset.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (last) {
      const wait =
        RESEND_COOLDOWN_SEC -
        Math.floor((Date.now() - last.createdAt.getTime()) / 1000);

      if (wait > 0) {
        return res.status(429).json({
          error: `Tunggu ${wait} detik sebelum meminta kode lagi.`,
          retryAfter: wait,
        });
      }
    }

    const code = String(crypto.randomInt(0, 10 ** CODE_LENGTH)).padStart(
      CODE_LENGTH,
      "0"
    );
    const kodeHash = await bcrypt.hash(code, 10);

    // Hanguskan kode lama dan simpan kode baru
    const [, record] = await prisma.$transaction([
      prisma.passwordReset.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordReset.create({
        data: {
          userId: user.id,
          kodeHash,
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        },
      }),
    ]);

    try {
      await sendResetCode(user.email, user.nama, code);
    } catch (mailError) {
      console.error("Mail Error:", mailError);
      await prisma.passwordReset
        .delete({ where: { id: record.id } })
        .catch(() => {});
      return fail(res, 500, "Gagal mengirim email. Coba lagi sebentar lagi.");
    }

    return res.json({
      message: "Kode verifikasi sudah dikirim ke email.",
      expiresIn: CODE_TTL_MS / 1000,
      resendIn: RESEND_COOLDOWN_SEC,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return fail(res, 500, "Terjadi kesalahan pada server.");
  }
};

// Langkah 2: Verifikasi kode OTP & buat resetToken
exports.verifyCode = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!email) return fail(res, 400, "Email wajib diisi.");
    if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code)) {
      return fail(res, 400, `Kode terdiri dari ${CODE_LENGTH} digit.`, "code");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return fail(res, 400, "Kode salah atau sudah kedaluwarsa.", "code");
    }

    const record = await prisma.passwordReset.findFirst({
      where: { userId: user.id, usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!record || record.expiresAt < new Date()) {
      return fail(res, 400, "Kode sudah kedaluwarsa. Kirim ulang kode.", "code");
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return fail(
        res,
        429,
        "Terlalu banyak percobaan. Kirim ulang kode.",
        "code"
      );
    }

    const isValid = await bcrypt.compare(code, record.kodeHash);
    if (!isValid) {
      const updated = await prisma.passwordReset.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = MAX_ATTEMPTS - updated.attempts;
      if (remaining <= 0) {
        await prisma.passwordReset.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        });
        return fail(
          res,
          429,
          "Terlalu banyak percobaan. Kirim ulang kode.",
          "code"
        );
      }

      return fail(
        res,
        400,
        `Kode salah. Sisa percobaan: ${remaining}.`,
        "code"
      );
    }

    // Tandai terverifikasi & terbitkan JWT reset token (10m)
    await prisma.passwordReset.update({
      where: { id: record.id },
      data: {
        verifiedAt: new Date(),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    const resetToken = jwt.sign(
      { rid: record.id, purpose: "reset" },
      RESET_SECRET,
      { expiresIn: "10m" }
    );

    return res.json({ message: "Kode benar.", resetToken });
  } catch (error) {
    console.error("Verify Code Error:", error);
    return fail(res, 500, "Terjadi kesalahan pada server.");
  }
};

// Langkah 3: Simpan password baru menggunakan resetToken
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!password || typeof password !== "string") {
      return fail(res, 400, "Password wajib diisi.", "password");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return fail(
        res,
        400,
        `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
        "password"
      );
    }

    let payload;
    try {
      payload = jwt.verify(String(resetToken || ""), RESET_SECRET);
    } catch {
      return fail(res, 400, SESSION_ENDED, "token");
    }

    if (payload.purpose !== "reset") {
      return fail(res, 400, SESSION_ENDED, "token");
    }

    const record = await prisma.passwordReset.findUnique({
      where: { id: payload.rid },
    });

    if (
      !record ||
      record.usedAt ||
      !record.verifiedAt ||
      record.expiresAt < new Date()
    ) {
      return fail(res, 400, SESSION_ENDED, "token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password user & hanguskan seluruh sesi reset milik user tersebut
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.json({ message: "Kata sandi berhasil diubah." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return fail(res, 500, "Terjadi kesalahan pada server.");
  }
};