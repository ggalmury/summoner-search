const express = require("express");
const util = require("../util/util.js");
const db = require("../../mysql.js");
const router = express.Router();
const axios = require("axios");
const { resolvePath } = require("react-router-dom");

// 1. DB에 소환사 정보 요청
// 2. 정보가 있다면 클라이언트에 응답
// 3. 정보가 없다면 riot api서버에 요청 후 받은 응답을 db에 저장 후 클라이언트에 응답

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
      switch (success) {
        case true:
          try {
            util.success(res, [data]);

            setSummonerInfoToDB(data.name, data.accountId, data.profileIconId, data.revisionDate, data.id, data.puuid, data.summonerLevel, data.name);

            setSummonerNameToDB(summonerNameRegexp, data.id, summonerNameRegexp);
          } catch (err) {
            console.log(err);
          }
          break;
        case false:
          util.fail(res, []);
          return;
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
    switch (success) {
      case true:
        util.success(res, data);
        break;
      case false:
        util.fail(res, []);
        break;
    }
  });
});

router.post("/leagueV4", async (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;

  let rankInfo = {};
  let rankInfoCamel = {};

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
      switch (success) {
        case true:
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
          break;
        case false:
          util.fail(res, []);
          break;
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
  // const headers = { "X-Riot-Token": process.env.APIKEY };

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

  axios
    .all([axios.get(url1, { headers }), axios.get(url2, { headers })])
    .then(
      axios.spread(async (infoResultRaw, rankResultRaw) => {
        infoResult = [infoResultRaw.data];
        rankResult = rankResultRaw.data;
        console.log(rankResult);

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
    )
    .catch((err) => {
      console.log(err);
    });
});

router.post("/spectatorV4", async (req, res) => {
  const { encryptedSummonerId } = req.body;
  const url = `https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/${encryptedSummonerId}`;

  util.riotRes(url, (success, data) => {
    switch (success) {
      case true:
        util.success(res, data);
        console.log(data);
        return;
      case false:
        util.fail(res, {});
        return;
    }
  });
});

router.post("/matchV5", (req, res) => {
  const { puuid, start, count } = req.body;
  const url1 = `https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/`;
  const url2 = `https://asia.api.riotgames.com/lol/match/v5/matches/`;
  const fullUrl1 = `${url1}${puuid}/ids?start=${start}&count=${count}`;

  let history = [];

  util.riotRes(fullUrl1, (success, data) => {
    switch (success) {
      case true:
        for (let matchId of data) {
          const fullUrl2 = `${url2}${matchId}`;

          let detail = {};

          const promise2 = new Promise((resolve, reject) => {
            util.riotRes(fullUrl2, (success, data) => {
              switch (success) {
                case true:
                  const game = data.info;
                  const participants = game.participants;

                  let participantData = [];
                  let participant = {};

                  const gameData = {
                    gameDuration: game.gameDuration,
                    gameStartTimestamp: game.gameStartTimestamp,
                    gameEndTimestamp: game.gameEndTimestamp,
                    gameMode: game.gameMode,
                    mapId: game.mapId,
                  };

                  for (let summ of participants) {
                    participant = {
                      summonerName: summ.summonerName,
                      teamId: summ.teamId,
                      win: summ.win,
                      summonerLevel: summ.summonerLevel,
                      kills: summ.kills,
                      deaths: summ.deaths,
                      assists: summ.assists,
                      perksMain: summ.perks.styles[0].selections[0].perk,
                      perksSub: summ.perks.styles[1].selections[0].perk,
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

                      item0: summ.item0,
                      item1: summ.item1,
                      item2: summ.item2,
                      item3: summ.item3,
                      item4: summ.item4,
                      item5: summ.item5,
                      item6: summ.item6,

                      baronKills: summ.baronKills,
                      dragonKills: summ.dragonKills,
                      turretKills: summ.turretKills,

                      detectorWardsPlaced: summ.detectorWardsPlaced,
                      wardsPlaced: summ.wardsPlaced,
                      wardsKilled: summ.wardsKilled,
                      goldEarned: summ.goldEarned,
                    };

                    participantData.push(participant);
                  }

                  detail.gameData = gameData;
                  detail.participantData = participantData;

                  resolve(detail);
                  break;
                default:
                  util.fail(res, []);
                  return;
              }
            });
          });

          promise2.then((arr) => {
            history.push(arr);

            if (history.length >= count) {
              util.success(res, history);
            }
          });
        }
        break;
      default:
        util.fail(res, []);
        return;
    }
  });
});

module.exports = router;
