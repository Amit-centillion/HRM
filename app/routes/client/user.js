const express = require("express");
const router = express.Router();
const User = require("../../controllers/client/v1/user");
const auth = require("../../middleware/authorization");

router.get("/", auth, User.index);
router.get("/:id", auth, User.show);
router.put("/update/:id", [auth], User.update);
router.delete("/delete/:id", [auth], User.delete);
router.put("/change-password/", [auth], User.updatePasseword);
router.get("/all/getteamdata", [auth], User.getTeamDataById);
router.put("/uploadProfile", [auth], User.uploadProfile); //uploadProfile

module.exports = router;
