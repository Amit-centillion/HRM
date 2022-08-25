// const passport = require("passport");
// const { Strategy, ExtractJwt } = require("passport-jwt");
// const { Auth } = require("../../models");

// let options = {};
// options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// options.secretOrKey = process.env.JWT_SECRET;

// passport.use(
//   new Strategy(options, async (payload, done) => {
//     try {
//       let auth = await Auth.findOne(
//         { id: payload.id },
//         {
//           id: 1,
//           name: 1,
//           mobileno: 1,
//           email: 1,
//         }
//       );

//       if (auth) {
//         return done(null, auth);
//       } else {
//         return done(null, false);
//       }
//     } catch (error) {
//       return done(error.message, false);
//     }
//   })
// );
