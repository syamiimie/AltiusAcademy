const express = require("express");
const router = express.Router();
const controller = require("../controllers/class.controller");

router.get("/", controller.getAllClasses);
router.get("/:id", controller.getClassById);
router.post("/", controller.addClass);
router.put("/:id", controller.updateClass);
router.delete("/:id", controller.deleteClass);

module.exports = router;
