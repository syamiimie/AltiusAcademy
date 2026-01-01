const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

/* Get payment history by student */
router.get("/", paymentController.getPaymentsByStudent);

/* Get single payment (receipt) */
router.get("/:id", paymentController.getPaymentById);

/* Add new payment */
router.post("/", paymentController.addPayment);

/* Delete payment */
router.delete("/:id", paymentController.deletePayment);

module.exports = router;
