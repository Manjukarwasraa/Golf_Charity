const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { runDraw } = require("../controllers/drawController");

router.get("/run", auth, runDraw);

module.exports = router;