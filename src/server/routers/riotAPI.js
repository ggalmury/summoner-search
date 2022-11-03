const express = require("express");
const util = require("../util.js");
const db = require("../../mysql.js");
const router = express.Router();

router.get("/", (req, res) => {
  res.send({ test: "hi" });
});

// 유저 정보 조회
router.get("/summonerV4", async (req, res) => {
  const { summonerName } = req.query;
  const url = process.env.SUMMONERV4;
  const fullUrl = `${url}${summonerName}`;
  let summonerInfo;

  // 1. DB에 소환사 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답
  try {
    // mysql2 => 배열 반환
    summonerInfo = await db.query(`SELECT * FROM summoner_info WHERE name=?`, [summonerName.toUpperCase()]);
    const summonerInfoCamel = util.chgCamelExpForList(summonerInfo);

    // db에 정보가 없을때의 로직
    if (summonerInfo.length <= 0) {
      util.axiosToRiot(fullUrl, async (success, data) => {
        if (success === true) {
          await db.query(`INSERT INTO summoner_info VALUES(?, ?, ?, ?, ?, ?, ?)`, [data.name, data.accountId, data.profileIconId, data.revisionDate, data.id, data.puuid, data.summonerLevel]);
          summonerInfo = [data];
          console.log(summonerInfo);
          util.success(res, summonerInfo);
        } else {
          util.fail(res, []);
        }
      });
    } else {
      console.log(summonerInfoCamel);
      util.success(res, summonerInfoCamel);
      // res.json(summonerInfo);
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/leagueV4", async (req, res) => {
  // TODO : DB 구조 구체화하기, 요청 과정 모듈화하기
  const { summonerName } = req.query;
  const url = process.env.LEAGUEV4;
  const getId = await db.query(`SELECT id FROM summoner_info where name=?`, [summonerName]);
  const encryptedSummonerId = getId[0].id;
  const fullUrl = `${url}${encryptedSummonerId}`;
  let rankInfo;

  // 1. DB에 소환사 랭크 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답
  try {
    rankInfo = await db.query(`SELECT * FROM summoner_rank WHERE summoner_name=?`, [summonerName]);
    const rankInfoCamel = util.chgCamelExpForList(rankInfo);

    // db에 정보가 없을때의 로직
    if (rankInfo.length <= 0) {
      util.axiosToRiot(fullUrl, (success, data) => {
        if (success === true) {
          data.forEach(async (data) => {
            await db.query(`INSERT INTO summoner_rank VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
              data.summonerName,
              data.summonerId,
              data.queueType,
              data.leagueId,
              data.tier,
              data.rank,
              data.leaguePoints,
              data.wins,
              data.losses,
              data.veteran,
              data.inactive,
              data.freshBlood,
              data.hotStreak,
            ]);
          });
          rankInfo = data;
          console.log(rankInfo);
          util.success(res, rankInfo);
        } else {
          util.fail(res, []);
        }
      });
    } else {
      console.log(rankInfoCamel);
      util.success(res, rankInfoCamel);
      // res.json(summonerInfo);
    }
  } catch (err) {
    console.log(err);
  }
});

// 현재 진행중인 게임 조회
router.get("/spectatorV4", (req, res) => {
  const { encryptedSummonerId } = req.query;
  const url = process.env.SPECTATORV4;
  const fullUrl = `${url}${encryptedSummonerId}`;

  util.axiosToRiot(fullUrl, (success, data) => {
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

  util.axiosToRiot(fullUrl1, (success, data) => {
    data.map((matchId) => {
      const fullUrl2 = `${url2}${matchId}`;

      util.axiosToRiot(fullUrl2, (success, data) => {
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
