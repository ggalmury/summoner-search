import { Fragment, React, useEffect, useState, createContext } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading.js";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import MatchHistoy from "./MatchHistoy.js";

export const SummonerInfoContext = createContext({});

const ResultPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const summonerName = params.summonerName;
  const [summonerInfo, setSummonerInfo] = useState({});
  const [soloLeagueInfo, setSoloLeagueInfo] = useState({});
  const [flexLeagueInfo, setFlexLeagueInfo] = useState({});
  const [historyInfo, setHistoryInfo] = useState([]);
  const [champMasteryInfo, setChampMasteryInfo] = useState([]);
  const [rankCount, setRankCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const updateHistory = async () => {
    const updatedInfoRaw = await axios.post("/api/update", { encryptedSummonerId: summonerInfo.id });
    const updatedInfo = updatedInfoRaw.data;

    if (updatedInfo.success === undefined) {
      alert("소환사 정보 갱신 실패");
      return;
    }

    setSummonerInfo(updatedInfo.data[0][0]);

    updatedInfo.data[1].forEach((rank) => {
      switch (rank.queueType) {
        case "RANKED_FLEX_SR":
          setFlexLeagueInfo(rank);
          break;
        case "RANKED_SOLO_5x5":
          setSoloLeagueInfo(rank);
          break;
      }
    });

    alert("갱신되었습니다");
  };

  const convertHistoryInfo = (history) => {
    let convertResult = [];

    history.forEach((game, idx) => {
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
        totalDargonKills: 0,
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
        totalDargonKills: 0,
        totalTurretKills: 0,

        totalDamageDealt: 0,
        totalDamageTaken: 0,

        totalGold: 0,
        totalMinionKill: 0,
      };

      for (let participant of game.participantData) {
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
          redTeamStatistic.totalDamageDealt += participant.totalDamageDealtToChampions;
          redTeamStatistic.totalDamageTaken += participant.totalDamageTaken;
          redTeamStatistic.totalGold += participant.goldEarned;
          redTeamStatistic.totalMinionKill += participant.totalMinionsKilled;
        }
      }

      blueTeam.participant = blueTeamParticipant;
      blueTeam.statistic = blueTeamStatistic;

      redTeam.participant = redTeamParticipant;
      redTeam.statistic = redTeamStatistic;

      convertResult.push({ gameData, blueTeam, redTeam });
    });

    setHistoryInfo(convertResult);
  };

  const goToMain = () => {
    navigate(`/summoner/${summonerName}`);
  };

  const goToIngameInfo = () => {
    navigate(`/summoner/${summonerName}/ingame`);
  };

  const getChampName = (num) => {
    if (champMasteryInfo.length <= num) {
      return null;
    }

    return resourceUtil.champNumToName(champMasteryInfo[num].championId);
  };

  useEffect(() => {
    const fetchData = async () => {
      let infoResult;

      setSoloLeagueInfo({ tier: "UNRANKED" });
      setFlexLeagueInfo({ tier: "UNRANKED" });

      try {
        const infoResultRaw = await axios.post("/api/summonerV4", { summonerName });
        infoResult = infoResultRaw.data;

        if (infoResult.success === false) {
          alert("존재하지 않는 소환사입니다.");
          navigate(-1);
          return;
        }

        setSummonerInfo(infoResult.data[0]);
      } catch (err) {
        console.log(err);
        alert("소환사 정보 검색 오류");
        return;
      }

      Promise.allSettled([
        axios.post("/api/masteryV4", { encryptedSummonerId: infoResult.data[0].id }),
        axios.post("/api/leagueV4", { encryptedSummonerId: infoResult.data[0].id }),
        axios.post("/api/matchV5", { puuid: infoResult.data[0].puuid, start: 0, end: 100, count: rankCount }),
      ])
        .then((res) => {
          const champResult = res[0].value.data;
          const rankResult = res[1].value.data;
          const historyInfo = res[2].value.data;

          calcUtil.asc(historyInfo.data);

          setChampMasteryInfo(champResult.data);
          convertHistoryInfo(historyInfo.data);

          rankResult.data.forEach((rank) => {
            switch (rank.queueType) {
              case "RANKED_FLEX_SR":
                setFlexLeagueInfo(rank);
                break;
              case "RANKED_SOLO_5x5":
                setSoloLeagueInfo(rank);
                break;
              default:
                break;
            }
          });
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          alert("소환사 정보 검색 오류");
        });
    };

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
                <div id="summoner">
                  <div id="summoner-info1">
                    <div className="summoner-detail">
                      <div className="profile-icon-box">
                        <img id="profile-icon" src={resourceUtil.profileIconImg(summonerInfo.profileIconId, resourceUtil.ddragonVersion())} alt="profile"></img>
                      </div>
                      <div className="profile-info-box">
                        <div className="profile-info-box-1">{summonerInfo.name}</div>
                        <div className="profile-info-box-2">KR</div>
                        <div className="profile-info-box-3">{summonerInfo.summonerLevel} LV</div>
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
                  <div id="summoner-info2">
                    <div id="summoner-info2-rank">
                      <div className="summoner-rank-detail">
                        <div className="rank-icon-box">
                          <div className="rank-info-box-1">솔로랭크</div>
                          <img className="rank-emblem" src={resourceUtil.rankEmblem1(soloLeagueInfo.tier)} alt="rank emblem"></img>
                        </div>
                        <div className="rank-info-box">
                          {soloLeagueInfo.tier === "UNRANKED" ? (
                            <div className="rank-info-box-unranked">{soloLeagueInfo.tier}</div>
                          ) : (
                            <Fragment>
                              <div className="rank-info-box-2">{calcUtil.tier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</div>
                              <div className="rank-info-box-3">{soloLeagueInfo.leaguePoints}LP</div>
                              <div>
                                <div className="rank-info-box-4">
                                  <div className="rank-info-box-4-1">{soloLeagueInfo.wins}W </div>
                                  <div className="rank-info-box-4-2">{soloLeagueInfo.losses}L</div>
                                </div>
                                <div className="rank-info-box-5">승률 {calcUtil.winRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</div>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                      <div className="summoner-rank-detail">
                        <div className="rank-icon-box">
                          <div className="rank-info-box-1">자유랭크</div>
                          <img className="rank-emblem" src={resourceUtil.rankEmblem1(flexLeagueInfo.tier)} alt="rank emblem"></img>
                        </div>
                        <div className="rank-info-box">
                          {flexLeagueInfo.tier === "UNRANKED" ? (
                            <div className="rank-info-box-unranked">{flexLeagueInfo.tier}</div>
                          ) : (
                            <Fragment>
                              <div className="rank-info-box-2">{calcUtil.tier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</div>
                              <div className="rank-info-box-3">{flexLeagueInfo.leaguePoints}LP</div>
                              <div>
                                <div className="rank-info-box-4">
                                  <div className="rank-info-box-4-1">{flexLeagueInfo.wins}W</div>
                                  <div className="rank-info-box-4-2">{flexLeagueInfo.losses}L</div>
                                </div>
                                <div className="rank-info-box-5">승률 {calcUtil.winRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</div>
                              </div>
                            </Fragment>
                          )}
                        </div>
                      </div>
                    </div>
                    <div id="summoner-info2-champ">
                      <div className="champ-mastery">
                        <img className="champ-mastery-img1" src={resourceUtil.champImg(getChampName(1))} alt="champion"></img>
                        <div className="champ-mastery-info">
                          {champMasteryInfo[1] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(1)}</div>
                              <div>{champMasteryInfo[1].championLevel} LV</div>
                              <div>{champMasteryInfo[1].championPoints} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                      <div className="champ-mastery">
                        <img className="champ-mastery-img2" src={resourceUtil.champImg(getChampName(0))} alt="champion"></img>
                        <div className="champ-mastery-info">
                          {champMasteryInfo[0] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(0)}</div>
                              <div>{champMasteryInfo[0].championLevel} LV</div>
                              <div>{champMasteryInfo[0].championPoints} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                      <div className="champ-mastery">
                        <img className="champ-mastery-img1" src={resourceUtil.champImg(getChampName(2))} alt="champion"></img>
                        <div className="champ-mastery-info">
                          {champMasteryInfo[2] !== undefined ? (
                            <Fragment>
                              <div>{getChampName(2)}</div>
                              <div>{champMasteryInfo[2].championLevel} LV</div>
                              <div>{champMasteryInfo[2].championPoints} P</div>
                            </Fragment>
                          ) : (
                            <div>no result</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="match">
                  <div id="match-statistic">게임통계</div>
                  <div id="match-history">
                    <MatchHistoy history={historyInfo} summoner={summonerInfo}></MatchHistoy>
                  </div>
                  <div id="match-add">
                    <button id="btn-match-add">+</button>
                  </div>
                </div>
              </Fragment>
            )}
          </Fragment>
          <SummonerInfoContext.Provider value={summonerInfo}>
            <Outlet />
          </SummonerInfoContext.Provider>
        </div>
      </div>
    </Fragment>
  );
};

export default ResultPage;
