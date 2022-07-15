const express = require("express");
const role = require("../../controllers/admin/v1/role");
const authorization = require("../../middleware/authorization")
const router = express.Router();

router.post("/create",authorization, role.createRole);
router.get("/", role.getRole);
router.get("/:id",authorization, role.getRoleById);
router.put("/update/:id",authorization, role.updateRole);
router.put("/delete/:id",authorization, role.deleteRole);

module.exports = router;
