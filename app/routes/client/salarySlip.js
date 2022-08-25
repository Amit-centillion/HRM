const express = require("express");
const salarySlip = require("../../controllers/client/v1/salarySlip");
const router = express.Router();
const auth = require("../../middleware/authorization");
const multipart = require('connect-multiparty');
const { CONSTANTS } = require("../../constants/index.js");

router.get('/index', auth, salarySlip.listOfSalarySlip); //list all salarySlip Files

router.put('/download/:id', auth, salarySlip.downloadSalarySlip); //get fileData

// router.put('/getFileData', auth, salarySlip.getFileData); //download fileData

module.exports = router;
