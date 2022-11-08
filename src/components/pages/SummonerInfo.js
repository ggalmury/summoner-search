import { Fragment, React, useEffect, useState, createContext } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading.js";
import "./SummonerInfo.scss";

export const SummonerInfoContext = createContext({});

const ResultPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const summonerName = params.summonerName;
  const [summonerInfo, setSummonerInfo] = useState({});
  const [soloLeagueInfo, setSoloLeagueInfo] = useState({});
  const [flexLeagueInfo, setFlexLeagueInfo] = useState({});
  const [loading, setLoading] = useState();

  // 소환사 정보 갱신
  const updateHistory = async (event) => {
    const updatedInfoRaw = await axios.get("/api/update", { params: { encryptedSummonerId: summonerInfo.id } });
    const updatedInfo = updatedInfoRaw.data;

    if (updatedInfo.success === undefined) {
      alert("소환사 정보 갱신 실패");
      return;
    }

    setSummonerInfo(updatedInfo.data[0][0]);

    updatedInfo.data[1].forEach((rank) => {
      switch (rank.queueType) {
        case "RANKED_FLEX_SR":
          setFlexLeagueInfo(rank);
          break;
        case "RANKED_SOLO_5x5":
          setSoloLeagueInfo(rank);
          break;
      }
    });
  };

  // 종합으로 이동
  const goToHistory = (event) => {
    alert("test1");
    // navigate("/summoner/history");
  };

  // 인게임 정보로 이동
  const goToIngameInfo = (event) => {
    navigate(`/summoner/${summonerName}/ingame`);
  };

  const getTier = (tier, rank) => {
    return tier + " " + rank;
  };

  const getRankEmblem = (tier) => {
    return `${process.env.PUBLIC_URL}/ranked-emblems/Emblem_${tier}.png`;
  };

  const getWinRate = (win, lose) => {
    return Math.round((win / (win + lose)) * 100);
  };

  const getImage = (category, code) => {
    const ddragonVersion = "12.20.1";
    return `http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/${category}/${code}.png`;
  };

  useEffect(() => {
    const fetchData = async () => {
      // 소환사 정보 요청(이름, 레벨, 암호화된 id, etc..)
      try {
        const infoResultRaw = await axios.get("/api/summonerV4", { params: { summonerName } });
        const infoResult = infoResultRaw.data;
        console.log(infoResult);
        if (infoResult.success === false) {
          alert("존재하지 않는 소환사입니다.");
          navigate(-1);
          return;
        }
        // mysql2 => 배열 반환
        setSummonerInfo(infoResult.data[0]);
      } catch (err) {
        console.log(err);
        alert("소환사 정보 검색 오류");
        return;
      }

      // 소환사 리그 정보 요청
      try {
        const rankResultRaw = await axios.get("/api/leagueV4", { params: { summonerName } });
        const rankResult = rankResultRaw.data;
        console.log(rankResult);

        // 랭크 정보를 unranked로 초기화 => 랭크 기록이 없을 경우 Unranked로 표시
        setSoloLeagueInfo({ tier: "Unranked" });
        setFlexLeagueInfo({ tier: "Unranked" });

        rankResult.data.forEach((rank) => {
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
      } catch (err) {
        console.log(err);
        alert("소환사 랭크 정보 검색 오류");
      }
      setLoading(false);
    };
    setLoading(true);
    fetchData();
  }, [summonerName]);

  return (
    <div id="content-box">
      <div id="nav">
        <button onClick={updateHistory}>소환사 정보 갱신</button>
        <button onClick={goToHistory}>전적 보기</button>
        <button onClick={goToIngameInfo}>인게임</button>
      </div>
      <div id="summoner-info">
        {loading === true ? (
          <Loading />
        ) : (
          <Fragment>
            <div className="summoner-league-info">
              <img id="profile-icon" src={getImage("profileicon", summonerInfo.profileIconId)} alt="profile"></img>
              <h1>소환사 이름 : {summonerInfo.name}</h1>
              <h1>소환사 레벨 : {summonerInfo.summonerLevel}</h1>
            </div>
            <div className="summoner-league-info">
              <h1>솔로랭크</h1>
              {soloLeagueInfo.tier !== "Unranked" ? (
                <Fragment>
                  <img id="rank-emblem" src={getRankEmblem(soloLeagueInfo.tier)} alt="rank emblem"></img>
                  <h2>티어 : {getTier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</h2>
                  <h2>{soloLeagueInfo.leaguePoints}LP</h2>
                  <h2>
                    {soloLeagueInfo.wins}승 {soloLeagueInfo.losses}패
                  </h2>
                  <h2>승률 {getWinRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</h2>
                </Fragment>
              ) : (
                <h2>{soloLeagueInfo.tier}</h2>
              )}
            </div>
            <div className="summoner-league-info">
              <h1>자유랭크</h1>
              {flexLeagueInfo.tier !== "Unranked" ? (
                <Fragment>
                  <img id="rank-emblem" src={getRankEmblem(flexLeagueInfo.tier)} alt="rank emblem"></img>
                  <h2>티어 : {getTier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</h2>
                  <h2>{flexLeagueInfo.leaguePoints}LP</h2>
                  <h2>
                    {flexLeagueInfo.wins}승 {flexLeagueInfo.losses}패
                  </h2>
                  <h2>승률 {getWinRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</h2>
                </Fragment>
              ) : (
                <h2>{flexLeagueInfo.tier}</h2>
              )}
            </div>
          </Fragment>
        )}
      </div>
      <button
        onClick={() => {
          console.log(soloLeagueInfo);
          console.log(flexLeagueInfo);
          console.log(summonerInfo);
        }}
      >
        test
      </button>
      <SummonerInfoContext.Provider value={summonerInfo}>
        <Outlet />
      </SummonerInfoContext.Provider>
    </div>
  );
};

export default ResultPage;
