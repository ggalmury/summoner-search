import { React, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import Loading from "./loading.js";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import util from "util/util.js";
import { sumInfoContext } from "context/sumInfoContext.jsx";

const Ingame = () => {
  const { summonerInfo } = useContext(sumInfoContext);
  const [ingameInfo, setIngameInfo] = useState({});
  const [summRankInfo, setSummRankInfo] = useState([]);
  const [bannedChampImg, setBannedChampImg] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChampSquareImg = (id) => {
    const ddversion = resourceUtil.ddragonVersion();
    const champName = resourceUtil.champNumToName(id);

    if (id === undefined || id === -1) {
      return `${process.env.PUBLIC_URL}/images/icon-helmet.png`;
    }

    return resourceUtil.champSquareImg(champName, ddversion);
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

  const summonerRank = async (list) => {
    const newArr = await Promise.all(
      list.map(async (participant) => {
        try {
          const rankDataRaw = await axios.post(`${util.env()}/api/leagueV4`, { encryptedSummonerId: participant.summonerId });
          const rankData = rankDataRaw.data.data;

          for (let detail of rankData) {
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
          }

          return participant;
        } catch (err) {
          console.log(err);
        }
      })
    );

    setSummRankInfo(newArr);
  };

  useEffect(() => {
    const fetchData = async () => {
      let ingameResult = {};
      console.log(summonerInfo.id);

      try {
        const ingameResultRaw = await axios.post(`${util.env()}/api/spectatorV4`, { encryptedSummonerId: summonerInfo.id });
        ingameResult = ingameResultRaw.data;

        setIngameInfo(ingameResult);
      } catch (err) {
        console.log(err);
      }

      if (ingameResult.success === true) {
        bannedChampList(ingameResult.data.bannedChampions);
        summonerRank(ingameResult.data.participants);
      }

      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, []);

  return (
    <Fragment>
      {loading === true ? (
        <Loading />
      ) : (
        <div id="ingame-box">
          {ingameInfo.success === true ? (
            <Fragment>
              <div className="ingame-status">
                <div id="game-detail">
                  <div id="game-detail-type">{resourceUtil.gameType(ingameInfo.data.gameQueueConfigId)}</div>
                  <div id="game-detail-map">{resourceUtil.mapType(ingameInfo.data.mapId)}</div>
                </div>
                <div id="now-gaming">게임중입니다</div>
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
                          <img className="banned-champ-img" src={value} alt="이미지"></img>
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
                                <img className="ingame-tb-champ-b-img" src={getChampSquareImg(value.championId)} alt="이미지"></img>
                              </div>
                            </td>
                            <td className="ingame-tb-spell">
                              <div>
                                <div className="spell-box">
                                  <img className="spell-img" src={resourceUtil.summonerSpellImg(value.spell1Id)} alt="이미지"></img>
                                </div>
                                <div className="spell-box">
                                  <img className="spell-img" src={resourceUtil.summonerSpellImg(value.spell2Id)} alt="이미지"></img>
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
                                    <img className="ingame-tb-rank-img" src={resourceUtil.rankEmblem2(value.rank.tier)} alt="이미지"></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>{calcUtil.tier(value.rank.tier, value.rank.rank)}</div>
                                  <div>{value.rank.leaguePoints} LP</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>
                                    {value.rank.wins} W {value.rank.losses} L ({calcUtil.winRate(value.rank.wins, value.rank.losses)} % )
                                  </div>
                                </td>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={resourceUtil.rankEmblem2("UNRANKED")} alt="이미지"></img>
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
                        if (idx < 5) return;

                        return (
                          <tr className="ingame-tb-tr2" key={idx}>
                            <td className="ingame-tb-champ-r">
                              <div>
                                <img className="ingame-tb-champ-r-img" src={getChampSquareImg(value.championId)} alt="이미지"></img>
                              </div>
                            </td>
                            <td className="ingame-tb-spell">
                              <div>
                                <div className="spell-box">
                                  <img className="spell-img" src={resourceUtil.summonerSpellImg(value.spell1Id)} alt="이미지"></img>
                                </div>
                                <div className="spell-box">
                                  <img className="spell-img" src={resourceUtil.summonerSpellImg(value.spell2Id)} alt="이미지"></img>
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
                                    <img className="ingame-tb-rank-img" src={resourceUtil.rankEmblem2(value.rank.tier)} alt="이미지"></img>
                                  </div>
                                </td>
                                <td className="ingame-tb-lp">
                                  <div>{calcUtil.tier(value.rank.tier, value.rank.rank)}</div>
                                  <div>{value.rank.leaguePoints} LP</div>
                                </td>
                                <td className="ingame-tb-winrate">
                                  <div>
                                    {value.rank.wins} W {value.rank.losses} L ({calcUtil.winRate(value.rank.wins, value.rank.losses)} % )
                                  </div>
                                </td>
                              </Fragment>
                            ) : (
                              <Fragment>
                                <td className="ingame-tb-rank">
                                  <div>
                                    <img className="ingame-tb-rank-img" src={resourceUtil.rankEmblem2("UNRANKED")} alt="이미지"></img>
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
                      if (idx < 5) return;

                      return (
                        <div className="banned-champ" key={idx}>
                          <img className="banned-champ-img" src={value} alt="이미지"></img>
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
