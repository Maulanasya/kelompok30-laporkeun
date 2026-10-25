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
  updateLaporanSiswa,
  archiveLaporan,
  getDaftarPsikolog,
  alihkanKePsikolog,
  kirimTiketKeWa, // <-- IMPORT FUNGSI BARU
} = require("../controllers/laporanController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Konfigurasi direktori penyimpanan file bukti
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
    // Nama file diacak untuk keamanan, ekstensi asli dipertahankan
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

// Middleware untuk menangani upload file dan membersihkan file jika request gagal
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

// Middleware untuk membatasi akses berdasarkan peran (role)
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

const STAFF = ["GURU_BK", "PSIKOLOG", "ADMIN"];
const MANAGER = ["GURU_BK", "ADMIN"];

// --- ROUTE PUBLIK (Tanpa Login) ---

// Melacak laporan berdasarkan kode tiket
router.get("/tiket/:kodeTiket", getLaporanByTiket);

// Kirim ulang kode tiket ke WhatsApp (dari halaman Success)
router.post("/:kodeTiket/kirim-wa", kirimTiketKeWa); 

// --- ROUTE SISWA (Wajib Login) ---

// Membuat, melihat, dan memperbarui laporan sendiri
router.post(
  "/",
  verifyToken,
  requireRole("SISWA"),
  uploadBukti,
  createLaporan
);
router.get("/saya", verifyToken, requireRole("SISWA"), getLaporanSaya);
router.put("/:id", verifyToken, requireRole("SISWA"), updateLaporanSiswa);

// --- ROUTE STAF (Guru BK / Psikolog / Admin) ---

// Guru BK / Admin: Mengelola daftar psikolog, pengalihan laporan, dan arsip
router.get("/psikolog", verifyToken, requireRole(...MANAGER), getDaftarPsikolog);
router.patch(
  "/:id/alihkan",
  verifyToken,
  requireRole(...MANAGER),
  alihkanKePsikolog
);
router.patch(
  "/:id/archive",
  verifyToken,
  requireRole(...MANAGER),
  archiveLaporan
);

// Staf (Guru BK / Psikolog / Admin): Melihat daftar, detail, dan mengubah status laporan
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