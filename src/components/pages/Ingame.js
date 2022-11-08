import { React, useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Ingame.scss";
import Loading from "./Loading.js";
import { SummonerInfoContext } from "./SummonerInfo";

//진행중인 게임이 있어야 접근할 수 있는 페이지(게임중이 아닌데 들어온거면 버그)
const Ingame = () => {
  const params = useParams();
  const summonerName = params.summonerName;
  const [summonerInfo, setSummonerInfo] = useState(useContext(SummonerInfoContext));
  const [loading, setLoading] = useState(true);
  const [ingameInfo, setIngameInfo] = useState({});

  const test = () => {
    console.log(ingameInfo.data);
  };

  useEffect(() => {
    setLoading(true);

    axios
      .get("/api/spectatorV4", { params: { encryptedSummonerId: summonerInfo.id } })
      .then((response) => {
        setIngameInfo(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.response);
      });
  }, [summonerName]);

  return (
    <div>
      {loading === true ? (
        <Loading />
      ) : ingameInfo.success === false ? (
        <div>
          <h2>{summonerInfo.name}</h2>
          <h2>게임중이 아닙니다</h2>
        </div>
      ) : (
        <div>
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
          <h2>게임중입니다</h2>
        </div>
      )}
      <button onClick={test}>test</button>
    </div>
  );
};

export default Ingame;
