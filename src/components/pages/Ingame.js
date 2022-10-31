import { React, useEffect, useState } from "react";
import axios from "axios";
import "./Ingame.css";
import Loading from "./Loading.js";

//진행중인 게임이 있어야 접근할 수 있는 페이지(게임중이 아닌데 들어온거면 버그)
const Ingame = () => {
  const [encryptedSummonerId, setEncryptedSummonerId] = useState(JSON.parse(localStorage.getItem("summoner_info")).id);
  const [loading, setLoading] = useState();
  const [ingameInfo, setIngameInfo] = useState({});

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/spectatorV4", { params: { encryptedSummonerId } })
      .then((response) => {
        setIngameInfo(response);
        console.log(response);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.response);
      });
  }, []);

  return (
    <div>
      {loading === true ? (
        <Loading />
      ) : ingameInfo.data?.gameId === undefined ? (
        <div>
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
        </div>
      )}
    </div>
  );
};

export default Ingame;
