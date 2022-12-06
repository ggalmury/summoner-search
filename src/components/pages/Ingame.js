import { React, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import { SummonerInfoContext } from "./SummonerInfo";
import util, { summonerSpellImg } from "util/util.js";

// TODO: 밴된 챔피언 테이블 수정(table => div)

const Ingame = () => {
  const summonerInfo = useContext(SummonerInfoContext);
  const [ingameInfo, setIngameInfo] = useState({});
  const [summRankInfo, setSummRankInfo] = useState([]);
  const [bannedChampImg, setBannedChampImg] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChampSquareImg = (id) => {
    const ddversion = util.ddragonVersion();
    const champName = util.champNumToName(id);

    if (id === undefined || id === -1) {
      return `${process.env.PUBLIC_URL}/images/random-champion.png`;
    }

    return util.champSquareImg(champName, ddversion);
  };

  const bannedChampList = (list) => {
    let champArr = [];

    if (list.length !== 0) {
      for (let i = 0; i < 10; i++) {
        const id = list[i].championId;
        champArr.push(getChampSquareImg(id));
      }
    } else {
      for (let i = 0; i < 10; i++) {
        champArr.push(getChampSquareImg(-1));
      }
    }
    setBannedChampImg(champArr);
  };

  const summonerRank = (list) => {
    const promise = new Promise((resolve, reject) => {
      list.map(async (participant) => {
        try {
          const rankDataRaw = await axios.post("/api/leagueV4", { encryptedSummonerId: participant.summonerId });
          const rankData = rankDataRaw.data.data;

          rankData.map((detail) => {
            if (detail.queueType === "RANKED_SOLO_5x5") {
              const rank = {
                summonerName: detail.summonerName,
                tier: detail.tier,
                rank: detail.rank,
                leaguePoints: detail.leaguePoints,
                wins: detail.wins,
                losses: detail.losses,
              };

              participant.rank = rank;
            }
          });
        } catch (err) {
          console.log(err);
        }

        resolve(list);
      });
    });

    promise
      .then((arr) => {
        console.log(arr);
        setSummRankInfo(arr);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      let ingameResult = {};
      console.log("render");

      try {
        const ingameResultRaw = await axios.post("/api/spectatorV4", { encryptedSummonerId: summonerInfo.id });
        ingameResult = ingameResultRaw.data;

        setIngameInfo(ingameResult);
      } catch (err) {
        console.log(err);
      }

      if (ingameResult.success === true) {
        bannedChampList(ingameResult.data.bannedChampions);
        summonerRank(ingameResult.data.participants);
      }

      setTimeout(() => {
        setLoading(false);
      }, 600);
    };

    setLoading(true);
    fetchData();
  }, [summonerInfo]);

  return (
    <Fragment>
      {loading === true ? (
        <Loading />
      ) : (
        <div id="ingame-box">
          {ingameInfo.success === true ? (
            <Fragment>
              <div className="ingame-status">
                <div id="now-gaming">게임중입니다</div>
                <div id="game-detail">
                  <div id="game-detail-type">{util.gameType(ingameInfo.data.gameQueueConfigId)}</div>
                  <div id="game-detail-map">{util.mapType(ingameInfo.data.mapId)}</div>
                </div>
              </div>
              <div id="ingame-info">
                <div id="team-b">
                  <div className="banned-champ-list">
                    {bannedChampImg.map((value, idx) => {
                      if (idx >= 5) {
                        return;
                      }

                      return (
                        <div className="banned-champ" key={idx}>
                          <img className="banned-champ-img" src={value}></img>
                        </div>
                      );
                    })}
                  </div>
                  <table className="ingame-tb">
                    <tbody>
                      <tr id="team-b-h">
                        <th className="ingame-tb-th0" scope="col" colSpan={2}></th>
                        <th className="ingame-tb-th1" scope="col">
                          블루팀
                        </th>
                        <th className="ingame-tb-th2" scope="col" colSpan={2}>
                          티어
                        </th>
                        <th className="ingame-tb-th3" scope="col">
                          랭크 승률
                        </th>
                      </tr>
                      {summRankInfo.map((value, idx) => {
                        if (idx >= 5) {
                          return;
                        }

                        return (
                          <tr className="ingame-tb-tr2" key={idx}>
                            <td className="ingame-tb-champ-b">
                              <div>
                                <img className="ingame-tb-champ-b-img" src={getChampSquareImg(value.championId)}></img>
                              </div>
                            </td>
                            <td className="ingame-tb-spell">
                              <div>
                                <div className="spell-box">
                                  <img className="spell-img" src={util.summonerSpellImg(value.spell1Id)}></img>
                                </div>
                                <div className="spell-box">
                                  <img className="spell-img" src={util.summonerSpellImg(value.spell2Id)}></img>
                                </div>
                              </div>
                            </td>
                            <td className="ingame-tb-name">
                              <div>{value.summonerName}</div>
                            </td>
                            {value.rank !== undefined ? (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={util.rankEmblem2(value.rank.tier)}></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>
                                    {value.rank.tier} {value.rank.rank}
                                  </div>
                                  <div>{value.rank.leaguePoints} LP</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>
                                    {value.rank.wins} W {value.rank.losses} L ({util.winRate(value.rank.wins, value.rank.losses)} % )
                                  </div>
                                </td>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={util.rankEmblem2("UNRANKED")}></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>UNRANKED</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>-</div>
                                </td>
                              </Fragment>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div id="team-r">
                  <table className="ingame-tb">
                    <tbody>
                      <tr id="team-r-h">
                        <th className="ingame-tb-th0" scope="col" colSpan={2}></th>
                        <th className="ingame-tb-th1" scope="col">
                          레드팀
                        </th>
                        <th className="ingame-tb-th2" scope="col" colSpan={2}>
                          티어
                        </th>
                        <th className="ingame-tb-th3" scope="col">
                          랭크 승률
                        </th>
                      </tr>
                      {summRankInfo.map((value, idx) => {
                        if (idx < 5) {
                          return;
                        }

                        return (
                          <tr className="ingame-tb-tr2" key={idx}>
                            <td className="ingame-tb-champ-r">
                              <div>
                                <img className="ingame-tb-champ-r-img" src={getChampSquareImg(value.championId)}></img>
                              </div>
                            </td>
                            <td className="ingame-tb-spell">
                              <div>
                                <div className="spell-box">
                                  <img className="spell-img" src={util.summonerSpellImg(value.spell1Id)}></img>
                                </div>
                                <div className="spell-box">
                                  <img className="spell-img" src={util.summonerSpellImg(value.spell2Id)}></img>
                                </div>
                              </div>
                            </td>
                            <td className="ingame-tb-name">
                              <div>{value.summonerName}</div>
                            </td>
                            {value.rank !== undefined ? (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={util.rankEmblem2(value.rank.tier)}></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>
                                    {value.rank.tier} {value.rank.rank}
                                  </div>
                                  <div>{value.rank.leaguePoints} LP</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>
                                    {value.rank.wins} W {value.rank.losses} L ({util.winRate(value.rank.wins, value.rank.losses)} % )
                                  </div>
                                </td>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={util.rankEmblem2("UNRANKED")}></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>UNRANKED</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>-</div>
                                </td>
                              </Fragment>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="banned-champ-list">
                    {bannedChampImg.map((value, idx) => {
                      if (idx < 5) {
                        return;
                      }

                      return (
                        <div className="banned-champ" key={idx}>
                          <img className="banned-champ-img" src={value}></img>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div>게임중이 아닙니다</div>
            </Fragment>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default Ingame;
