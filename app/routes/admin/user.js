const express = require("express");
const router = express.Router();
const User = require("../../controllers/admin/v1/user");
const auth = require("../../middleware/authorization");

router.post("/assignTeamLeader", User.assignTeamLeader); //assign team leader

module.exports = router;
