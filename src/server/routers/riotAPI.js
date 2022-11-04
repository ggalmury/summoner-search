const express = require("express");
const util = require("../util/util.js");
const getApi = require("../util/getAPI.js");
const db = require("../../mysql.js");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ test: "hi" });
});

// 유저 정보 조회
router.get("/summonerV4", async (req, res) => {
  const { summonerName } = req.query;

  // 1. DB에 소환사 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답
  try {
    // mysql2 => 배열 반환
    const summonerInfo = await db.query(`SELECT * FROM summoner_info WHERE name=?`, [summonerName]);
    const summonerInfoCamel = util.chgCamelExpForList(summonerInfo);

    // db에 정보가 없을 때
    if (summonerInfo.length <= 0) {
      getApi.getSummonerInfoFromRiot(res, summonerName);
      return;
    }
    // db에 정보가 있을 때
    util.success(res, summonerInfoCamel);
  } catch (err) {
    console.log(err);
  }
});

router.get("/leagueV4", async (req, res) => {
  const { summonerName } = req.query;
  const getId = await db.query(`SELECT id FROM summoner_info where name=?`, [summonerName]);
  const encryptedSummonerId = getId[0].id;

  // 1. DB에 소환사 랭크 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답
  try {
    const rankInfo = await db.query(`SELECT * FROM summoner_rank WHERE summoner_name=?`, [summonerName]);
    const rankInfoCamel = util.chgCamelExpForList(rankInfo);

    // db에 정보가 없을때의 로직
    if (rankInfo.length <= 0) {
      getApi.getSummonerRankFromRiot(res, encryptedSummonerId);
      return;
    }
    // db에 정보가 있을 때
    util.success(res, rankInfoCamel);
  } catch (err) {
    console.log(err);
  }
});

// 현재 진행중인 게임 조회
router.get("/spectatorV4", (req, res) => {
  const { encryptedSummonerId } = req.query;
  const url = process.env.SPECTATORV4;
  const fullUrl = `${url}${encryptedSummonerId}`;

  util.riotRes(fullUrl, (success, data) => {
    util.success(res, data);
  });
});

// 게임 전적 조회
router.get("/matchV5", (req, res) => {
  const { puuid, start, count } = req.query;
  let riotRes = []; // matchId로 게임의 detail info 조회, 최종적으로 클라에 응답
  const url1 = process.env.MATCHV5;
  const url2 = process.env.MATCHV5DETAIL;
  // 최근 전적으로부터 start번 전적에서 count개의 전적을 조회
  const fullUrl1 = `${url1}${puuid}/ids?start=${start}&count=${count}`;

  util.riotRes(fullUrl1, (success, data) => {
    data.map((matchId) => {
      const fullUrl2 = `${url2}${matchId}`;

      util.riotRes(fullUrl2, (success, data) => {
        setTimeout(() => {
          riotRes.push(data.info);
          if (riotRes.length === 10) {
            util.success(res, riotRes);
          }
        }, 100);
      });
    });
  });
});

module.exports = router;
