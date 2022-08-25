const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const AttendanceRequestSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        requested_date: string,
        time_in: string,
        time_out: string,
        reason: string,
        status: string,
        approvedBy: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

AttendanceSchema.plugin(paginate);
module.exports = mongoose.model("AttendanceRequest", AttendanceRequestSchema);
