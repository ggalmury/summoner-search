import { Fragment, React, useState } from "react";
import { useNavigate } from "react-router-dom";
import resourceUtil from "util/resourceUtil.js";
import calcUtil from "util/calcUtil.js";
import MatchDetail from "./matchDetail.js";

const MatchHistoy = (props) => {
  const navigate = useNavigate();
  const [isDetail, setIsDetail] = useState(false);
  const game = props.history;
  const gameData = game.gameData;
  const blueTeam = game.blueTeam;
  const redTeam = game.redTeam;
  const myData = game.myData;

  let vod = {};
  let teamTotalKill;

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

  if (myData.teamId === 100) {
    teamTotalKill = blueTeam.statistic.totalKill;
  } else {
    teamTotalKill = redTeam.statistic.totalKill;
  }

  const getChampSquareImg = (id) => {
    return resourceUtil.champSquareImg(resourceUtil.champNumToName(id), resourceUtil.ddragonVersion());
  };

  const getParticipantList = (team) => {
    const data = team.participant.map((summ, idx) => {
      return (
        <li key={idx}>
          <div>
            <img className="history-summ-6-1-img" src={getChampSquareImg(summ.championId)}></img>
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

  const getItemList = (myData) => {
    const data = myData.items.map((item, idx) => {
      const itemImg = resourceUtil.itemIng(item);

      return (
        <div key={idx}>
          <img className="history-summ-5-img" src={itemImg}></img>
        </div>
      );
    });

    return data;
  };

  const renderHistory = () => {
    const gameType = resourceUtil.gameType(gameData.queueId);
    const gameDuration = calcUtil.timeCalc(gameData.gameDuration);
    const passedTime = calcUtil.passedTimeFromNow(gameData.gameEndTimestamp);

    const kills = myData.kills;
    const deaths = myData.deaths;
    const assists = myData.assists;
    const kda = calcUtil.kdaRate(kills, deaths, assists);
    const killPart = Math.floor(((kills + assists) / teamTotalKill) * 100);

    const mainPerkImg = resourceUtil.mainPerkImg(myData.perksMain);
    const subPerkImg = resourceUtil.subPerkImg(myData.perksSub);

    const minionKill = myData.totalMinionsKilled;
    const minionPerMinute = (minionKill / gameDuration.min).toFixed(1);

    const spellImg = (id) => {
      return resourceUtil.summonerSpellImg(id);
    };

    return (
      <Fragment>
        <div className={vod.eng}>
          <div className="history-summ-1">
            <div className="history-summ-1-vod">{vod.kor}</div>
            <div className="history-summ-1-game">{gameType}</div>
            <div className="history-summ-1-passed">{passedTime}</div>
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
                <img className="history-summ-2-1-img-1" src={getChampSquareImg(myData.championId)}></img>
              </div>
              <div className="spell-box">
                <div className="spell-box-1">
                  <img src={spellImg(myData.summoner1Id)}></img>
                </div>
                <div className="spell-box-1">
                  <img src={spellImg(myData.summoner2Id)}></img>
                </div>
              </div>
            </div>
            <div className="history-summ-2-2">
              <div className="rune-box-1">
                <img src={mainPerkImg}></img>
              </div>
              <div className="rune-box-2">
                <img src={subPerkImg}></img>
              </div>
            </div>
          </div>
          <div className="history-summ-3">
            <div className="history-summ-3-1">
              <span>{kills}</span> / <span className="d">{deaths}</span> / <span>{assists}</span>
            </div>
            <div className="history-summ-3-2">{kda} 평점</div>
          </div>
          <div className="history-summ-4">
            <div className="history-summ-4-1">킬관여 {killPart || 0}%</div>
            <div className="history-summ-4-2">
              cs {minionKill} ({minionPerMinute} / m)
            </div>
          </div>
          <div className="history-summ-5">{getItemList(myData)}</div>
          <div className="history-summ-6">
            <div className="history-summ-6-1">{getParticipantList(blueTeam)}</div>
            <div className="history-summ-6-1">{getParticipantList(redTeam)}</div>
          </div>
          <div>
            <button
              className="btn-history-detail"
              onClick={() => {
                setIsDetail(!isDetail);
              }}
            ></button>
          </div>
        </div>
        <div className="table-location">{isDetail === true ? <MatchDetail history={game}></MatchDetail> : <Fragment></Fragment>}</div>
      </Fragment>
    );
  };

  return renderHistory();
};

export default MatchHistoy;
