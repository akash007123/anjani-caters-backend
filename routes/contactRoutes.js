const express = require("express");
const { submitContact, healthCheck } = require("../controllers/contactController");

const router = express.Router();

router.get("/health", healthCheck);
router.post("/submit", submitContact);

module.exports = router;
