const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const CalenderSchema = new Schema(
  {
    holidays: {
      type: [
        "public holidays",
        "leave event",
        "birthday",
        "office anniversary",
      ],
      default: "none",
    },
    leave: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
CalenderSchema.plugin(paginate);

module.exports = mongoose.model("calender", CalenderSchema);
