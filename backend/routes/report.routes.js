const express = require("express");
const router = express.Router();
const controller = require("../controllers/report.controller");
const financialController = require("../controllers/financialReport");

router.get("/attendance", controller.attendanceReport);
router.get("/financial-report", financialController.getFinancialReport);

module.exports = router;
