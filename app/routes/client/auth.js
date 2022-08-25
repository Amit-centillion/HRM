const express = require("express");
const AuthController = require("../../controllers/client/v1/auth");
const { validate, auth_schema } = require("../../middleware/validation");
const router = express.Router();
router.post("/login", [validate(auth_schema.login)], AuthController.login);
router.post(
  "/create",
  [validate(auth_schema.register)],
  AuthController.register
);
router.post("/admin/create", AuthController.adminUserCreate);

module.exports = router;
