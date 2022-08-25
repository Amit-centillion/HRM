const express = require("express");
const leaveAttendenceReqController = require("../../controllers/client/v1/leaveAttendenceReq");
const router = express.Router();
const { validate } = require("../../middleware/validation");
const auth = require("../../middleware/authorization");

router.get("/", auth, leaveAttendenceReqController.index);
router.post("/create", auth, leaveAttendenceReqController.create);
router.put("/update/:id", auth, leaveAttendenceReqController.update);
router.put("/approve/:id", auth, leaveAttendenceReqController.approve);
router.get("/test/getAllPendingRequest", auth, leaveAttendenceReqController.getAllPendingRequest);
router.put("/delete/:id", leaveAttendenceReqController.delete);
router.put("/rejectRequest/:id", auth, leaveAttendenceReqController.rejectRequest);
router.get("/getleaveattandanceData/:id", auth, leaveAttendenceReqController.getDataById);

module.exports = router;