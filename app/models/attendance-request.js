const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const AttendanceRequestSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        requested_date: String,
        time_in: String,
        time_out: String,
        reason: String,
        status: String,
        approvedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

AttendanceRequestSchema.plugin(paginate);
module.exports = mongoose.model("AttendanceRequest", AttendanceRequestSchema);
