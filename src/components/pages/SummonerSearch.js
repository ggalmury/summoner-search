import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SummonerSearch.css";

const SearchPage = () => {
  const [summonerName, setSummonerName] = useState("");
  const navigate = useNavigate();

  const userData = (event) => {
    axios
      .get("/api/summonerV4", { params: { summonerName } })
      .then((response) => {
        // summonerProfileResult(=response.data) include summoner's id, name, puuid, level, etc..
        let summonerInfo = response.data[0];
        localStorage.setItem("summoner_name", summonerInfo.name);
        console.log(summonerInfo);
        navigate("/summoner");
      })
      .catch((err) => {
        if (summonerName === "") {
          alert("Please input username");
        } else {
          alert(err);
        }
      });
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
