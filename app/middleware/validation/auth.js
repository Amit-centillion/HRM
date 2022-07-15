const yup = require("yup");
const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const login = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter valid email address"),
  password: yup.string().required("Password is required"),
});
const register = yup.object().shape({
  firstname: yup.string().required("Firstname is Required"),
  lastname: yup.string().required("Lastname is Required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password minimum 6 character is required"),
  // mobileno: yup
  //   .string()
  //   .matches(phoneRegExp, "Mobile Number is invalid")
  //   // .test("Only 10 number", (value) => value.length === 10)
  //   .required("number is required")
  //   .required("Mobile Number is required"),
});

module.exports = {
  login,
  register,
};
