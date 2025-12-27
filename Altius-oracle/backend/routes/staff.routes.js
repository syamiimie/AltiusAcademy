const express = require("express");
const router = express.Router();
const controller = require("../controllers/staff.controller");

router.post("/login", controller.login);
router.get("/:id", controller.getStaffById);
router.post("/", controller.addStaff);
router.put("/:id", controller.updateStaff);

module.exports = router;
