const mongoose = require("mongoose");
const projectModel = require("../models/project");
const userModel = require("../models/user");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const TimeSheetSchema = new Schema(
    {
        projects: [
            {
                ProjectId: {
                    type: Schema.Types.ObjectId,
                    ref: "projects",
                    required: true,
                },
                workingHrs: {
                    type: String,
                    required: true,
                },
                workDate: {
                    type: Date,
                },
            }
        ],
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

    },

    { timestamps: true, toJSON: { virtuals: true } }
);
TimeSheetSchema.plugin(paginate);
module.exports.TimeSheetSchema = mongoose.model("timeSheet", TimeSheetSchema);
