const commonFunction = require("../../../common/function");
const { salarySlipManagement } = require("../../../models/salarySlip");
let salaryLogs = commonFunction.fileLogs("salarySlip");
let fs = require("fs");
class salarySlipController {

    /**
     * List all salarySlip of currentUser
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async listOfSalarySlip(req, res) {
        try {
            let list = await salarySlipManagement.find({
                userId: req.currentUser._id,
                isDeleted: false
            }, {
                isDeleted: 1,
                filePath: 1,
                fileName: 1,
                userId: 1,
                createdAt: 1,
                updatedAt: 1
            });
            return res.status(200).json({ success: true, message: "Successfully get all documents", data: list });
        } catch (error) {
            salaryLogs.error("Error while get list of documents :-" + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    /**
     * Download salarySlip file
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async downloadSalarySlip(req, res) {
        try {
            let list = await salarySlipManagement.find({
                _id: req.params.id,
                isDeleted: false
            });
            return res.status(200).json({ success: true, message: "Successfully get all documents", data: list });
        } catch (error) {
            salaryLogs.error("Error while download file :-" + JSON.stringify(error));
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // async getFileData(req, res) {
    //     try {
    //         let fileData = await salarySlipManagement.find({
    //             _id: req.params.id,
    //             isDeleted: false
    //         });
    //         return res.status(200).json({ success: true, message: "Successfully get salarySlip documents", data: fileData });
    //     } catch (error) {
    //         salaryLogs.error("Error while get salarySlip  documents :-" + JSON.stringify(error));
    //         return res.status(500).json({ success: false, message: error.message });
    //     }
    // }

}

module.exports = new salarySlipController();