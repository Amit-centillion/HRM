const mongoose = require("mongoose");
const { paginate } = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const holidayManagement = new Schema(
    {
        name: {
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
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
    }
);

module.exports = mongoose.model("holidayManagement", holidayManagement);
