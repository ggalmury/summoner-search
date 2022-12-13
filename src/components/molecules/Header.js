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
        WARD.GG
      </div>
      <div id="search-box">
        <div>
          <input id="summoner-id-search" placeholder="소환사명 입력" value={summonerName} onChange={searchUserName}></input>
        </div>
        <div>
          <button className="btn-search" onClick={userData}>
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
