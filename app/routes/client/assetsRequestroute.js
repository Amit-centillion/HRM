const express = require("express");
const assetsNewRequest = require("../../controllers/client/v1/assetsRequest");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.post("/create", auth, assetsNewRequest.assetsRequestprocess);
router.get('/getAsstes', assetsNewRequest.getRequest);
router.delete("/delete/:id", assetsNewRequest.deleteByID);
router.put("/update/:id", assetsNewRequest.updateByid);
router.put("/statusRequest/:id", assetsNewRequest.statusRequest);

module.exports = router;
