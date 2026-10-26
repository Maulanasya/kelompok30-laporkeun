const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_kode_jwt_laporkeun_123";

const NISN_LENGTH = 10;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const KELAS_REGEX = /^(X|XI|XII)-\d{1,2}$/;

// Format data user untuk respon publik (tanpa password)
const toPublicUser = (user) => ({
  id: user.id,
  nama: user.nama,
  email: user.email,
  nisn: user.nisn,
  kelas: user.kelas,
  role: user.role,
  peran: user.role.toLowerCase(),
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// Helper respon error per kolom
const fail = (res, errors, status = 400) => {
  const field = Object.keys(errors)[0];
  return res.status(status).json({ error: errors[field], field, errors });
};

// Register User (Siswa)
exports.register = async (req, res) => {
  try {
    const nama = String(req.body.nama || req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const nisn = req.body.nisn ? String(req.body.nisn).trim() : "";
    const kelas = req.body.kelas ? String(req.body.kelas).trim() : "";
    const password = req.body.password;

    const errors = {};

    if (!nisn) {
      errors.nisn = "NISN wajib diisi.";
    } else if (!new RegExp(`^\\d{${NISN_LENGTH}}$`).test(nisn)) {
      errors.nisn = `NISN terdiri dari ${NISN_LENGTH} angka.`;
    }

    if (!nama) errors.nama = "Nama lengkap wajib diisi.";

    if (!email) {
      errors.email = "Email wajib diisi.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Format email belum benar.";
    }

    if (!kelas) {
      errors.kelas = "Kelas wajib dipilih.";
    } else if (!KELAS_REGEX.test(kelas)) {
      errors.kelas = "Kelas tidak valid.";
    }

    if (!password || typeof password !== "string") {
      errors.password = "Password wajib diisi.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    }

    if (Object.keys(errors).length) return fail(res, errors);

    // Cek duplikasi email & NISN
    const existing = await prisma.user.findMany({
      where: { OR: [{ email }, { nisn }] },
      select: { email: true, nisn: true },
    });

    if (existing.some((u) => u.email === email)) {
      errors.email = "Email sudah terdaftar.";
    }
    if (existing.some((u) => u.nisn === nisn)) {
      errors.nisn = "NISN sudah terdaftar.";
    }
    if (Object.keys(errors).length) return fail(res, errors);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        nisn,
        kelas,
        password: hashedPassword,
        role: "SISWA",
      },
    });

    return res.status(201).json({
      message: "Registrasi berhasil!",
      user: toPublicUser(newUser),
    });
  } catch (error) {
    // Tangani error unique constraint dari Prisma (P2002)
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

// Login User
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
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// Ambil profil user aktif
exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user || user.isActive === false) {
      return res
        .status(401)
        .json({ error: "Sesi tidak valid. Silakan masuk lagi." });
    }

    return res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error("Me Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};