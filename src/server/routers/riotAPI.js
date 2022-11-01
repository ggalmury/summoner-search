const express = require("express");
const util = require("../../util.js");
const db = require("../../mysql.js");
const router = express.Router();

// snake_case -> camelCase 변환 함수
const chgCamelExpForList = (targetList) => {
  let retArr = [];

  // 리스트.
  targetList.forEach((targetObj) => {
    let retObj = new Object();

    for (let key in targetObj) {
      let name = key.toLowerCase().replace(/_[a-z]/g, (str) => {
        return str[1].toUpperCase();
      });
      retObj[name] = targetObj[key];
    }
    retArr.push(retObj);
  });
  return retArr;
};

router.get("/", (req, res) => {
  res.send({ test: "hi" });
});

// 유저 정보 조회
router.get("/summonerV4", async (req, res) => {
  const { summonerName } = req.query;
  const url = process.env.SUMMONERV4;
  const fullUrl = `${url}${summonerName}`;
  let summonerInfo;

  try {
    // mysql2 returns array
    summonerInfo = await db.query(`SELECT * FROM summoner_info WHERE name=?`, [summonerName.toUpperCase()]);
    const summonerInfoCamel = chgCamelExpForList(summonerInfo);

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
  // TODO : db 거쳐 응답하는 로직 구현
  const { summonerName } = req.query;
  const url = process.env.LEAGUEV4;
  const dbRequest = await db.query(`SELECT id FROM summoner_info where name=?`, [summonerName]);
  const encryptedSummonerId = dbRequest[0].id;
  const fullUrl = `${url}${encryptedSummonerId}`;

  util.axiosToRiot(fullUrl, (success, data) => {
    console.log(data);
    util.success(res, data);
  });
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
