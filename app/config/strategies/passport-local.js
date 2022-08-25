// const { compareSync } = require("bcrypt");
// const passport = require("passport");
// const { Strategy } = require("passport-local");
// const { Auth } = require("../../models");

// passport.use(
//   "local-login",
//   new Strategy(async (email, password, done) => {
//     try {
//       const auth = await Auth.findOne({ _email: email });
//       if (auth) {
//         const isMatch = compareSync(password, auth.password);
//         if (!isMatch) return done({ message: "Invalid credentials" }, false);
//         const { name, mobileno, email, id } = auth;
//         return done(false, {
//           name,
//           mobileno,
//           email,
//           id,
//         });
//       } else {
//         return done({ message: "User not exists" }, false);
//       }
//     } catch (error) {
//       return done({ message: error.message }, false);
//     }
//   })
// );
