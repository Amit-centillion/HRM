const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const projectSchema = new Schema(
  {
    projectName: {
      type: String,
    },
    employeeId: {
      type: [Schema.Types.ObjectId],
      ref: "User",
    },
    projectStartDate: {
      type: Date,
    },
    projectEndDate: {
      type: Date,
    },
    technology: {
      type: Array,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);
projectSchema.plugin(paginate);
module.exports.projectSchema = mongoose.model("projects", projectSchema);
