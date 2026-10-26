const express = require("express");
const { listPublished, getPublishedById } = require("../controllers/artikelController");

const router = express.Router();

router.get("/", listPublished);
router.get("/:id", getPublishedById); 

module.exports = router;