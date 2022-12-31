import { React, useEffect, useState, useContext, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loading from "./loading.js";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import util from "util/util.js";
import { sumInfoContext } from "context/sumInfoContext.jsx";

const Ingame = () => {
  const navigate = useNavigate();
  const { summonerInfo } = useContext(sumInfoContext);
  const [ingameInfo, setIngameInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const getChampSquareImg = (id) => {
    const ddversion = resourceUtil.ddragonVersion();
    const champName = resourceUtil.champNumToName(id);

    if (id === undefined || id === -1) {
      return `${process.env.PUBLIC_URL}/images/icon-helmet.png`;
    }

    return resourceUtil.champSquareImg(champName, ddversion);
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

    return newArr;
  };

  const convertIngameInfo = async (ingame) => {
    const data = ingame.data;

    let convertResult = {};

    let blueTeam = {};
    let redTeam = {};

    let blueTeamParticipant = [];
    let redTeamParticipant = [];

    let blueTeamBannedChamp = [];
    let redTeamBannedChamp = [];

    const gameData = {
      gameId: data.gameId,
      gameLength: data.gameLength,
      gameMode: data.gameMode,
      gameQueueConfigId: data.gameQueueConfigId,
      gameStartTime: data.gameStartTime,
      gameType: data.gameType,
      mapId: data.mapId,
      platformId: data.platformId,
    };

    const participantWithRank = await summonerRank(ingame.data.participants);

    for (let participant of participantWithRank) {
      if (participant.teamId === 100) {
        blueTeamParticipant.push(participant);
      } else {
        redTeamParticipant.push(participant);
      }
    }

    for (let champ of ingame.data.bannedChampions) {
      if (champ.teamId === 100) {
        blueTeamBannedChamp.push(champ);
      } else {
        redTeamBannedChamp.push(champ);
      }
    }

    blueTeam = {
      team: "blue",
      participants: blueTeamParticipant,
      bannedChamps: blueTeamBannedChamp,
    };

    redTeam = {
      team: "red",
      participants: redTeamParticipant,
      bannedChamps: redTeamBannedChamp,
    };

    convertResult = {
      data: { gameData, blueTeam, redTeam },
      success: ingame.success,
    };

    console.log(convertResult);
    return convertResult;
  };

  const getGameDuration = () => {
    setInterval(() => {
      const now = new Date().getTime();
      const game = ingameInfo.data.gameData.gameStartTime;
      const gameTime = Math.trunc((now - game) / 1000);
      console.log(gameTime);

      return gameTime;
    }, 1000);
  };

  const renderDetail = (team) => {
    const participants = team.participants;
    const bannedChamps = team.bannedChamps;
    const teamName = team.team;

    const champImg = (id) => {
      return resourceUtil.champSquareImg(resourceUtil.champNumToName(id), resourceUtil.ddragonVersion());
    };

    return (
      <div id={`team-${teamName}`}>
        <div className="banned-champ-list">
          {bannedChamps.map((value, idx) => {
            return (
              <div className="banned-champ" key={idx}>
                <img src={champImg(value.championId)} alt="이미지"></img>
              </div>
            );
          })}
        </div>
        <table className={`ingame-tb tb-${teamName}`}>
          <tbody>
            <tr id={`team-${teamName}-h`}>
              <th className="ingame-tb-th0" scope="col" colSpan={2}></th>
              <th className="ingame-tb-th1" scope="col">
                소환사
              </th>
              <th className="ingame-tb-th2" scope="col" colSpan={2}>
                티어
              </th>
              <th className="ingame-tb-th3" scope="col">
                랭크 승률
              </th>
            </tr>
            {participants.map((value, idx) => {
              return (
                <tr className="ingame-tb-tr2" key={idx}>
                  <td className={`ingame-tb-champ-${teamName}`}>
                    <div>
                      <img src={getChampSquareImg(value.championId)} alt="이미지"></img>
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
                    <div
                      onClick={() => {
                        navigate(`/summoner/${value.summonerName}`);
                      }}
                    >
                      {value.summonerName}
                    </div>
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
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      let ingameResult = {};

      try {
        const ingameResultRaw = await axios.post(`${util.env()}/api/spectatorV4`, { encryptedSummonerId: summonerInfo.id });
        ingameResult = ingameResultRaw.data;

        setIngameInfo(await convertIngameInfo(ingameResult));
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, []);

  return (
    <Fragment>
      {loading ? (
        <Loading />
      ) : (
        <div id="ingame-box">
          {ingameInfo.success ? (
            <Fragment>
              <div id="ingame-status">
                <div id="ingame-status-1">
                  <div id="ingame-status-1-type">{resourceUtil.gameType(ingameInfo.data.gameData.gameQueueConfigId)}</div>
                  <div id="ingame-status-1-map">{resourceUtil.mapType(ingameInfo.data.gameData.mapId)}</div>
                </div>
                <div id="ingame-status-2">게임중입니다</div>
              </div>
              <div className="ingame-detail">
                <div className="ingame-info">{renderDetail(ingameInfo.data.blueTeam)}</div>
                <div className="ingame-info">{renderDetail(ingameInfo.data.redTeam)}</div>
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
