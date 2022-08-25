let moment = require("moment-timezone");
const commonFunction = require("../../../common/function");
const { salarySlipManagement } = require("../../../models/salarySlip");
let salaryLogs = commonFunction.fileLogs("salarySlip");
const { CONSTANTS } = require("../../../constants/index.js");
let fs = require("fs");
let path = require("path");
class salarySlipController {
    /**
     * Upload salarySlip & create document
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async uploadSalarySlip(req, res) {
        try {
            let file = req.files.files;
            if (file && file.size <= CONSTANTS.MAX_FILE_SIZE.pdfFile && file.type && file.type == "application/pdf") {
                let lastIndex = file.path.lastIndexOf("/");
                let filepath = file.path.substring(parseInt(lastIndex) + 1);
                let updatedFileName = file.originalFilename.split('.').join('-' + moment() + '.');
                let newPath = file.path.replace(filepath, updatedFileName);
                newPath = path.join(__dirname, '../../../../upload/salarySlip/') + newPath;
                fs.rename(file.path, newPath, async (error) => {
                    if (error) {
                        salaryLogs.error("Error while rename salary slip file :-" + JSON.stringify(error));
                        return res.status(500).json({ success: false, message: error.message });
                    } else {
                        let bufferData = fs.readFileSync(newPath);
                        let salaryData = new salarySlipManagement({
                            fileData: bufferData.toString('base64'),
                            fileName: updatedFileName,
                            userId: req.body.userId,
                            filePath: newPath,
                            fileSize: file.size,
                            contentType: file.type
                        });
                        await salaryData.save(); //create leave document
                        return res.status(200).json({ success: true, message: "Successfully file uploaded", data: salaryData });
                    }
                });
            } else {
                let errorMsg = "";
                if (file.type !== 'application/pdf') {
                    errorMsg = "File content-type must be have pdf"
                } else {
                    errorMsg = "file size too large"
                }
                if (file.path) {
                    fs.unlink(file.path, (err) => {
                        if (err) throw err;
                        salaryLogs.info("FileName :- " + file.path + "File Deleted Successfully,salarySlip File ID :-" + req.params.id,);
                    });
                }
                return res.status(500).json({ success: false, message: errorMsg });
            }
        } catch (error) {
            salaryLogs.error("Error while upload salary slip file :-" + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * List of uploaded salarySlips
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async listOfSalarySlip(req, res) {
        try {
            let fileList = await salarySlipManagement.find({
                isDeleted: false
            }, {
                isDeleted: 1,
                filePath: 1,
                fileName: 1,
                userId: 1,
                createdAt: 1,
                updatedAt: 1
            });
            return res.status(200).json({ success: true, message: "Successfully get all documents", data: fileList });
        } catch (error) {
            salaryLogs.error("Error while get list of documents :-" + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Delete uploaded salarySlip file by id
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async deleteUploadedSalarySlip(req, res) {
        try {
            //soft delete document
            let fileData = await salarySlipManagement.findOneAndUpdate({
                _id: req.params.id,
                isDeleted: false
            }, {
                isDeleted: true
            }, {
                "fields":
                {
                    isDeleted: 1,
                    filePath: 1,
                    fileName: 1,
                    userId: 1
                }
            });
            //remove file
            if (fileData.filePath) {
                fs.unlink(fileData.filePath, (err) => {
                    if (err) throw err;
                    salaryLogs.info("FileName :- " + fileData.filePath + "File Deleted Successfully,salarySlip File ID :-" + req.params.id,);
                });
            }
            return res.status(200).json({ success: true, message: "Successfully file deleted" });
        } catch (error) {
            salaryLogs.error("Error while delete salarySlip documents :-" + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new salarySlipController();