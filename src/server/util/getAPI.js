const util = require("./util.js");
const db = require("../../mysql.js");

/*  === 클라이언트 요청 이후 ===
    - db에 정보가 있다면 클라이언트에 응답
    - db에 정보가 없다면 riot api server에 요청 후 응답값 db저장 후 클라이언트에 배열로 응답 */

module.exports = {
  getSummonerInfoFromRiot: (res, summonerName) => {
    const url = `https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`;
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
  },

  getSummonerRankFromRiot: (res, encryptedSummonerId) => {
    const url = `https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`;
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
  },
};
