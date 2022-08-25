const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const SalarySchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  attendanceId: {
    type: mongoose.Types.ObjectId,
    ref: "attendance",
  },
  workingDays: {
    type: Number,
    default: 0,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

SalarySchema.plugin(paginate);
module.exports = mongoose.model("salary", SalarySchema);
