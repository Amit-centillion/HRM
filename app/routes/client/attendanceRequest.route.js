const express = require("express");
const attendanceRequest = require("../../controllers/client/v1/attendanceRequest");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.post("/create", auth, attendanceRequest.create);
router.post("/changeStatus", auth, attendanceRequest.updateRequestStatus);
router.post("/approve", auth, attendanceRequest.approve);

module.exports = router;
