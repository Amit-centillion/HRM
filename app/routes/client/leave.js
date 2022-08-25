const express = require("express");
const LeaveController = require("../../controllers/client/v1/leave");
const router = express.Router();
const auth = require("../../middleware/authorization");


router.get("/", [auth], LeaveController.index);
router.post("/applyleave/:id", [auth], LeaveController.applyLeave);
router.put("/update/:id", LeaveController.update); //update leave data
router.put("/cancelleave/:id", LeaveController.cancelLeave); //cancel leave
router.put("/approveleave/:id", LeaveController.approveLeave); //approve leave
router.put("/rejectleave/:id", LeaveController.rejectLeave); //reject leave
router.get("/getleavedata/:id", LeaveController.getLeaveData); //get leave data
router.get("/test/publicholidaylist", LeaveController.publicHolidayList); //get all public holiday list
router.put("/test/updatepublicholidaylist/:id", [auth], LeaveController.updatePublicHolidayList); //update public holiday list
router.get("/leaves/getupcomingleaves", [auth], LeaveController.getUpcomingLeaves);
router.get("/leaves/getadminupcomingleaves", [auth], LeaveController.getAdminUpcomingLeaves);
router.get("/all/overviewDetails", [auth], LeaveController.overviewDetails); //get leave data
module.exports = router;
