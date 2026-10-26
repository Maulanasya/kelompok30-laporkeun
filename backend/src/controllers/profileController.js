const prisma = require("../config/db");
const bcrypt = require("bcryptjs");

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD = 8;

const PROFILE_SELECT = {
  id: true,
  nama: true,
  email: true,
  nisn: true,
  kelas: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// Sertakan atribut 'peran' (huruf kecil) untuk kebutuhan kustomisasi frontend
const withPeran = (user) => ({ ...user, peran: user.role.toLowerCase() });

// GET /api/profile & GET /api/profile/me
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: PROFILE_SELECT,
    });

    if (!user) {
      return res.status(404).json({ error: "Akun tidak ditemukan." });
    }

    return res.json({ user: withPeran(user) });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const nama =
      typeof req.body.nama === "string" ? req.body.nama.trim() : "";
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const errors = {};

    if (!nama) {
      errors.nama = "Nama lengkap wajib diisi.";
    }

    if (!email) {
      errors.email = "Email wajib diisi.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Format email belum benar.";
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return res.status(404).json({ error: "Akun tidak ditemukan." });
    }

    const nisn =
      typeof req.body.nisn === "string"
        ? req.body.nisn.trim()
        : req.body.nisn === null
        ? null
        : undefined;

    if (
      currentUser.role === "SISWA" &&
      nisn !== undefined &&
      nisn !== null &&
      nisn !== "" &&
      !/^\d{10}$/.test(nisn)
    ) {
      errors.nisn = "NISN harus terdiri dari 10 angka.";
    }

    const kelas =
      typeof req.body.kelas === "string" ? req.body.kelas.trim() : undefined;

    if (Object.keys(errors).length) {
      const field = Object.keys(errors)[0];
      return res.status(400).json({
        error: errors[field],
        field,
        errors,
      });
    }

    // Cek duplikasi email
    const duplicateEmail = await prisma.user.findFirst({
      where: {
        email,
        id: { not: req.user.id },
      },
      select: { id: true },
    });

    if (duplicateEmail) {
      errors.email = "Email sudah terdaftar.";
    }

    const data = { nama, email };

    // Validasi & penyiapan atribut khusus role SISWA
    if (currentUser.role === "SISWA" && nisn !== undefined) {
      data.nisn = nisn || null;

      if (data.nisn) {
        const duplicateNisn = await prisma.user.findFirst({
          where: {
            nisn: data.nisn,
            id: { not: req.user.id },
          },
          select: { id: true },
        });

        if (duplicateNisn) {
          errors.nisn = "NISN sudah terdaftar.";
        }
      }
    }

    if (currentUser.role === "SISWA" && kelas) {
      data.kelas = kelas;
    }

    if (Object.keys(errors).length) {
      const field = Object.keys(errors)[0];
      return res.status(409).json({
        error: errors[field],
        field,
        errors,
      });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: PROFILE_SELECT,
    });

    return res.json({
      message: "Profil berhasil diperbarui.",
      user: withPeran(user),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Email atau NISN sudah digunakan akun lain.",
      });
    }

    console.error("Update Profile Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

// POST /api/profile/change-password
exports.changePassword = async (req, res) => {
  try {
    const passwordLama = String(req.body.passwordLama ?? "");
    const passwordBaru = String(req.body.passwordBaru ?? "");
    const konfirmasiPassword = String(req.body.konfirmasiPassword ?? "");

    if (!passwordLama || !passwordBaru || !konfirmasiPassword) {
      return res.status(400).json({
        error: "Semua kolom kata sandi wajib diisi.",
      });
    }

    if (passwordBaru.length < MIN_PASSWORD) {
      return res.status(400).json({
        error: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.`,
      });
    }

    if (passwordBaru !== konfirmasiPassword) {
      return res.status(400).json({
        error: "Konfirmasi kata sandi baru belum cocok.",
      });
    }

    if (passwordBaru === passwordLama) {
      return res.status(400).json({
        error: "Kata sandi baru harus berbeda dari kata sandi lama.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Akun tidak ditemukan." });
    }

    const isMatch = await bcrypt.compare(passwordLama, user.password);
    if (!isMatch) {
      return res.status(400).json({
        error: "Kata sandi lama salah.",
      });
    }

    const hashed = await bcrypt.hash(passwordBaru, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return res.json({
      message: "Kata sandi berhasil diperbarui.",
      requiresLogin: false,
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};