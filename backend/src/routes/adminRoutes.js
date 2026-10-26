const express = require("express");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const admin = require("../controllers/adminController");

const router = express.Router();

router.use(verifyToken, requireRole("ADMIN"));

router.get("/stats", admin.stats);

router.get("/users", admin.listUsers);
router.post("/users", admin.createUser);
router.patch("/users/:id/status", admin.setUserStatus);

router.get("/riwayat", admin.listRiwayat);

module.exports = router;