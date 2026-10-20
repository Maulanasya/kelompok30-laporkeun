const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Harus sama dengan yang dipakai middlewares/authMiddleware.js. Isi JWT_SECRET di .env.
const JWT_SECRET = process.env.JWT_SECRET || "rahasia_kode_jwt_laporkeun_123";

const NISN_LENGTH = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// Mengirim error per kolom: { error, field, errors }
// - errors : semua kolom yang bermasalah sekaligus ({ email: "...", nisn: "..." })
// - field  : kolom pertama yang bermasalah
// - error  : pesan untuk kolom pertama (dipakai klien yang belum membaca `errors`)
const fail = (res, errors, status = 400) => {
  const field = Object.keys(errors)[0];
  return res.status(status).json({ error: errors[field], field, errors });
};

// Register User (publik, hanya untuk siswa)
exports.register = async (req, res) => {
  try {
    const nama = String(req.body.nama || req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const nisn = req.body.nisn ? String(req.body.nisn).trim() : "";
    const password = req.body.password;

    // 1. Validasi isian (semua kolom diperiksa sekaligus)
    const errors = {};

    if (!nisn) errors.nisn = "NISN wajib diisi.";
    else if (!new RegExp(`^\\d{${NISN_LENGTH}}$`).test(nisn))
      errors.nisn = `NISN terdiri dari ${NISN_LENGTH} angka.`;

    if (!nama) errors.nama = "Nama lengkap wajib diisi.";

    if (!email) errors.email = "Email wajib diisi.";
    else if (!EMAIL_REGEX.test(email)) errors.email = "Format email belum benar.";

    if (!password || typeof password !== "string")
      errors.password = "Password wajib diisi.";
    else if (password.length < MIN_PASSWORD_LENGTH)
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;

    if (Object.keys(errors).length) return fail(res, errors);

    // 2. Cek duplikat: email dan NISN dilaporkan terpisah, bisa muncul dua-duanya
    const existing = await prisma.user.findMany({
      where: { OR: [{ email }, { nisn }] },
      select: { email: true, nisn: true },
    });
    if (existing.some((u) => u.email === email))
      errors.email = "Email sudah terdaftar.";
    if (existing.some((u) => u.nisn === nisn))
      errors.nisn = "NISN sudah terdaftar.";
    if (Object.keys(errors).length) return fail(res, errors);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Role dikunci ke SISWA. Akun GURU_BK / PSIKOLOG / ADMIN dibuat lewat seed atau halaman admin.
    const newUser = await prisma.user.create({
      data: { nama, email, nisn, password: hashedPassword, role: "SISWA" },
      select: {
        id: true,
        nama: true,
        email: true,
        nisn: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil!",
      user: newUser,
    });
  } catch (error) {
    // Unique constraint (jaga-jaga kalau terjadi dua request bersamaan)
    if (error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      const errors = {};
      if (target.includes("email")) errors.email = "Email sudah terdaftar.";
      if (target.includes("nisn")) errors.nisn = "NISN sudah terdaftar.";
      if (!Object.keys(errors).length) {
        errors.email = "Email sudah terdaftar.";
        errors.nisn = "NISN sudah terdaftar.";
      }
      return fail(res, errors);
    }
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// Login User (bisa pakai NISN atau Email, semua peran)
exports.login = async (req, res) => {
  try {
    const password = req.body.password;
    const rawId = req.body.identifier || req.body.email || req.body.nisn;
    const identifier = rawId ? String(rawId).trim() : "";

    if (!identifier || !password || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: "NISN/email dan password wajib diisi." });
    }

    // Cari user berdasarkan email atau NISN
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { nisn: identifier }],
      },
    });
    if (!user) {
      return res.status(401).json({
        error: identifier.includes("@")
          ? "Email belum terdaftar."
          : "NISN belum terdaftar.",
        field: "identifier",
      });
    }

    if (user.isActive === false) {
      return res
        .status(403)
        .json({ error: "Akun tidak aktif. Hubungi admin sekolah." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Password salah.", field: "password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        nisn: user.nisn,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// Data user yang sedang login. Dipakai frontend untuk memvalidasi sesi (butuh verifyToken).
exports.me = (req, res) => res.json({ user: req.user });