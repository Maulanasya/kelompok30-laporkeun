const prisma = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "rahasia_kode_jwt_laporkeun_123";

// Register User
exports.register = async (req, res) => {
  try {
    const nama = (req.body.nama || req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const nisn = req.body.nisn ? String(req.body.nisn).trim() : null;
    const { password } = req.body;

    if (!nama || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nama, email, dan password wajib diisi." });
    }

    // Cek apakah email atau NISN sudah terdaftar
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(nisn ? [{ nisn }] : [])],
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email atau NISN sudah terdaftar." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    // Role dikunci ke SISWA.
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        nisn,
        password: hashedPassword,
        role: "SISWA",
      },
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
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Email atau NISN sudah terdaftar." });
    }
    console.error("Register Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// Login User (bisa pakai NISN atau Email)
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const rawId = req.body.identifier || req.body.email || req.body.nisn;
    const identifier = rawId ? String(rawId).trim() : "";

    if (!identifier || !password) {
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
      return res
        .status(401)
        .json({ error: "NISN/email atau password salah." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: "Akun tidak aktif." });
    }

    // Cek password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "NISN/email atau password salah." });
    }

    // Generate JWT Token
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