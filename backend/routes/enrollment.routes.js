const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollment.controller");

/* ===== GET ===== */
router.get("/", controller.getAllEnrollments);  // GET /enrollments (when mounted at /enrollments)
router.get("/:id", controller.getEnrollmentById);  // GET /enrollments/:id
router.get("/enrollments/student/:id", controller.getEnrollmentsByStudentId);

/* ===== CRUD ===== */
router.post("/", controller.addEnrollment);        // POST /enrollments
router.put("/:id", controller.updateEnrollment);  // PUT /enrollments/:id
router.delete("/:id", controller.deleteEnrollment); // DELETE /enrollments/:id

module.exports = router;
