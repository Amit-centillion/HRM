const { Types } = require("mongoose");
const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const PermissionSchema = new Schema(
  {
    path: {
      type: String,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
PermissionSchema.plugin(paginate);
module.exports.PermissionSchema = mongoose.model(
  "permission",
  PermissionSchema
);
