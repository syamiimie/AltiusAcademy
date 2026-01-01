const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// 1️⃣ Get student summary (total paid + name)
router.get("/summary", paymentController.getStudentPaymentSummary);

// 2️⃣ Get all enrollments for a student
router.get("/enrollments", paymentController.getEnrollmentsByStudent);

// 3️⃣ Add payment for specific enrollment
router.post("/", paymentController.addPaymentForEnrollment);

module.exports = router;
