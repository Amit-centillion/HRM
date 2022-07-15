const mongoose = require("mongoose");
let CONNECTION_URL = `${process.env.MONGO_URL}/${process.env.MONGO_DB}`;
module.exports = mongoose
  .connect(CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DATABASE CONNECTED");
    console.log("=================================");
  })
  .catch((error) => {
    console.log(error);
    console.log("DATABASE NOT CONNCTED");
    console.log("=================================");
  });
