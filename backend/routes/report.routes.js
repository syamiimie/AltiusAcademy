const express = require("express");
const router = express.Router();
const controller = require("../controllers/financialReport");

<<<<<<< HEAD
router.get("/financial-report", financialController.financialReport);
=======
/*
  GET /report?month=2025-01
*/
router.get("/", controller.financialReport);
>>>>>>> 560af3b7698e643aeafd73fdf043426f80db06f5

module.exports = router;
