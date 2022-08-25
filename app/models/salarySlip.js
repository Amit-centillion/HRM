const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const salarySlipManagement = new Schema(
    {
        isDeleted: {
            type: Boolean,
            default: false,
        },
        fileName: {
            type: String
        },
        filePath: {
            type: String
        },
        fileData: {
            type: String
        },
        contentType: {
            type: String
        },
        fileSize: {
            type: Number
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);
salarySlipManagement.plugin(paginate);
module.exports.salarySlipManagement = mongoose.model("salarySlip", salarySlipManagement);
