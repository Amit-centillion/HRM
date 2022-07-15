const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;
const assetsRequestSchema = new Schema(
    {
        item: {
            type: String
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        reason: {
            type: String
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
        status: {
            type: String,
            enum: ["SENT", "PANGING", "APPROVED"],
            default: 'SENT',
        },

    },
    { timestamps: true },
);
assetsRequestSchema.plugin(paginate);
module.exports = mongoose.model('aseetsRequest', assetsRequestSchema);
