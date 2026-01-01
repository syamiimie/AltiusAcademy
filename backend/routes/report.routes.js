const express = require("express");
const router = express.Router();
const controller = require("../controllers/financialReport");

/*
  GET /report?month=2025-01
*/
router.get("/", controller.financialReport);

module.exports = router;
