import { useNavigate } from "react-router-dom";
import { Fragment, React, useEffect, useState } from "react";

const Header = () => {
  const [summonerName, setSummonerName] = useState("");
  const navigate = useNavigate();

  const goToMain = (event) => {
    setSummonerName("");
    navigate("/");
  };

  const userData = (event) => {
    if (summonerName === "") {
      alert("소환사명을 입력하세요.");
      return;
    }

    setSummonerName("");
    navigate("/summoner/" + summonerName);
  };

  const searchUserName = (event) => {
    setSummonerName(event.target.value);
  };

  return (
    <div id="header">
      <div id="web-title" onClick={goToMain}>
        API TEST
      </div>
      <input id="summoner-id-search" placeholder="info" value={summonerName} onChange={searchUserName}></input>
      <button className="btn-search" onClick={userData}>
        검색
      </button>
    </div>
  );
};

export default Header;
