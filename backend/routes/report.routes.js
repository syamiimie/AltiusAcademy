const express = require("express");
const router = express.Router();
const financialController = require("../controllers/financialReport");

router.get("/financial-report", financialController.getFinancialReport);

module.exports = router;
