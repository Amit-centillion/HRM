const express = require("express");
const timeSheetController = require("../../controllers/client/v1/task.controller");
const router = express.Router();
const auth = require("../../middleware/authorization");




router.post("/add", auth, timeSheetController.addTask);
router.get("/get", auth, timeSheetController.getTask);
router.delete("/delete/:id", auth, timeSheetController.deleteTask);

module.exports = router;
