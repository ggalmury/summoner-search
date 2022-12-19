import { Fragment, React, useContext, useState } from "react";
import MatchHistoy from "./matchHistoy.js";
import axios from "axios";
import calcUtil from "client/util/calcUtil.js";
import { sumInfoContext } from "client/context/sumInfoContext";
import { hisInfoContext } from "client/context/hisInfoContext.jsx";
import PieChart from "../charts/PieChart.js";

const InfoMain = () => {
  const [rankCount, setRankCount] = useState(0);
  const { summonerInfo } = useContext(sumInfoContext);
  const { historyInfo, setHistoryInfo, convertHistoryInfo } = useContext(hisInfoContext);

  const addHistory = (arr) => {
    const data = arr.map((his, idx) => {
      return <MatchHistoy key={idx} history={his}></MatchHistoy>;
    });

    return data;
  };

  const myDataStatistics = () => {
    let kills = 0;
    let deaths = 0;
    let assists = 0;

    let wins = 0;
    let losses = 0;
    let gameCount = 0;

    historyInfo.forEach((history) => {
      const myData = history.myData;

      kills += myData.kills;
      deaths += myData.deaths;
      assists += myData.assists;

      if (myData.win) {
        wins++;
      } else {
        losses++;
      }
    });

    gameCount = wins + losses;

    const expData = {
      labels: ["승리", "패배"],
      datasets: [
        {
          labels: ["승리", "패배"],
          data: [wins, losses],
          backgroundColor: ["rgba(98, 181, 229, 1)", "rgba(238, 102, 121, 1)"],
          borderWidth: 8,
        },
      ],
    };

    return (
      <Fragment>
        <div className="chart-box-1">
          <div className="chart-box-1-1">최근 {gameCount}게임 승률</div>
          <div className="chart-box-1-2">
            <div>
              <div>{wins} 승</div>
              <div>{losses} 패</div>
            </div>
            <div>
              <PieChart chartData={expData} />
            </div>
          </div>
        </div>
      </Fragment>
    );
  };

  return (
    <div id="match">
      <div id="match-statistic">{myDataStatistics()}</div>
      <div id="match-history">{addHistory(historyInfo)}</div>
      <div id="match-add">
        <button
          id="btn-match-add"
          onClick={(e) => {
            e.preventDefault();

            axios
              .post("/api/matchV5", { puuid: summonerInfo.puuid, start: 0, end: 100, count: rankCount + 10 })
              .then((res) => {
                const data = res.data.data;
                calcUtil.asc(data);
                setHistoryInfo(historyInfo.concat(convertHistoryInfo(data, summonerInfo.id)));
                setRankCount(rankCount + 10);
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default InfoMain;
