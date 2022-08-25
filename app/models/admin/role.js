const mongoose = require("mongoose");
const { Types } = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    permission: {
      type: [Types.ObjectId],
      trim: true,
      ref: "permission",
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
RoleSchema.plugin(paginate);
module.exports.RoleSchema = mongoose.model("role_type", RoleSchema);
