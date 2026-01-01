const express = require("express");
const router = express.Router();
const c = require("../controllers/attendance.controller");

router.get("/", c.getAllAttendance);
router.get("/:id", c.getAttendanceById);
router.post("/", c.addAttendance);
router.put("/:id", c.updateAttendance);
router.delete("/:id", c.deleteAttendance);

module.exports = router;
