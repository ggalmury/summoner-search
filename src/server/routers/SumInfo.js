const express = require("express");
const util = require("../util/util.js");
const db = require("../../mysql.js");
const router = express.Router();
const axios = require("axios");
const { resolvePath } = require("react-router-dom");

// 1. DB에 소환사 정보 요청
// 2. 정보가 있다면 클라이언트에 응답
// 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 DB에 저장 후 클라이언트에 응답

router.post("/", (req, res) => {
  res.send({ test: "hi" });
});

router.post("/summonerV4", async (req, res) => {
  const { summonerName } = req.body;
  const summonerNameRegexp = util.toLowerRegexp(summonerName);
  const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`;

  let summonerInfo = {};
  let summonerInfoCamel = {};

  const getSummonerInfoFromDB = () => {
    return db.query(
      `SELECT * FROM summoner_search a RIGHT JOIN summoner_info b 
      ON a.id = b.id 
      WHERE a.searched_name=?`,
      [summonerNameRegexp]
    );
  };

  const setSummonerNameToDB = (name, id) => {
    db.query(
      `INSERT INTO summoner_search(searched_name, id) 
      VALUES(?, ?) ON DUPLICATE KEY UPDATE searched_name=?`,
      [name, id, name]
    );
  };

  const setSummonerInfoToDB = (name, accountId, profileIconId, revisionDate, id, puuid, level) => {
    db.query(
      `INSERT INTO summoner_info(name, account_id, profile_icon_id, revision_date, id, puuid, summoner_level)
      VALUES(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?`,
      [name, accountId, profileIconId, revisionDate, id, puuid, level, name]
    );
  };

  try {
    summonerInfo = await getSummonerInfoFromDB();
    summonerInfoCamel = util.chgCamelExpForList(summonerInfo);
  } catch (err) {
    console.log(err);
  }

  if (summonerInfo.length <= 0) {
    util.riotRes(url, async (success, data) => {
      if (success) {
        try {
          util.success(res, [data]);

          setSummonerInfoToDB(data.name, data.accountId, data.profileIconId, data.revisionDate, data.id, data.puuid, data.summonerLevel, data.name);

          setSummonerNameToDB(summonerNameRegexp, data.id, summonerNameRegexp);
        } catch (err) {
          console.log(err);
        }
      } else {
        util.fail(res, []);
      }
    });
  } else {
    util.success(res, summonerInfoCamel);
  }
});

router.post("/masteryV4", (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url = `https://kr.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${encryptedSummonerId}/top?count=3`;

  util.riotRes(url, (success, data) => {
    if (success) {
      util.success(res, data);
    } else {
      util.fail(res, []);
    }
  });
});

router.post("/leagueV4", async (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;

  let rankInfo = [];
  let rankInfoCamel = [];

  const getRankInfoFromDB = (id) => {
    return db.query(`SELECT * FROM summoner_rank WHERE summoner_id=?`, [id]);
  };

  const setRankInfoToDB = (name, id, queueType, leagueId, tier, rank, leaguePoints, wins, losses, hotStreak, veteran, freshBlood, inactive) => {
    db.query(
      `INSERT INTO summoner_rank 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, id, queueType, leagueId, tier, rank, leaguePoints, wins, losses, hotStreak, veteran, freshBlood, inactive]
    );
  };

  try {
    rankInfo = await getRankInfoFromDB(encryptedSummonerId);
    rankInfoCamel = util.chgCamelExpForList(rankInfo);
  } catch (err) {
    console.log(err);
  }

  if (rankInfo.length <= 0) {
    util.riotRes(url, (success, data) => {
      if (success) {
        try {
          util.success(res, data);

          data.forEach((data) => {
            setRankInfoToDB(
              data.summonerName,
              data.summonerId,
              data.queueType,
              data.leagueId,
              data.tier,
              data.rank,
              data.leaguePoints,
              data.wins,
              data.losses,
              data.hotStreak,
              data.veteran,
              data.freshBlood,
              data.inactive
            );
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        util.fail(res, []);
      }
    });
  } else {
    util.success(res, rankInfoCamel);
  }
});

router.post("/update", (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url1 = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/${encryptedSummonerId}`;
  const url2 = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
  const headers = { "X-Riot-Token": process.env.APIKEY };

  let infoResult = {};
  let rankResult = {};

  const updateSummonerInfoToDB = (profileIconId, revisionDate, summonerLevel) => {
    db.query(`UPDATE summoner_info SET profile_icon_id=?, revision_date=?, summoner_level=? WHERE id=?`, [profileIconId, revisionDate, summonerLevel, encryptedSummonerId]);
  };

  const updateSummonerRankToDB = (name, queueType, id, leagueId, tier, rank, leaguePoints, wins, losses, hotStreak, veteran, freshBlood, inactive) => {
    db.query(
      `INSERT INTO summoner_rank 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE summoner_name=?, league_id=?, tier=?, \`rank\`=?, league_points=?, wins=?, losses=?, hot_streak=?, veteran=?, fresh_blood=?, inactive=?`,
      [
        name,
        id,
        queueType,
        leagueId,
        tier,
        rank,
        leaguePoints,
        wins,
        losses,
        hotStreak,
        veteran,
        freshBlood,
        inactive,
        name,
        leagueId,
        tier,
        rank,
        leaguePoints,
        wins,
        losses,
        hotStreak,
        veteran,
        freshBlood,
        inactive,
      ]
    );
  };

  Promise.allSettled([axios.get(url1, { headers }), axios.get(url2, { headers })])
    .then((result) => {
      infoResult = [result[0].value.data];
      rankResult = result[1].value.data;

      try {
        util.success(res, [infoResult, rankResult]);

        updateSummonerInfoToDB(infoResult[0].profileIconId, infoResult[0].revisionDate, infoResult[0].summonerLevel);

        rankResult.forEach((data) => {
          updateSummonerRankToDB(
            data.summonerName,
            data.queueType,
            data.summonerId,
            data.leagueId,
            data.tier,
            data.rank,
            data.leaguePoints,
            data.wins,
            data.losses,
            data.hotStreak,
            data.veteran,
            data.freshBlood,
            data.inactive
          );
        });
      } catch (err) {
        console.log(err);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/spectatorV4", async (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url = `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}`;

  util.riotRes(url, (success, data) => {
    if (success) {
      util.success(res, data);
      console.log(data);
    } else {
      util.fail(res, {});
    }
  });
});

router.post("/matchV5", (req, res) => {
  const { puuid, start, end, count } = req.body;
  const url1 = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/`;
  const url2 = `https://asia.api.riotgames.com/lol/match/v5/matches/`;
  const fullUrl1 = `${url1}${puuid}/ids?start=${start}&count=${end}`;

  util.riotRes(fullUrl1, (success, data) => {
    let history = [];

    const newData = data.slice(count, count + 10);

    if (success) {
      newData.map((matchId) => {
        const fullUrl2 = `${url2}${matchId}`;

        util.riotRes(fullUrl2, (success, data) => {
          let detail = {};

          if (success) {
            const game = data.info;
            const participants = game.participants;

            const gameData = {
              gameDuration: game.gameDuration,
              gameStartTimestamp: game.gameStartTimestamp / 1000,
              gameEndTimestamp: game.gameEndTimestamp / 1000,
              gameMode: game.gameMode,
              mapId: game.mapId,
              queueId: game.queueId,
            };

            const participantData = participants.map((summ) => {
              const participant = {
                summonerName: summ.summonerName,
                summonerId: summ.summonerId,
                teamId: summ.teamId,
                win: summ.win,
                summonerLevel: summ.summonerLevel,
                kills: summ.kills,
                deaths: summ.deaths,
                assists: summ.assists,
                perksMain: summ.perks.styles[0].selections[0].perk,
                perksSub: summ.perks.styles[1].style,
                totalDamageDealtToChampions: summ.totalDamageDealtToChampions,
                totalDamageTaken: summ.totalDamageTaken,
                totalMinionsKilled: summ.totalMinionsKilled,

                lane: summ.lane,
                championId: summ.championId,
                champLevel: summ.champLevel,
                summoner1Id: summ.summoner1Id,
                summoner2Id: summ.summoner2Id,

                doubleKills: summ.doubleKills,
                tripleKills: summ.tripleKills,
                quadraKills: summ.quadraKills,
                pentaKills: summ.pentaKills,

                items: [summ.item0, summ.item1, summ.item2, summ.item3, summ.item4, summ.item5, summ.item6],

                baronKills: summ.baronKills,
                dragonKills: summ.dragonKills,
                turretKills: summ.turretKills,

                detectorWardsPlaced: summ.detectorWardsPlaced,
                wardsPlaced: summ.wardsPlaced,
                wardsKilled: summ.wardsKilled,
                goldEarned: summ.goldEarned,
              };

              return participant;
            });

            detail.gameData = gameData;
            detail.participantData = participantData;

            history.push(detail);
            if (history.length >= 10) {
              util.success(res, history);
              return;
            }
          } else {
            util.fail(res, []);
            return;
          }
        });
      });
    } else {
      util.fail(res, []);
      return;
    }
  });
});

module.exports = router;
