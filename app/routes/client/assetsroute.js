const express = require("express");
const assetsRequest = require("../../controllers/client/v1/assets");
const router = express.Router();

router.post("/create", assetsRequest.assetsCreate);
router.put("/update/:id", assetsRequest.assetsUpdate);
router.delete("/delete/:id", assetsRequest.deleteByID);


module.exports = router;
