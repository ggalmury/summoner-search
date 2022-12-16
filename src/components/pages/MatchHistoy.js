import { Fragment, React, useState } from "react";
import { useNavigate } from "react-router-dom";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import MatchDetail from "./matchDetail.js";

const MatchHistoy = (props) => {
  const navigate = useNavigate();
  const [isDetail, setIsDetail] = useState(false);

  const game = props.history;
  console.log(game);
  const summonerInfo = props.summoner;

  const gameData = game.gameData;
  const blueTeam = game.blueTeam;
  const redTeam = game.redTeam;

  const gameType = resourceUtil.gameType(gameData.queueId);
  const gameDuration = calcUtil.timeCalc(gameData.gameDuration);

  let myData = {};
  let vod = {};
  let teamTotalKill;

  //   console.log(game);

  const getParticipantList = (team) => {
    const data = team.participant.map((summ, idx) => {
      return (
        <li key={idx}>
          <div>
            <img className="history-summ-6-1-img" src={resourceUtil.champSquareImg(resourceUtil.champNumToName(summ.championId), resourceUtil.ddragonVersion())}></img>
          </div>
          <div
            className="history-summ-6-1-name"
            onClick={() => {
              navigate(`/summoner/${summ.summonerName}`);
            }}
          >
            {summ.summonerName}
          </div>
        </li>
      );
    });

    return <ul>{data}</ul>;
  };

  const getItemList = () => {
    const data = myData.items.map((item, idx) => {
      return (
        <div key={idx}>
          <img className="history-summ-5-img" src={resourceUtil.itemIng(item)}></img>
        </div>
      );
    });

    return data;
  };

  const getGameTotalStatistics = () => {
    if (isDetail === true) {
      setIsDetail(false);
    } else {
      setIsDetail(true);
    }
  };

  const renderHistory = () => {
    for (let participant of blueTeam.participant) {
      if (participant.summonerName === summonerInfo.name) {
        myData = participant;
        teamTotalKill = blueTeam.statistic.totalKill;
      } else {
        for (let participant of redTeam.participant) {
          if (participant.summonerName === summonerInfo.name) {
            myData = participant;
            teamTotalKill = redTeam.statistic.totalKill;
          }
        }
      }
    }

    if (gameData.gameDuration <= 300) {
      vod.eng = "draw";
      vod.kor = "다시하기";
    } else if (myData.win === true) {
      vod.eng = "win";
      vod.kor = "승리";
    } else {
      vod.eng = "lose";
      vod.kor = "패배";
    }

    return (
      <Fragment>
        <div className={vod.eng}>
          <div className="history-summ-1">
            <div className="history-summ-1-vod">{vod.kor}</div>
            <div className="history-summ-1-game">{gameType}</div>
            <div className="history-summ-1-passed">{calcUtil.passedTimeFromNow(gameData.gameEndTimestamp)}</div>
            <div className="history-summ-1-duration">
              {gameDuration.hour !== 0 ? (
                <div>
                  {gameDuration.hour}시간 {gameDuration.min}분 {gameDuration.sec}초
                </div>
              ) : (
                <div>
                  {gameDuration.min}분 {gameDuration.sec}초
                </div>
              )}
            </div>
          </div>
          <div className="history-summ-2">
            <div className="history-summ-2-1">
              <div>
                <img className="history-summ-2-1-img-1" src={resourceUtil.champSquareImg(resourceUtil.champNumToName(myData.championId), resourceUtil.ddragonVersion())}></img>
              </div>
              <div className="spell-box">
                <div className="spell-box-1">
                  <img className="history-summ-2-1-img-2" src={resourceUtil.summonerSpellImg(myData.summoner1Id)}></img>
                </div>
                <div className="spell-box-1">
                  <img className="history-summ-2-1-img-2" src={resourceUtil.summonerSpellImg(myData.summoner2Id)}></img>
                </div>
              </div>
            </div>
            <div className="history-summ-2-2">
              <div className="rune-box-1">
                <img className="history-summ-2-2-img-1" src={resourceUtil.mainPerkImg(myData.perksMain)}></img>
              </div>
              <div className="rune-box-2">
                <img className="history-summ-2-2-img-2" src={resourceUtil.subPerkImg(myData.perksSub)}></img>
              </div>
            </div>
          </div>
          <div className="history-summ-3">
            <div className="history-summ-3-1">
              <span>{myData.kills}</span> / <span className="d">{myData.deaths}</span> / <span>{myData.assists}</span>
            </div>
            <div className="history-summ-3-2">{calcUtil.kdaRate(myData.kills, myData.deaths, myData.assists)} 평점</div>
          </div>
          <div className="history-summ-4">
            <div className="history-summ-4-1">킬관여 {Math.floor(((myData.kills + myData.assists) / teamTotalKill) * 100) || 0}%</div>
            <div className="history-summ-4-2">
              cs {myData.totalMinionsKilled} ({(myData.totalMinionsKilled / gameDuration.min).toFixed(1)} / m)
            </div>
          </div>
          <div className="history-summ-5">{getItemList()}</div>
          <div className="history-summ-6">
            <div className="history-summ-6-1">{getParticipantList(blueTeam)}</div>
            <div className="history-summ-6-1">{getParticipantList(redTeam)}</div>
          </div>
          <div>
            <button className="btn-history-detail" onClick={getGameTotalStatistics}></button>
          </div>
        </div>
        <div>{isDetail === true ? <MatchDetail history={game}></MatchDetail> : <Fragment></Fragment>}</div>
      </Fragment>
    );
  };

  return renderHistory();
};

export default MatchHistoy;
