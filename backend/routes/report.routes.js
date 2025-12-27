const express = require("express");
const router = express.Router();
const controller = require("../controllers/report.controller");

router.get("/attendance", controller.attendanceReport);

module.exports = router;
