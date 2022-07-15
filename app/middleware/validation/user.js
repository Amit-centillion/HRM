const yup = require("yup");

const user = yup.object().shape({
  firstname: yup.string().required("Firstname is required"),
  lastname: yup.string().required("Lastname is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter valid email address"),
  birthdate: yup.date().required("Birthdate is required"),
  mobileno: yup
    .number()
    .min(10, "Minimum 10 is required")
    .required("Mobile Number is required "),
  aadharCard: yup
    .number()
    .min(12, "Minimum 12 number required")
    .required("Aadharcard Number Required"),
  panCard: yup.string().required("Pancard is required"),
  bankName: yup.string().required("Bank Name is required"),
  accountno: yup.number().required("Account Number is required"),
  ifscCode: yup.string().required("IFSC code is required"),
  branchName: yup.string().required("BranchName is required"),
});
module.exports = {
  user,
};
