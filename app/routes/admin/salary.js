const express = require("express");
const salary = require("../../controllers/admin/v1/salary");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.get("/", auth, salary.index);
router.post("/create", auth, salary.create);
router.get("/:id", auth, salary.show);
router.put("/delete/:id", auth, salary.delete);

module.exports = router;
