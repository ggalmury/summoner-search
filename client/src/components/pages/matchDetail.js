import { React } from "react";
import { useNavigate } from "react-router-dom";
import resourceUtil from "../../util/resourceUtil.js";
import calcUtil from "../../util/calcUtil.js";

const MatchDetail = (props) => {
  const navigate = useNavigate();
  const history = props.history;
  console.log(history);

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
        <tr className="match-tr-2" key={idx}>
          <td>
            <div>
              <img className="match-tr-2-img1" src={champImg}></img>
            </div>
          </td>
          <td className="match-tr-2-sp">
            <div className="match-tr-2-sp-d">
              <img className="match-tr-2-img2" src={spellImg(participant.summoner1Id)}></img>
              <img className="match-tr-2-img2" src={spellImg(participant.summoner2Id)}></img>
            </div>
          </td>
          <td>
            <div className="match-tr-2-sp-d">
              <img className="match-tr-2-img2" src={mainPerksImg}></img>
              <img className="match-tr-2-img2" src={subPerkImg}></img>
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
          <td>
            <div>+ {damageDealt}</div>
            <div>- {damageTaken}</div>
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
              return <img className="match-tr-2-img3" src={item} key={idx}></img>;
            })}
          </td>
        </tr>
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
      <table className="match-detail-tb red">{renderDetail(history.redTeam)}</table>
    </div>
  );
};

export default MatchDetail;
