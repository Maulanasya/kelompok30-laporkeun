const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const { getAdminStats, emitAdminStats } = require("../services/adminStats");

const USER_SELECT = {
  id: true,
  nama: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
};

// Admin hanya boleh membuat akun Guru BK dan Psikolog
const ALLOWED_ROLES = ["GURU_BK", "PSIKOLOG"];

const ROLE_LABEL = {
  GURU_BK: "Guru BK",
  PSIKOLOG: "Psikolog",
  ADMIN: "Admin",
  SISWA: "Siswa",
};

// Mengambil statistik dashboard admin
exports.stats = async (req, res) => {
  try {
    res.json({ data: await getAdminStats() });
  } catch (e) {
    console.error("GET /admin/stats gagal:", e);
    res.status(500).json({ error: "Gagal memuat statistik." });
  }
};

// Mengambil daftar seluruh akun pengguna
exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (e) {
    console.error("GET /admin/users gagal:", e);
    res.status(500).json({ error: "Gagal memuat daftar akun." });
  }
};

// Membuat akun baru (khusus Guru BK & Psikolog)
exports.createUser = async (req, res) => {
  try {
    const nama = String(req.body.nama || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role;

    if (!nama || !email || !password) {
      return res.status(400).json({ error: "Semua kolom wajib diisi." });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Format email tidak valid." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Sandi sementara minimal 8 karakter." });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Peran tidak valid." });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email sudah terdaftar." });

    const user = await prisma.user.create({
      data: { nama, email, role, password: await bcrypt.hash(password, 10) },
      select: USER_SELECT,
    });

    emitAdminStats(req.app.get("io"));
    res.status(201).json({ user });
  } catch (e) {
    console.error("POST /admin/users gagal:", e);
    res.status(500).json({ error: "Gagal menyimpan akun." });
  }
};

// Mengaktifkan atau menonaktifkan status akun pengguna
exports.setUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "Status tidak valid." });
    }
    if (id === req.user.id) {
      return res.status(400).json({ error: "Kamu tidak bisa mengubah status akunmu sendiri." });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return res.status(404).json({ error: "Akun tidak ditemukan." });

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_SELECT,
    });

    const io = req.app.get("io");
    // Putus koneksi socket secara langsung jika akun dinonaktifkan
    if (!isActive && io) io.in(`user:${id}`).disconnectSockets(true);
    emitAdminStats(io);

    res.json({ user });
  } catch (e) {
    console.error("PATCH /admin/users/:id/status gagal:", e);
    res.status(500).json({ error: "Gagal mengubah status akun." });
  }
};

// Mengambil riwayat penanganan laporan (tanpa isi laporan & identitas pelapor)
exports.listRiwayat = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 200, 1), 500);

    const rows = await prisma.riwayatStatusLaporan.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        statusSebelumnya: true,
        statusBaru: true,
        catatan: true,
        createdAt: true,
        laporan: { select: { kodeTiket: true, kategori: true } },
        pengubah: { select: { nama: true, role: true } },
      },
    });

    const data = rows.map((r) => ({
      id: r.id,
      kode: r.laporan.kodeTiket,
      kategori: r.laporan.kategori,
      dari: r.statusSebelumnya,
      ke: r.statusBaru,
      catatan: r.catatan || "",
      pengubah: r.pengubah.nama,
      peran: ROLE_LABEL[r.pengubah.role] || r.pengubah.role,
      waktu: r.createdAt,
    }));

    res.json({ data });
  } catch (e) {
    console.error("GET /admin/riwayat gagal:", e);
    res.status(500).json({ error: "Gagal memuat riwayat penanganan." });
  }
};