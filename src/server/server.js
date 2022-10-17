const express = require("express");
const cors = require("cors");
const app = express();
const port = 4000;
const path = require("path");
const testRouter = require("./routers/test.js");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/api", testRouter);

app.use(cors({ origin: ["http://localhost:4000"], methods: "GET,POST,HEAD", preflightContinue: false, credentials: true }));

app.get("/", (_, res) => {
  res.send({ hello: "hello world" });
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
