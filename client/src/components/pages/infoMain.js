import { Fragment, React, useContext, useState } from "react";
import axios from "axios";
import { sumInfoContext } from "context/sumInfoContext";
import { hisInfoContext } from "context/hisInfoContext.jsx";
import MatchHistoy from "./matchHistoy.js";
import PieChart from "../charts/PieChart.js";
import DoughnutChart from "../charts/Doughnut.js";
import calcUtil from "util/calcUtil.js";
import util from "util/util.js";
import { ClipLoader } from "react-spinners";

const InfoMain = () => {
  const [rankCount, setRankCount] = useState(0);
  const { summonerInfo } = useContext(sumInfoContext);
  const { historyInfo, setHistoryInfo, convertHistoryInfo } = useContext(hisInfoContext);
  const [loading, setLoading] = useState(false);

  const addHistory = (arr) => {
    const data = arr.map((his, idx) => {
      return <MatchHistoy key={idx} history={his} />;
    });

    return data;
  };

  const loadingHistory = () => {
    setLoading(true);

    axios
      .post(`${util.env()}/api/matchV5`, { puuid: summonerInfo.puuid, start: 0, end: 100, count: rankCount + 10 })
      .then((res) => {
        const data = res.data.data;
        calcUtil.asc(data);
        setHistoryInfo(historyInfo.concat(convertHistoryInfo(data, summonerInfo.id)));
        setRankCount(rankCount + 10);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const myDataStatistics = () => {
    let solo = {
      name: "솔로 랭크",
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      gameCount: 0,
    };

    let flex = {
      name: "자유 랭크",
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      gameCount: 0,
    };

    let normal = {
      name: "일반",
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      gameCount: 0,
    };

    let aram = {
      name: "무작위 총력전",
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      gameCount: 0,
    };

    let total = {
      kills: 0,
      deaths: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      gameCount: 0,
    };

    const gameTypeArr = [solo, flex, normal, aram];

    historyInfo.forEach((history) => {
      const myData = history.myData;
      const gameData = history.gameData;

      const statGroup = (type) => {
        type.kills += myData.kills;
        type.deaths += myData.deaths;
        type.assists += myData.assists;
        type.gameCount++;

        if (myData.win) {
          type.wins++;
        } else {
          type.losses++;
        }
      };

      switch (gameData.queueId) {
        case 420:
          statGroup(solo);
          break;
        case 430:
          statGroup(normal);
          break;
        case 440:
          statGroup(flex);
          break;
        case 450:
          statGroup(aram);
          break;
        default:
          return undefined;
      }

      statGroup(total);
    });

    const expData = (type) => {
      const data = {
        labels: [],
        datasets: [
          {
            labels: ["패배", "승리"],
            data: [type.losses, type.wins],
            backgroundColor: ["rgb(222, 110, 123)", "rgba(118, 179, 224)"],
            borderWidth: 1,
          },
        ],
      };

      return data;
    };

    return (
      <Fragment>
        <div className="chart-box-1">
          <div className="chart-box-1-1">최근 {total.gameCount}게임 승률</div>
          <div className="chart-box-1-2">
            {total.gameCount !== 0 ? (
              <Fragment>
                <div>
                  <PieChart width={150} chartData={expData(total)} />
                </div>
                <div className="chart-box-1-2-vod">
                  <div>{total.gameCount}전</div>&nbsp;
                  <div className="chart-box-1-2-vod-v">{total.wins}승</div>&nbsp;
                  <div className="chart-box-1-2-vod-d">{total.losses}패</div>
                </div>
              </Fragment>
            ) : (
              <div className="chart-box-1-2-empty">결과 없음</div>
            )}
          </div>
        </div>
        <div className="chart-box-2">
          <div className="chart-box-2-1">KDA</div>
          <div className="chart-box-2-2">
            {total.kills} / {total.deaths} / {total.assists}
          </div>
          <div className="chart-box-2-3">평점 : {calcUtil.kdaRate(total.kills, total.deaths, total.deaths)}</div>
        </div>
        <div className="chart-box-3">
          {gameTypeArr.map((game, idx) => {
            return (
              <div className="chart-group" key={idx}>
                <div className="chart-box-3-1">{game.name}</div>
                <div className="chart-box-3-2">
                  {game.gameCount !== 0 ? (
                    <Fragment>
                      <div>
                        <DoughnutChart width={100} chartData={expData(game)} />
                      </div>
                      <div className="chart-box-3-2-vod">
                        <div>{game.gameCount}전</div>&nbsp;
                        <div className="chart-box-1-2-vod-v"> {game.wins}승</div>&nbsp;
                        <div className="chart-box-1-2-vod-d">{game.losses}패</div>
                      </div>
                    </Fragment>
                  ) : (
                    <Fragment>
                      <div className="chart-box-1-2-empty">
                        <img width={60} src="../images/sad_poro.png" alt="정보 없음"></img>
                      </div>
                      <div className="chart-box-3-2-vod">전적이 없어요</div>
                    </Fragment>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  };

  return (
    <div id="match">
      <div id="match-statistic">{myDataStatistics()}</div>
      <div id="match-history">{addHistory(historyInfo)}</div>
      <div id="match-add">
        {loading ? (
          <ClipLoader />
        ) : (
          <button id="btn-match-add" onClick={loadingHistory}>
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoMain;
