const express = require("express");
const util = require("../../util.js");
const router = express.Router();
require("dotenv").config();

router.get("/", (req, res) => {
  const { who } = req.query;
  res.send({ test: "hi" });
  console.log(who);
  console.log(req.query);
});

// 유저 정보 조회
router.get("/summonerV4", (req, res) => {
  const { userName } = req.query;
  const url = process.env.SUMMONERV4;
  const fullUrl = util.apiUrl(url, userName);

  util.axiosToRiot(fullUrl, (success, data) => {
    res.json(data);
  });
});

// 현재 진행중인 게임 조회
router.get("/spectatorV4", (req, res) => {
  const { encryptedSummonerId } = req.query;
  const url = process.env.SPECTATORV4;
  const fullurl = util.apiUrl(url, encryptedSummonerId);

  util.axiosToRiot(fullurl, (success, data) => {
    res.json(data);
  });
});

module.exports = router;
