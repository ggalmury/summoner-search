import { React, useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading.js";
import "./SummonerInfo.css";

const ResultPage = () => {
  const navigate = useNavigate();

  const [summonerName, setSummonerName] = useState(localStorage.getItem("summoner_name"));
  const [loading, setLoading] = useState();
  const [isMain, setIsMain] = useState(true);

  useEffect(() => {
    // TODO: LeagueV4 API를 이용해 유저 티어정보 얻기
    console.log(summonerName);
  });

  // 종합으로 이동
  const goToHistory = (event) => {
    navigate("/summoner/history");
    setIsMain(true);
  };

  // 인게임 정보로 이동
  const goToIngameInfo = (event) => {
    navigate("/summoner/ingame");
    setIsMain(false);
  };

  return (
    <div>
      {loading === true ? (
        <Loading />
      ) : (
        <div>
          <button onClick={goToHistory}>전적 보기</button>
          <button onClick={goToIngameInfo}>인게임</button>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
