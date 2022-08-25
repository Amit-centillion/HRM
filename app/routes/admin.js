const express = require("express");
const router = express.Router();

const salaryRoutes = require("./admin/salary");
const salarySlip = require("./admin/salarySlip");
const userRoutes = require("./admin/user");

router.use("/salary", salaryRoutes);
router.use("/salarySlip", salarySlip);
router.use("/user", userRoutes);

module.exports = router;
