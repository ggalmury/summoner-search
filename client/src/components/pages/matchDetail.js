import { Fragment, React } from "react";
import { useNavigate } from "react-router-dom";
import resourceUtil from "../../util/resourceUtil.js";
import calcUtil from "../../util/calcUtil.js";

const MatchDetail = (props) => {
  const navigate = useNavigate();
  const history = props.history;

  const blueTeamStat = history.blueTeam.statistic;
  const redTeamstat = history.redTeam.statistic;

  let high;

  const highestDamage = () => {
    let damages = [];

    history.blueTeam.participant.forEach((participant) => {
      damages.push(participant.totalDamageDealtToChampions);
    });

    history.redTeam.participant.forEach((participant) => {
      damages.push(participant.totalDamageDealtToChampions);
    });

    damages.sort((a, b) => {
      if (a > b) return 1;
      if (a === b) return 0;
      if (a < b) return -1;
    });

    high = damages[damages.length - 1];
  };

  highestDamage();

  const renderDetail = (team) => {
    const participants = team.participant;

    const vod = () => {
      if (team.participant[0].win === true) {
        return "승리";
      } else {
        return "패배";
      }
    };

    const data = participants.map((participant, idx) => {
      const champName = resourceUtil.champNumToName(participant.championId);
      const champImg = resourceUtil.champSquareImg(champName, resourceUtil.ddragonVersion());
      const champLevel = participant.champLevel;

      const mainPerksImg = resourceUtil.mainPerkImg(participant.perksMain);
      const subPerkImg = resourceUtil.subPerkImg(participant.perksSub);

      const summonerName = participant.summonerName;

      const kills = participant.kills;
      const deaths = participant.deaths;
      const assists = participant.assists;
      const kda = calcUtil.kdaRate(kills, deaths, assists);
      const killPart = Math.floor(((kills + assists) / team.statistic.totalKill) * 100);

      const damageDealt = participant.totalDamageDealtToChampions;
      const damageTaken = participant.totalDamageTaken;

      const normalWard = participant.wardsPlaced;
      const detectorWard = participant.detectorWardsPlaced;
      const destroyWard = participant.wardsKilled;

      const minionKill = participant.totalMinionsKilled;
      const minionPerMinute = (participant.totalMinionsKilled / calcUtil.timeCalc(history.gameData.gameDuration).min).toFixed(1);

      const itemImg = participant.items.map((item) => {
        return resourceUtil.itemIng(item);
      });

      const spellImg = (spellId) => {
        return resourceUtil.summonerSpellImg(spellId);
      };

      return (
        <Fragment key={idx}>
          <tr className="match-tr-2">
            <td>
              <div>
                <img className="match-tr-2-img1" src={champImg} alt="이미지"></img>
              </div>
            </td>
            <td className="match-tr-2-sp">
              <div className="match-tr-2-sp-d">
                <img className="match-tr-2-img2" src={spellImg(participant.summoner1Id)} alt="이미지"></img>
                <img className="match-tr-2-img2" src={spellImg(participant.summoner2Id)} alt="이미지"></img>
              </div>
            </td>
            <td>
              <div className="match-tr-2-sp-d">
                <img className="match-tr-2-img2" src={mainPerksImg} alt=""></img>
                <img className="match-tr-2-img2" src={subPerkImg} alt=""></img>
              </div>
            </td>
            <td>
              <div
                className="match-tr-2-name"
                onClick={() => {
                  navigate(`/summoner/${summonerName}`);
                }}
              >
                {summonerName}
              </div>
            </td>
            <td>
              <div>
                <div>
                  {kills} / {deaths} / {assists} ({killPart || 0}%)
                </div>
                <div>{kda}</div>
              </div>
            </td>
            <td className="match-tr-2-damage">
              <div>
                <progress max={high} min={0} value={damageDealt}></progress>
                <div className="match-tr-2-damage-num">+ {damageDealt.toLocaleString()}</div>
              </div>
            </td>
            <td>
              <div>
                {normalWard} / {detectorWard}
              </div>
              <div>{destroyWard}</div>
            </td>
            <td>
              <div>{minionKill}</div>
              <div>{minionPerMinute} / 분</div>
            </td>
            <td>
              {itemImg.map((item, idx) => {
                return <img className="match-tr-2-img3" key={idx} src={item} alt=""></img>;
              })}
            </td>
          </tr>
        </Fragment>
      );
    });

    return (
      <tbody>
        <tr className="match-tr-1">
          <td colSpan={4}>{vod()}</td>
          <td>KDA</td>
          <td>피해량</td>
          <td>와드</td>
          <td>CS</td>
          <td>아이템</td>
        </tr>
        {data}
      </tbody>
    );
  };

  return (
    <div>
      <table className="match-detail-tb blue">{renderDetail(history.blueTeam)}</table>
      <div className="match-summary">
        <div className="match-summary-1">
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/baron-100.png`} alt=""></img>
            <div className="match-summary-1-1-num">{blueTeamStat.totalBaronKills}</div>
          </div>
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/dragon-100.png`} alt=""></img>
            <div className="match-summary-1-1-num">{blueTeamStat.totalDragonKills}</div>
          </div>
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/tower-100.png`} alt=""></img>
            <div className="match-summary-1-1-num">{blueTeamStat.totalTurretKills}</div>
          </div>
          <div className="match-summary-1-2">
            <img className="match-summary-1-2-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/kills.png`} alt=""></img>
            <div>
              {blueTeamStat.totalKill} / {blueTeamStat.totalDeath} / {blueTeamStat.totalAssist}
            </div>
          </div>
        </div>
        <div className="match-summary-1">
          <div className="match-summary-1-2">
            <img className="match-summary-1-2-img2" src={`${process.env.PUBLIC_URL}/images/ingame_assets/kills.png`} alt=""></img>
            <div>
              {redTeamstat.totalKill} / {redTeamstat.totalDeath} / {redTeamstat.totalAssist}
            </div>
          </div>
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/baron-200.png`} alt=""></img>
            <div className="match-summary-1-1-num">{redTeamstat.totalBaronKills}</div>
          </div>
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/dragon-200.png`} alt=""></img>
            <div className="match-summary-1-1-num">{redTeamstat.totalDragonKills}</div>
          </div>
          <div className="match-summary-1-1">
            <img className="match-summary-1-1-img1" src={`${process.env.PUBLIC_URL}/images/ingame_assets/tower-200.png`} alt=""></img>
            <div className="match-summary-1-1-num">{redTeamstat.totalTurretKills}</div>
          </div>
        </div>
      </div>
      <table className="match-detail-tb red">{renderDetail(history.redTeam)}</table>
    </div>
  );
};

export default MatchDetail;
