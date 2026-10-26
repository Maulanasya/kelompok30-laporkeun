const express = require("express");
const router = express.Router();
const {
  list,
  create,
  update,
  setPublished,
  remove,
} = require("../controllers/adminArtikelController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

router.use(verifyToken, requireRole("ADMIN"));

router.get("/", list);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/publish", setPublished);
router.delete("/:id", remove);

module.exports = router;