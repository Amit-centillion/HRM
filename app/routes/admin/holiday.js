const express = require("express");
const { AddHoliday, GetHoliday, UpdateHoliday, DeleteHoliday } = require("../../controllers/admin/v1/holidayController");
const authorization = require("../../middleware/authorization")
const router = express.Router();

router.post("/add", authorization, AddHoliday);
router.get("/get", GetHoliday);
router.put("/update/:_id", authorization, UpdateHoliday);
router.delete("/delete/:_id", authorization, DeleteHoliday);

module.exports = router;
