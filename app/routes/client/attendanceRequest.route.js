const express = require("express");
const attendanceRequest = require("../../controllers/client/v1/attendanceRequest");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.post("/create", auth, attendanceRequest.create);
router.put("/changeStatus", auth, attendanceRequest.updateRequestStatus);
router.put("/approve", auth, attendanceRequest.approve);
router.get("/getAttendanceRequest", auth, attendanceRequest.getAttendanceRequest);
router.get("/getAttendancePendingRequest", auth, attendanceRequest.getAttendancePendingRequest);

module.exports = router;
