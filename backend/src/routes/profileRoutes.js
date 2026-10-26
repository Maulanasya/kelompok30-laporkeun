const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profileController");

const {
  verifyToken,
} = require("../middlewares/authMiddleware");

router.get("/", verifyToken, getProfile);
router.get("/profile/me", verifyToken, getProfile); 
router.put("/", verifyToken, updateProfile);
router.post("/change-password", verifyToken, changePassword); 

module.exports = router;