const express = require("express");
const permission = require("../../controllers/admin/v1/permission");
const router = express.Router();

router.post("/create", permission.createPermission);
router.get("/", permission.getPermission);
router.put("/update/:id", permission.updatePermission);
router.put("/delete/:id", permission.deletePermission);

module.exports = router;
