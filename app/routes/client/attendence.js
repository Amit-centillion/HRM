const express = require("express");
const attendance = require("../../controllers/client/v1/attendence");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.post("/clock", auth, attendance.clock);
router.get("/me", auth, attendance.getCurrentUserAttendance);
router.get("/my-attendance", auth, attendance.getUserAllAttendance);
router.post("/create", auth, attendance.create);
router.get("/:id", auth, attendance.index);
router.get("/show/:id", auth, attendance.show);
router.put("/update/:id", auth, attendance.update);
router.get("/", attendance.userAttendence);

module.exports = router;
