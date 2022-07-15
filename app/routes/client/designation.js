const express = require("express");
const designation = require("../../controllers/client/v1/designation");
const router = express.Router();
const auth = require("../../middleware/authorization");



router.get("/:id", auth, designation.index);
router.get("/getalldesignation", auth, designation.getAllDesignation); //get all designation list
router.post("/adddesignation", auth, designation.addDesignation); //add designation
router.put("/updatedesignation/:id", auth, designation.updateDesignation); //update designation
router.put("/delete/:id", auth, designation.delete); //delete designation 
router.get("/get/:id", designation.getDesignation);
module.exports = router;
