const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollment.controller");

/* ===== LIST ===== */
/*
  GET /enrollments
  GET /enrollments?studentId=1
*/
router.get("/", (req, res) => {
  if (req.query.studentId) {
    return controller.getEnrollmentsByStudent(req, res);
  }
  return controller.getAllEnrollments(req, res);
});

/* ===== BY STUDENT (PATH PARAM) ===== */
/*
  GET /enrollments/student/1
*/
router.get("/student/:id", controller.getEnrollmentsByStudentId);

/* ===== SINGLE ===== */
/*
  GET /enrollments/10
*/
router.get("/:id", controller.getEnrollmentById);

/* ===== CRUD ===== */
router.post("/", controller.addEnrollment);          // POST /enrollments
router.put("/:id", controller.updateEnrollment);     // PUT /enrollments/:id
router.delete("/:id", controller.deleteEnrollment);  // DELETE /enrollments/:id

module.exports = router;
