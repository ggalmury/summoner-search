const express = require("express");
const util = require("../util/util.js");
const db = require("../../mysql.js");
const router = express.Router();
const axios = require("axios");

router.get("/", (req, res) => {
  res.send({ test: "hi" });
});

// 유저 정보 조회
router.get("/summonerV4", async (req, res) => {
  const { summonerName } = req.query;
  const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`;
  // 1. DB에 소환사 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답

  try {
    // mysql2 => 배열 반환
    const summonerInfo = await db.query(`SELECT * FROM summoner_info WHERE name=?`, [summonerName]);
    const summonerInfoCamel = util.chgCamelExpForList(summonerInfo);

    // db에 정보가 없을 때
    if (summonerInfo.length <= 0) {
      util.riotRes(url, async (success, data) => {
        switch (success) {
          case true:
            try {
              await db.query(`INSERT INTO summoner_info VALUES(?, ?, ?, ?, ?, ?, ?)`, [data.name, data.accountId, data.profileIconId, data.revisionDate, data.id, data.puuid, data.summonerLevel]);
              util.success(res, [data]);
            } catch (err) {
              console.log(err);
              alert("소환사 정보 DB 저장 에러");
            }
            break;
          case false:
            util.fail(res, []);
            break;
        }
      });
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
  const url = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;

  // 1. DB에 소환사 랭크 정보 요청
  // 2. 정보가 있다면 클라이언트에 응답
  // 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답

  try {
    const rankInfo = await db.query(`SELECT * FROM summoner_rank WHERE summoner_name=?`, [summonerName]);
    const rankInfoCamel = util.chgCamelExpForList(rankInfo);

    // db에 정보가 없을때의 로직
    if (rankInfo.length <= 0) {
      util.riotRes(url, (success, data) => {
        switch (success) {
          case true:
            try {
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
              util.success(res, data);
            } catch (err) {
              console.log(err);
              alert("소환사 랭크 정보 DB 저장 에러");
            }
            break;
          case false:
            util.fail(res, []);
            break;
        }
      });
      return;
    }
    // db에 정보가 있을 때
    util.success(res, rankInfoCamel);
  } catch (err) {
    console.log(err);
  }
});

router.get("/update", (req, res) => {
  const { encryptedSummonerId } = req.query;
  const url1 = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${encryptedSummonerId}`;
  const url2 = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
  const headers = { "X-Riot-Token": process.env.APIKEY };

  axios
    .all([axios.get(url1, { headers }), axios.get(url2, { headers })])
    .then(
      axios.spread(async (infoResult, rankResult) => {
        const infoResultRaw = [infoResult.data];
        const rankResultRaw = rankResult.data;
        console.log(infoResultRaw);
        console.log(rankResultRaw);
        // TODO : DB에 정보 update
        await db.query();
      })
    )
    .catch((err) => {
      console.log(err);
    });
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
