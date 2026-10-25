const express = require("express");
const router = express.Router();
const {
  getChatHistoryByTiket,
  getChatList,
  markChatRead,
} = require("../controllers/chatController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Daftar percakapan sesuai peran yang login (siswa / guru BK / psikolog)
router.get("/", verifyToken, getChatList);

router.get("/bk", verifyToken, requireRole("GURU_BK"), getChatList);

// Riwayat pesan sebuah laporan (wajib login dan punya akses ke laporan tsb)
router.get("/:kodeTiket", verifyToken, getChatHistoryByTiket);

// Tandai pesan sebagai sudah dibaca
router.patch("/:kodeTiket/read", verifyToken, markChatRead);

module.exports = router;