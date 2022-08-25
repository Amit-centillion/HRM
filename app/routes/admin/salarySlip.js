const express = require("express");
const salarySlip = require("../../controllers/admin/v1/salarySlip");
const router = express.Router();
const auth = require("../../middleware/authorization");
const multipart = require('connect-multiparty');
let path = require("path");

router.post('/uploadSalarySlip', multipart({
    uploadDir: path.join(__dirname, '../../../upload/salarySlip/'),
    // maxFilesSize: CONSTANTS.MAX_FILE_SIZE.pdfFile
}), salarySlip.uploadSalarySlip); //upload salary slip

router.put('/delete/:id', auth, salarySlip.deleteUploadedSalarySlip); //delete salarySlip

router.get('/index', auth, salarySlip.listOfSalarySlip); //get all salary of users

module.exports = router;
