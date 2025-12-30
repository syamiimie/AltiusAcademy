const express = require("express");
const router = express.Router();

const classController = require("../controllers/class.controller");

/* ================= CLASS ROUTES ================= */

// GET all classes
router.get("/", classController.getAllClasses);

// GET class list with prerequisites
router.get("/with-prereq", classController.getClassListWithPrereq);

// ADD class (handles prereqs internally)
router.post("/", classController.addClass);

// DELETE class
router.delete("/:id", classController.deleteClass);

module.exports = router;
