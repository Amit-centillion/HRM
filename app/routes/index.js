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
const leaveRequest = require("./client/leaveRequest");

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
router.use("/leaveRequest", leaveRequest)
module.exports = router;
