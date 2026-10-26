const express = require("express");
const router = express.Router();
const { register, login, me } = require("../controllers/authController");
const {
  forgotPassword,
  verifyCode,
  resetPassword,
} = require("../controllers/passwordController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, me);

// Lupa password: kirim kode -> cek kode -> sandi baru
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);

module.exports = router;