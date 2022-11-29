import { React, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import "./Ingame.scss";
import Loading from "./Loading.js";
import { SummonerInfoContext } from "./SummonerInfo";

//진행중인 게임이 있어야 접근할 수 있는 페이지(게임중이 아닌데 들어온거면 버그)
const Ingame = () => {
  const summonerInfo = useContext(SummonerInfoContext);
  const [ingameInfo, setIngameInfo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("render ingame");

    const fetchData = async () => {
      try {
        const ingameResultRaw = await axios.get("/api/spectatorV4", { params: { encryptedSummonerId: summonerInfo.id } });
        const ingameResult = ingameResultRaw.data;
        console.log(ingameResult);
        setIngameInfo(ingameResult);
      } catch (err) {
        console.log(err);
      }

      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, [summonerInfo]);

  return (
    <Fragment>
      {loading === true ? (
        <Loading />
      ) : ingameInfo.success === true ? (
        <div id="ingame-box">
          <h2>게임중입니다</h2>
          <ul id="banned-champions">
            {ingameInfo.data.bannedChampions.map((value, idx) => {
              return <li key={idx}>{value.championId}</li>;
            })}
          </ul>
          <ul id="ingame-player">
            {ingameInfo.data.participants.map((value, idx) => {
              return (
                <li key={idx}>
                  <h2>{value.summonerName}</h2>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>
          <h2>{summonerInfo.name}</h2>
          <h2>{summonerInfo.id}</h2>
          <h2>게임중이 아닙니다</h2>
        </div>
      )}
    </Fragment>
  );
};

export default Ingame;
