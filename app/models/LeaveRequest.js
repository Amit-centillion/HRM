const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const LeavesRequest = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        reason: {
            type: String,
            // required: true
        },
        dates: {
            type: Date,
            // required: true,
        },
        requestedTo: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        // endDate: {
        // type: Date,
        // required: true
        // },
        leaveType: {
            type: String,
        },
        leaveGrantType: {
            type: String,
        },
        status: {
            type: String
        }


    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);
LeavesRequest.plugin(paginate);
module.exports = mongoose.model("leavesRequest", LeavesRequest);
