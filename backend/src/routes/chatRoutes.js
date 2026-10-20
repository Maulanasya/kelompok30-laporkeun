const express = require("express");
const router = express.Router();
const { getChatHistoryByTiket } = require("../controllers/chatController");

// Ambil riwayat percakapan ruang konsultasi berdasarkan kodeTiket
router.get("/:kodeTiket", getChatHistoryByTiket);

module.exports = router;