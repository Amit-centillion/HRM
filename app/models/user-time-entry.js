const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const userTimeEntrySchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        timeStamp: Date,
        type: String, // clock in - clock out
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

userTimeEntrySchema.plugin(paginate);

module.exports = mongoose.model("UserTimeEntry", userTimeEntrySchema);
