import "./Header.scss";
import { useNavigate } from "react-router-dom";
import { Fragment, React, useEffect, useState } from "react";

const Header = (props) => {
  const [summonerName, setSummonerName] = useState("");
  const navigate = useNavigate();

  const goToMain = (event) => {
    navigate("/");
  };

  const userData = (event) => {
    if (summonerName === "") {
      alert("소환사명을 입력하세요.");
      return;
    }
    navigate("/summoner/" + summonerName);
  };

  const searchUserName = (event) => {
    setSummonerName(event.target.value);
  };

  return (
    <div id="header">
      <h1 id="web-title" onClick={goToMain}>
        API TEST
      </h1>
      <input id="summoner-id-search" placeholder="info" value={summonerName} onChange={searchUserName}></input>
      <button onClick={userData}>검색</button>
    </div>
  );
};

export default Header;
