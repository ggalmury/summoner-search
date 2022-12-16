require("dotenv").config();

const express = require("express");
const cors = require("cors");

const sumInfo = require("./routers/sumInfo.js");

const app = express();
const port = 4000;
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/api", sumInfo);

app.use(cors({ origin: ["http://localhost:4000"], methods: "GET,POST,HEAD", preflightContinue: false, credentials: true }));

app.get("/", (_, res) => {
  res.send({ hello: "hello world" });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
