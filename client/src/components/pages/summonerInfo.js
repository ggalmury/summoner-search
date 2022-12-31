import { Fragment, React, useEffect, useState } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./loading.js";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import util from "util/util.js";
import { sumInfoContext } from "context/sumInfoContext.jsx";
import { hisInfoContext } from "context/hisInfoContext.jsx";

// TODO: 코드 최적화

const ResultPage = () => {
  const navigate = useNavigate();
  const summonerName = useParams().summonerName;
  const [summonerInfo, setSummonerInfo] = useState({});
  const [soloLeagueInfo, setSoloLeagueInfo] = useState({ tier: "UNRANKED" });
  const [flexLeagueInfo, setFlexLeagueInfo] = useState({ tier: "UNRANKED" });
  const [historyInfo, setHistoryInfo] = useState([]);
  const [champMasteryInfo, setChampMasteryInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  const goToMain = () => {
    navigate(`/summoner/${summonerName}`);
  };

  const goToIngameInfo = () => {
    navigate(`/summoner/${summonerName}/ingame`);
  };

  const queueType = (arr) => {
    arr.forEach((rank) => {
      switch (rank.queueType) {
        case "RANKED_FLEX_SR":
          setFlexLeagueInfo(rank);
          break;
        case "RANKED_SOLO_5x5":
          setSoloLeagueInfo(rank);
          break;
        default:
          return undefined;
      }
    });
  };

  const getChampName = (num) => {
    if (champMasteryInfo.length <= num) {
      return null;
    }

    return resourceUtil.champNumToName(champMasteryInfo[num].championId);
  };

  const updateHistory = async () => {
    const updatedInfoRaw = await axios.post(`${util.env()}/api/update`, { encryptedSummonerId: summonerInfo.id });
    const updatedInfo = updatedInfoRaw.data;

    if (updatedInfo.success === undefined) {
      alert("소환사 정보 갱신 실패");
      return;
    }

    setSummonerInfo(updatedInfo.data[0][0]);

    queueType(updatedInfo.data[1]);

    alert("갱신되었습니다");
  };

  const convertHistoryInfo = (history, id) => {
    let convertResult = [];
    let myData = {};

    history.forEach((game) => {
      const gameData = game.gameData;

      let blueTeam = {};
      let redTeam = {};

      let blueTeamParticipant = [];
      let redTeamParticipant = [];

      let blueTeamStatistic = {
        totalKill: 0,
        totalDeath: 0,
        totalAssist: 0,

        totalBaronKills: 0,
        totalDragonKills: 0,
        totalTurretKills: 0,

        totalDamageDealt: 0,
        totalDamageTaken: 0,

        totalGold: 0,
        totalMinionKill: 0,
      };

      let redTeamStatistic = {
        totalKill: 0,
        totalDeath: 0,
        totalAssist: 0,

        totalBaronKills: 0,
        totalDragonKills: 0,
        totalTurretKills: 0,

        totalDamageDealt: 0,
        totalDamageTaken: 0,

        totalGold: 0,
        totalMinionKill: 0,
      };

      for (let participant of game.participantData) {
        if (participant.summonerId === id) {
          myData = participant;
        }

        if (participant.teamId === 100) {
          blueTeamParticipant.push(participant);

          blueTeamStatistic.totalKill += participant.kills;
          blueTeamStatistic.totalDeath += participant.deaths;
          blueTeamStatistic.totalAssist += participant.assists;
          blueTeamStatistic.totalBaronKills += participant.baronKills;
          blueTeamStatistic.totalDargonKills += participant.dragonKills;
          blueTeamStatistic.totalTurretKills += participant.turretKills;
          blueTeamStatistic.totalDamageDealt += participant.totalDamageDealtToChampions;
          blueTeamStatistic.totalDamageTaken += participant.totalDamageTaken;
          blueTeamStatistic.totalGold += participant.goldEarned;
          blueTeamStatistic.totalMinionKill += participant.totalMinionsKilled;
        } else {
          redTeamParticipant.push(participant);

          redTeamStatistic.totalKill += participant.kills;
          redTeamStatistic.totalDeath += participant.deaths;
          redTeamStatistic.totalAssist += participant.assists;
          redTeamStatistic.totalBaronKills += participant.baronKills;
          redTeamStatistic.totalDargonKills += participant.dragonKills;
          redTeamStatistic.totalTurretKills += participant.turretKills;
          redTeamStatistic.totalDamageDealt += participant.totalDamageDealt;
          redTeamStatistic.totalDamageTaken += participant.totalDamageTaken;
          redTeamStatistic.totalGold += participant.goldEarned;
          redTeamStatistic.totalMinionKill += participant.totalMinionsKilled;
        }
      }

      blueTeam.participant = blueTeamParticipant;
      blueTeam.statistic = blueTeamStatistic;

      redTeam.participant = redTeamParticipant;
      redTeam.statistic = redTeamStatistic;

      convertResult.push({ gameData, blueTeam, redTeam, myData });
    });

    return convertResult;
  };

  useEffect(() => {
    const btn = document.getElementById("btn-search");

    const fetchData = async () => {
      let infoResult;
      let encryptedSummonerId;
      let puuid;

      try {
        const infoResultRaw = await axios.post(`${util.env()}/api/summonerV4`, { summonerName });
        infoResult = infoResultRaw.data;

        if (infoResult.success === false) {
          alert("존재하지 않는 소환사입니다.");
          navigate(-1);
          return;
        }

        encryptedSummonerId = infoResult.data[0].id;
        puuid = infoResult.data[0].puuid;

        setSummonerInfo(infoResult.data[0]);
      } catch (err) {
        console.log(err);
        alert("소환사 정보 검색 오류");
        return;
      }

      Promise.allSettled([
        axios.post(`${util.env()}/api/masteryV4`, { encryptedSummonerId }),
        axios.post(`${util.env()}/api/leagueV4`, { encryptedSummonerId }),
        axios.post(`${util.env()}/api/matchV5`, { puuid, start: 0, end: 100, count: 0 }),
      ])
        .then((res) => {
          const champResult = res[0].value.data;
          const rankResult = res[1].value.data;
          const historyInfo = res[2].value.data;

          calcUtil.asc(historyInfo.data);

          setChampMasteryInfo(champResult.data);
          queueType(rankResult.data);
          setHistoryInfo(convertHistoryInfo(historyInfo.data, encryptedSummonerId));

          btn.disabled = false;
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          alert("소환사 정보 검색 오류");
        });
    };

    btn.disabled = true;
    setLoading(true);
    fetchData();
  }, [summonerName]);

  return (
    <Fragment>
      <div id="article">
        <div id="content-box">
          <Fragment>
            {loading === true ? (
              <Loading />
            ) : (
              <Fragment>
                <div id="profile">
                  <div id="profile-1">
                    <div id="profile-1-1">
                      <img id="profile-1-1-img" src={resourceUtil.profileIconImg(summonerInfo.profileIconId, resourceUtil.ddragonVersion())} alt="profile"></img>
                      <div className="profile-detail">
                        <div className="profile-detail-1">{summonerInfo.name}</div>
                        <div className="profile-detail-2">
                          <div id="region">KR</div>
                          <img id="flag" src="../images/kr.png" alt="이미지"></img>
                        </div>
                        <div className="profile-detail-3">{summonerInfo.summonerLevel} LV</div>
                      </div>
                    </div>
                    <div id="nav">
                      <button className="btn-category" onClick={updateHistory}>
                        소환사 정보 갱신
                      </button>
                      <button className="btn-category" onClick={goToMain}>
                        종합
                      </button>
                      <button className="btn-category" onClick={goToIngameInfo}>
                        인게임
                      </button>
                    </div>
                  </div>
                  <div id="profile-2">
                    <div id="profile-2-1">
                      <div className="profile-rank-detail">
                        <div className="profile-rank-detail-1">
                          <div className="profile-rank-detail-2-1">솔로랭크</div>
                          <img src={resourceUtil.rankEmblem1(soloLeagueInfo.tier)} alt="rank emblem"></img>
                        </div>
                        <div className="profile-rank-detail-2">
                          {soloLeagueInfo.tier === "UNRANKED" ? (
                            <div className="profile-rank-detail-2-unranked">{soloLeagueInfo.tier}</div>
                          ) : (
                            <Fragment>
                              <div className="profile-rank-detail-2-2">{calcUtil.tier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</div>
                              <div className="profile-rank-detail-2-3">{soloLeagueInfo.leaguePoints}LP</div>
                              <div>
                                <div className="profile-rank-detail-2-4">
                                  <div className="profile-rank-detail-2-4-1">{soloLeagueInfo.wins}W </div>
                                  <div className="profile-rank-detail-2-4-2">{soloLeagueInfo.losses}L</div>
                                </div>
                                <div className="profile-rank-detail-2-5">승률 {calcUtil.winRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</div>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                      <div className="profile-rank-detail">
                        <div className="profile-rank-detail-1">
                          <div className="profile-rank-detail-2-1">자유랭크</div>
                          <img src={resourceUtil.rankEmblem1(flexLeagueInfo.tier)} alt="rank emblem"></img>
                        </div>
                        <div className="profile-rank-detail-2">
                          {flexLeagueInfo.tier === "UNRANKED" ? (
                            <div className="profile-rank-detail-2-unranked">{flexLeagueInfo.tier}</div>
                          ) : (
                            <Fragment>
                              <div className="profile-rank-detail-2-2">{calcUtil.tier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</div>
                              <div className="profile-rank-detail-2-3">{flexLeagueInfo.leaguePoints}LP</div>
                              <div>
                                <div className="profile-rank-detail-2-4">
                                  <div className="profile-rank-detail-2-4-1">{flexLeagueInfo.wins}W</div>
                                  <div className="profile-rank-detail-2-4-2">{flexLeagueInfo.losses}L</div>
                                </div>
                                <div className="profile-rank-detail-2-5">승률 {calcUtil.winRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</div>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                    </div>
                    <div id="profile-2-2">
                      <div className="profile-champ-detail">
                        <div className="profile-champ-detail-champ1">
                          <img src={resourceUtil.champSquareImg(getChampName(1), resourceUtil.ddragonVersion())} alt=""></img>
                        </div>
                        {champMasteryInfo[1].championLevel > 1 ? (
                          <div className="profile-champ-detail-mastery">
                            <img src={resourceUtil.champMasteryLv(champMasteryInfo[1].championLevel)} alt=""></img>
                          </div>
                        ) : (
                          <Fragment></Fragment>
                        )}
                        <div className="profile-champ-detail-info">
                          {champMasteryInfo[1] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(1)}</div>
                              <div>{champMasteryInfo[1].championPoints.toLocaleString()} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                      <div className="profile-champ-detail">
                        <div className="profile-champ-detail-champ2">
                          <img src={resourceUtil.champSquareImg(getChampName(0), resourceUtil.ddragonVersion())} alt=""></img>
                        </div>
                        {champMasteryInfo[0].championLevel > 1 ? (
                          <div className="profile-champ-detail-mastery">
                            <img src={resourceUtil.champMasteryLv(champMasteryInfo[0].championLevel)} alt=""></img>
                          </div>
                        ) : (
                          <Fragment></Fragment>
                        )}
                        <div className="profile-champ-detail-info">
                          {champMasteryInfo[0] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(0)}</div>
                              <div>{champMasteryInfo[0].championPoints.toLocaleString()} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                      <div className="profile-champ-detail">
                        <div className="profile-champ-detail-champ1">
                          <img className="profile-champ-detail-img1" src={resourceUtil.champSquareImg(getChampName(2), resourceUtil.ddragonVersion())} alt=""></img>
                        </div>
                        {champMasteryInfo[2].championLevel > 1 ? (
                          <div className="profile-champ-detail-mastery">
                            <img src={resourceUtil.champMasteryLv(champMasteryInfo[2].championLevel)} alt=""></img>
                          </div>
                        ) : (
                          <Fragment></Fragment>
                        )}
                        <div className="profile-champ-detail-info">
                          {champMasteryInfo[2] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(2)}</div>
                              <div>{champMasteryInfo[2].championPoints.toLocaleString()} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <sumInfoContext.Provider value={{ summonerInfo }}>
                  <hisInfoContext.Provider value={{ historyInfo, setHistoryInfo, convertHistoryInfo }}>
                    <Outlet />
                  </hisInfoContext.Provider>
                </sumInfoContext.Provider>
              </Fragment>
            )}
          </Fragment>
        </div>
      </div>
    </Fragment>
  );
};

export default ResultPage;
