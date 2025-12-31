const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendance.controller");

router.get("/", controller.getAllAttendance);
router.get("/:id", controller.getAttendanceById);
router.post("/", controller.addAttendance);
router.put("/:id", controller.updateAttendance);
router.delete("/:id", controller.deleteAttendance);

module.exports = router;
