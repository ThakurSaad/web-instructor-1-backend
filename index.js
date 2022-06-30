const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Yn3ZNHGmlQZPz9Wd
// webUser

app.get("/", (req, res) => {
  res.send("Bill Manager is working");
});

app.listen(port, (req, res) => {
  console.log("Bills are listening", port);
});
