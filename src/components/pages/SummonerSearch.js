import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SummonerSearch.css";

const SearchPage = () => {
  const [summonerName, setSummonerName] = useState("");
  const navigate = useNavigate();

  const userData = (event) => {
    if (summonerName === "") {
      alert("소환사명을 입력하세요.");
      return;
    }
    localStorage.setItem("summoner_name", summonerName);
    navigate("/summoner");
  };

  const searchUserName = (event) => {
    setSummonerName(event.target.value);
  };

  return (
    <div>
      <input id="summoner-id-search" placeholder="info" value={summonerName} onChange={searchUserName}></input>
      <button onClick={userData}>검색</button>
      <h1>{summonerName}</h1>
    </div>
  );
};

export default SearchPage;
