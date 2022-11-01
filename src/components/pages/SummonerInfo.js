import { Fragment, React, useEffect, useState } from "react";
import axios from "axios";
import Nav from "../molecules/Nav.js";
import Loading from "./Loading.js";
import "./SummonerInfo.css";

const ResultPage = () => {
  const [summonerName, setSummonerName] = useState(localStorage.getItem("summoner_name"));
  const [summonerInfo, setSummonerInfo] = useState({});
  const [soloLeagueInfo, setSoloLeagueInfo] = useState({});
  const [flexLeagueInfo, setFlexLeagueInfo] = useState({});
  const [loading, setLoading] = useState();

  useEffect(() => {
    // TODO: await으로 가독성 살리기
    setLoading(true);

    // 소환사 정보 검색(이름, 레벨, 암호화된 id, etc..)
    axios
      .get("/api/summonerV4", { params: { summonerName } })
      .then((response) => {
        const infoResult = response.data;
        if (infoResult.success === false) {
          alert("존재하지 않는 소환사입니다.");
          return;
        }
        // mysql2 => 배열 반환
        setSummonerInfo(infoResult.data[0]);

        // 소환사 리그 검색(자유랭크, 솔로랭크)
        axios
          .get("/api/leagueV4", { params: { summonerName } })
          .then((response) => {
            const rankResult = response.data.data;
            rankResult.map((rank) => {
              // 큐 타입에 따라 분류(솔로랭크, 자유랭크)
              switch (rank.queueType) {
                case "RANKED_FLEX_SR":
                  setFlexLeagueInfo(rank);
                  break;
                case "RANKED_SOLO_5x5":
                  setSoloLeagueInfo(rank);
                  break;
              }
            });
            console.log(rankResult);
            // 로딩 종료 => 소환사 정보, 리그 정보 렌더링
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            alert("소환사 리그 검색 오류");
          });
      })
      .catch((err) => {
        console.log(err);
        alert("소환사 정보 검색 오류");
      });
  }, [summonerName]);

  const getTier = (tier, rank) => {
    return tier + " " + rank;
  };

  const getWinRate = (win, lose) => {
    return Math.round((win / (win + lose)) * 100);
  };

  const getImage = (category, code) => {
    const ddragonVersion = "12.20.1";
    return `http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/${category}/${code}.png`;
  };

  return (
    <div id="content-box">
      <div id="summoner-info">
        {loading === true ? (
          <Loading />
        ) : (
          <Fragment>
            <div className="summoner-league-info">
              <img id="profile-icon" src={getImage(`profileicon`, summonerInfo.profileIconId)}></img>
              <h1>소환사 이름 : {summonerInfo.name}</h1>
              <h1>소환사 레벨 : {summonerInfo.summonerLevel}</h1>
            </div>
            <div className="summoner-league-info">
              <h1>솔로랭크</h1>
              <h2>티어 : {getTier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</h2>
              <h2>{soloLeagueInfo.leaguePoints}LP</h2>
              <h2>
                {soloLeagueInfo.wins}승 {soloLeagueInfo.losses}패
              </h2>
              <h2>승률 {getWinRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</h2>
            </div>
            <div className="summoner-league-info">
              <h1>자유랭크</h1>
              <h2>티어 : {getTier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</h2>
              <h2>{flexLeagueInfo.leaguePoints}LP</h2>
              <h2>
                {flexLeagueInfo.wins}승 {flexLeagueInfo.losses}패
              </h2>
              <h2>승률 {getWinRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</h2>
            </div>
          </Fragment>
        )}
      </div>
      <div>
        <Nav />
      </div>
    </div>
  );
};

export default ResultPage;
