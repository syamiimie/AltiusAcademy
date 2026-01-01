const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollment.controller");

/* ===== LIST ===== */
router.get("/", (req, res) => {
    if (req.query.studentId) {
      return controller.getEnrollmentsByStudent(req, res);
    }
    return controller.getAllEnrollments(req, res);
  });
  

/* ===== SINGLE ===== */
router.get("/:id", controller.getEnrollmentById);  // GET /enrollments/:id

/* ===== CRUD ===== */
router.post("/", controller.addEnrollment);        // POST /enrollments
router.put("/:id", controller.updateEnrollment);  // PUT /enrollments/:id
router.delete("/:id", controller.deleteEnrollment); // DELETE /enrollments/:id

module.exports = router;
