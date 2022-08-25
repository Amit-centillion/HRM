const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const { number } = require("yup/lib/locale");
const Schema = mongoose.Schema;

const leaveAttendenceReqSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        reason: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        approvedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        rejectedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        approveDate: {
            type: Date,
        },
        rejectDate: {
            type: Date,
        },
        totalMinute: {
            type: Number
        },
        requestType: {
            type: String
        },
        leaveType: {
            type: String,
        },
        totalDay: {
            type: Number,
        },
        type: {
            type: String,
        },
        requestedTo: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);
leaveAttendenceReqSchema.plugin(paginate);
module.exports.leaveAttendenceReqSchema = mongoose.model("leaveAttendenceReq", leaveAttendenceReqSchema);
