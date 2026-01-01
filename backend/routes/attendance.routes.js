const express = require("express");
const router = express.Router();
const c = require("../controllers/attendance.controller");

// 🔥 OPTION 2 – SPECIFIC ROUTE FIRST
router.get("/class/:class_id/students", c.getStudentsByClass);

// BASIC CRUD
router.get("/", c.getAllAttendance);
router.get("/:id", c.getAttendanceById);
router.post("/", c.addAttendance);
router.put("/:id", c.updateAttendance);
router.delete("/:id", c.deleteAttendance);

module.exports = router;
