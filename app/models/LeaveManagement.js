const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userLeaveManagement = new Schema(
    {
        reason: {
            type: String,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        year: {
            type: Number,
        },
        addedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
        approvedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null
        },
        rejectedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            default: null
        },
        rejectReason: {
            type: String,
            default: null
        },
        type: {
            type: String,
            enum: ["PAIDLEAVE", "UNPAIDLEAVE", "HOLIDAY"],
            default: "PENDING",
        },
        leaveType: {
            type: String,
            enum: ["FIRSTHALFDAY", "SECONDHALFDAY", "FULLDAY"],
            default: "FULLDAY",
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("userLeaveManagement", userLeaveManagement);
