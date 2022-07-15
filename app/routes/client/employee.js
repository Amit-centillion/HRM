const express = require("express");
const employee = require("../../controllers/client/v1/employee");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.get("/", auth, employee.index);
router.post("/create", auth, employee.create);
router.get("/:id", auth, employee.show);
router.put("/update/:id", auth, employee.update);
router.put("/delete/:id", auth, employee.delete);

module.exports = router;
