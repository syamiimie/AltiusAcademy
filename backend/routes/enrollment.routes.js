const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollment.controller");

/* ===== LIST ===== */
router.get("/", controller.getAllEnrollments);  // GET /enrollments (when mounted at /enrollments)

/* ===== SINGLE ===== */
router.get("/:id", controller.getEnrollmentById);  // GET /enrollments/:id

/* ===== CRUD ===== */
router.post("/", controller.addEnrollment);        // POST /enrollments
router.put("/:id", controller.updateEnrollment);  // PUT /enrollments/:id
router.delete("/:id", controller.deleteEnrollment); // DELETE /enrollments/:id

module.exports = router;
