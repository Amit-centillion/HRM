const express = require("express");
const leaveRequest = require("../../controllers/client/v1/LeaveRequest");
const router = express.Router();
const { validate } = require("../../middleware/validation");
const auth = require("../../middleware/authorization");


router.post("/leaveCreate", auth, leaveRequest.createRequest);


module.exports = router;