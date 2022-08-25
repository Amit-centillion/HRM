const express = require("express");
const { json, urlencoded } = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// require("./app/cronJob/clockout");
// require("./app/cronJob/holiday");
// require("./app/cronJob/attendanceMail");
if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}
if (!fs.existsSync("./upload")) {
  fs.mkdirSync("./upload");
}

if (!fs.existsSync("./upload/salarySlip")) {
  fs.mkdirSync("./upload/salarySlip");
}

require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH });
require("./app/config/db/connection");
const clientRoutes = require("./app/routes");
const adminRoutes = require("./app/routes/admin");
const app = express();
const router = express.Router();

app.use(json({ limit: '50mb' }));
app.use(urlencoded({ limit: '50mb', extended: true }));
app.use(morgan("dev"));
app.use(cors());
app.use(`/api/${process.env.VERSION}`, router);
app.use(express.static("public"))
app.use("/profile", express.static("upload/profilePicture"));
router.use("/admin", adminRoutes);
router.use("/", clientRoutes);

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(process.env.PORT, () => {
  console.log("=================================");
  console.log("DEVELOPMENT SERVER STARTED", process.env.PORT);
  console.log("=================================");
});
