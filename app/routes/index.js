const express = require("express");
const router = express.Router();
const authRoutes = require("./client/auth");
const attendanceRoutes = require("./client/attendence");
const userRoutes = require("./client/user");
const projectRoutes = require("./client/project");
const employeeRoutes = require("./client/employee");
const role = require("./admin/role");
const permission = require("./admin/permission");
const leaves = require("./client/leave");
const designation = require("./client/designation");
const leaveAttendenceReq = require("./client/leaveAttendenceReq");
const salarySlip = require("./client/salarySlip");
const taskRoute = require("./client/task.route");
const userTimeEntryRoute = require("./client/userTimeEntry.route");
const userTimeRequestRoute = require("./client/attendanceRequest.route");
//const leaveRequest = require("./client/leaveRequest");
const holidayRoutes = require("./client/holidayRoutes");
const assetsRoutes = require("./client/assetsroute");
const assetsRequestRoutes = require("./client/assetsRequestroute");

router.use("/assetsRequest", assetsRequestRoutes);
router.use("/assets", assetsRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/project", projectRoutes);
router.use("/employee", employeeRoutes);
router.use("/role", role);
router.use("/permission", permission);
router.use("/leave", leaves);
router.use("/designation", designation);
router.use("/leaveAttendenceReq", leaveAttendenceReq);
router.use("/salarySlip", salarySlip);
router.use("/task", taskRoute);
router.use("/userTimeEntry", userTimeEntryRoute)
router.use("/attendanceRequest", userTimeRequestRoute)
//router.use("/leaveRequest", leaveRequest)
router.use("/userLeaveManagement", holidayRoutes)
module.exports = router;
