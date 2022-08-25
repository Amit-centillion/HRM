const auth_schema = require("./auth");
const user_schema = require("./user");
const leaveSchema = require("./leave");
const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body);
      return next();
    } catch (error) {
      return res.status(422).json({ success: false, message: error.message });
    }
  };
};

module.exports = {
  validate,
  auth_schema,
  user_schema,
  leaveSchema,
};
