const yup = require("yup");

const leave = yup.object().shape({
  reason: yup.string().required("Reason required"),
  // leaveType: yup.string().required("LeaveType required"),
});
module.exports = {
  leave,
};
