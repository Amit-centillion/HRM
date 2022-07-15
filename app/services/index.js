const { permissionService } = require("./admin/permissionService");
const { roleService } = require("./admin/roleServices");
const { userService } = require("./admin/userServices");
const { assetsService } = require("./assetsService");
module.exports = {
  permissionService,
  roleService,
  userService,
  assetsService
};
