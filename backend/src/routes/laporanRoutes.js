const express = require("express");
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
  kirimTiketKeWa,
} = require("../controllers/laporanController");
const { verifyToken } = require("../middlewares/authMiddleware");

// Batas body request Vercel ±4,5 MB, jadi file dibatasi 4 MB
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// File disimpan di memori (bukan disk), lalu diteruskan ke Cloudinary di controller
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("TIPE_FILE")),
});

// Middleware untuk menangani upload file
const uploadBukti = (req, res, next) => {
  upload.single("bukti")(req, res, (err) => {
    if (!err) return next();

    console.error("Upload Bukti Error:", err.code || err.message);

    const text =
      err.code === "LIMIT_FILE_SIZE"
        ? "Ukuran file maksimal 4 MB."
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