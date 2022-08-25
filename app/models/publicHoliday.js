const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const holidaySchema = new Schema(
  {
    holidayList: [
      {
        holidayName: {
          type: String,
        },
        holidayDate: {
          type: Date,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    optionalHoliday: {
      type: Boolean,
      default: false,
    },
    year: {
      type: String,
    }
  }
  // { timestamps: true, toJSON: { virtuals: true } }
);

holidaySchema.plugin(paginate);

module.exports.holidaySchema = mongoose.model("holidayList", holidaySchema);
