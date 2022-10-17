import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SummonerSearch.css";

const SearchPage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const userData = (event) => {
    axios
      .get("/api/summonerV4", { params: { userName } })
      .then((response) => {
        // summonerProfileResult(=response.data) include summoner's id, name, puuid, level, etc..
        let summonerProfileResult = response.data;
        console.log(summonerProfileResult);
        navigate("/result", { state: { profile: summonerProfileResult } });
      })
      .catch((err) => {
        if (userName === "") {
          alert("Please input username");
        } else {
          alert(err);
        }
      });
  };

  const searchUserName = (event) => {
    setUserName(event.target.value);
  };

  return (
    <div>
      <input id="summoner-id-search" placeholder="info" value={userName} onChange={searchUserName}></input>
      <button onClick={userData}>검색</button>
      <h1>{userName}</h1>
    </div>
  );
};

export default SearchPage;
