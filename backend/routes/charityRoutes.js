const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getCharities, selectCharity } = require("../controllers/charityController");

router.get("/", getCharities);
router.post("/select", auth, selectCharity);

module.exports = router;