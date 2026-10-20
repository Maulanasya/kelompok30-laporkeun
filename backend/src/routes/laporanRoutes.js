const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const router = express.Router();
const {
  createLaporan,
  getAllLaporan,
  getLaporanByTiket,
  getDetailLaporan,
  getLaporanSaya,
  updateStatusLaporan,
} = require("../controllers/laporanController");
const { verifyToken } = require("../middlewares/authMiddleware");

// ---------- Upload bukti (disimpan privat, tidak diserve sebagai file publik) ----------
const UPLOAD_DIR = path.join(__dirname, "../../uploads/bukti");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    // Nama file diacak, nama asli dari pengguna tidak dipakai
    filename: (req, file, cb) =>
      cb(
        null,
        crypto.randomBytes(16).toString("hex") +
          path.extname(file.originalname).toLowerCase()
      ),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("TIPE_FILE")),
});

// Terima 1 file di field "bukti". Kalau request akhirnya ditolak (status >= 400),
// file yang sudah terlanjur tersimpan dihapus supaya tidak jadi sampah.
const uploadBukti = (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode >= 400 && req.file) {
      fs.unlink(req.file.path, () => {});
    }
  });

  upload.single("bukti")(req, res, (err) => {
    if (!err) return next();

    const text =
      err.code === "LIMIT_FILE_SIZE"
        ? "Ukuran file maksimal 5 MB."
        : err.message === "TIPE_FILE"
        ? "Format file harus JPG, PNG, WEBP, atau PDF."
        : "Gagal mengunggah file.";

    return res.status(400).json({ error: text, message: text });
  });
};

// ---------- Pembatasan role ----------
// Membutuhkan verifyToken lebih dulu, yang mengisi req.user dari isi JWT: { id, email, role }
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res
        .status(403)
        .json({ error: "Akses ditolak.", message: "Akses ditolak." });
    }
    next();
  };

const STAFF = ["GURU_BK", "ADMIN"];

// Publik: pelacakan laporan dengan kode tiket (tanpa data pelapor)
router.get("/tiket/:kodeTiket", getLaporanByTiket);

// Siswa (wajib login): buat laporan (+ bukti opsional) & lihat riwayat laporan sendiri
router.post(
  "/",
  verifyToken,
  requireRole("SISWA"),
  uploadBukti,
  createLaporan
);
router.get("/saya", verifyToken, requireRole("SISWA"), getLaporanSaya);

// Guru BK / Admin: daftar, detail lengkap, dan ubah status laporan
router.get("/", verifyToken, requireRole(...STAFF), getAllLaporan);
router.get(
  "/detail/:kodeTiket",
  verifyToken,
  requireRole(...STAFF),
  getDetailLaporan
);
router.patch(
  "/:id/status",
  verifyToken,
  requireRole(...STAFF),
  updateStatusLaporan
);

module.exports = router;