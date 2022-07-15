const express = require("express");
const project = require("../../controllers/client/v1/project");
const router = express.Router();
const auth = require("../../middleware/authorization");

router.get("/", auth, project.index);
router.post("/create", auth, project.create);
router.get("/:id", auth, project.show);
router.put("/update/:id", auth, project.update);
router.put("/delete/:id", auth, project.delete);

module.exports = router;
