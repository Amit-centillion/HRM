const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: String,
    },
    entry: [
      {
        In: {
          type: Date,
        },
        Out: {
          type: Date,
        },
      },
    ],
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
      default: null
    },
    totalHours: {
      type: Number,
      default: 9,
    },
    workingHours: {
      type: Number,
      default: 0,
    },
    workDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.plugin(paginate);

module.exports = mongoose.model("attendance", AttendanceSchema);
