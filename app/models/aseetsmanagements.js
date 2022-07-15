const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;
const assetsSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        screenDetails: Array,
        laptopOrPc: Array,
        headPhone: Object,
        mouse: Object,
        kaybord: Object

    },
    { timestamps: true },
);
assetsSchema.plugin(paginate);
module.exports = mongoose.model('aseetsmanagements', assetsSchema);
