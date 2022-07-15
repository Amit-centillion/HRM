const express = require("express");
const { applyLeave, getLeave, ApproveLeave, rejectedLeave, deleteLeave, updateLeave } = require("../../controllers/client/v1/userLeaveManagement");
const authorization = require("../../middleware/authorization")
const router = express.Router();

router.post("/add", authorization, applyLeave);
router.put("/update", authorization, updateLeave);
router.get("/get", authorization, getLeave);
router.put("/approve/:leaveId", authorization, ApproveLeave);
router.put("/reject/:leaveId", authorization, rejectedLeave);
router.delete("/delete/:_id", authorization, deleteLeave);

module.exports = router;
