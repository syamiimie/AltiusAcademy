const express = require("express");
const router = express.Router();
const controller = require("../controllers/class.controller");

// ⚠️ ROUTE KHAS MESTI ATAS
router.get("/with-prereq", controller.getClassListWithPrereq);

// NORMAL CRUD
router.get("/", controller.getAllClasses);
router.get("/:id", controller.getClassById);
router.post("/", controller.addClass);
router.put("/:id", controller.updateClass);
router.delete("/:id", controller.deleteClass);

// PREREQUISITE
router.get("/:id/prerequisites", controller.getPrerequisites);
router.post("/:id/prerequisites", controller.addPrerequisite);
router.delete("/prerequisites/:pid", controller.deletePrerequisite);

module.exports = router;
