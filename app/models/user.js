const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstname: {
      type: String,

    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    birthdate: {
      type: Date,
    },
    mobileno: {
      type: Number,
    },
    address: {
      street1: {
        type: String,
      },
      street2: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      area: {
        type: String,
      },
      pincode: {
        type: Number,
      },
    },
    personalDetails: {
      aadharCard: {
        type: Number,
      },
      panCard: {
        type: String,
      },
    },
    bankDetails: {
      accountHolderName: {
        type: Number,
      },
      bankName: {
        type: String,
      },
      accountno: {
        type: Number,
      },
      ifscCode: {
        type: String,
      },
      branchName: {
        type: String,
      },
    },
    profile: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Types.ObjectId,
      ref: "role_type",
    },
    employeeType: {
      type: String,
      enum: ["PARTTIME", "FULLTIME"],
      default: "FULLTIME",
    },
    salary: {
      type: Number,
      default: 0,
    },
    totalPaidLeave: {
      type: Number,
    },
    totalUnpaidLeave: {
      type: Number,
      default: 0,
    },
    totalAvailablePaidLeave: {
      type: Number,
    },
    totalAvailableOptionalLeave: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
    },
    designation: {
      type: String,
    },
    teamLeader: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    paymentMode: {
      type: String
    },
    grossSalary: {
      type: Number
    },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

UserSchema.plugin(paginate);

module.exports.UserSchema = mongoose.model("User", UserSchema);
