const express = require("express");
const userTimeEntry = require("../../controllers/client/v1/userTimeEntry");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.post("/logTime", auth, userTimeEntry.logTimeEntry);
router.post("/geTimeEntryStatus", auth, userTimeEntry.getUserClockStatus);
router.post("/getTimeEntries", auth, userTimeEntry.getTimeEntriesByUserId);
router.post("/remove", auth, userTimeEntry.removeTimeEntry);
router.get("/getTodayTimeEntries", auth, userTimeEntry.getTodayTimeEntries);

module.exports = router;
