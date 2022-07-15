const express = require("express");
const router = express.Router();

const salaryRoutes = require("./admin/salary");
const salarySlip = require("./admin/salarySlip");
const userRoutes = require("./admin/user");
const holidayRoutes = require("./admin/holiday");

router.use("/salary", salaryRoutes);
router.use("/salarySlip", salarySlip);
router.use("/user", userRoutes);
router.use("/holiday", holidayRoutes);

module.exports = router;
