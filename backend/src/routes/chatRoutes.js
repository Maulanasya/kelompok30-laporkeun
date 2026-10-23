const express = require("express");
const router = express.Router();
const { getChatHistoryByTiket, getBkChatList } = require("../controllers/chatController"); // <-- PASTIKAN ADA getBkChatList
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/bk", verifyToken, getBkChatList); // <-- Baris 7 yang error
router.get("/:kodeTiket", getChatHistoryByTiket);

module.exports = router;