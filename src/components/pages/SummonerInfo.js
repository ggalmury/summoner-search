import { Fragment, React, useEffect, useState, createContext, Suspense } from "react";
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
  const [loading, setLoading] = useState(true);

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

    alert("갱신되었습니다");
  };

  // 종합으로 이동
  const goToMain = () => {
    navigate(`/summoner/${summonerName}`);
  };

  const goToHistory = () => {
    alert("test1");
    console.log(summonerInfo);
    // navigate("/summoner/history");
  };

  // 인게임 정보로 이동
  const goToIngameInfo = () => {
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
    console.log("render info");
    const fetchData = async () => {
      let infoResult;

      setSoloLeagueInfo({ tier: "Unranked" });
      setFlexLeagueInfo({ tier: "Unranked" });

      // 소환사 정보 요청(이름, 레벨, 암호화된 id, etc..)
      try {
        const infoResultRaw = await axios.get("/api/summonerV4", { params: { summonerName } });
        infoResult = infoResultRaw.data;

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
        const rankResultRaw = await axios.get("/api/leagueV4", { params: { encryptedSummonerId: infoResult.data[0].id } });
        const rankResult = rankResultRaw.data;

        console.log(rankResult);

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
    <Fragment>
      <div id="nav">
        <button onClick={updateHistory}>소환사 정보 갱신</button>
        <button onClick={goToMain}>종합</button>
        <button onClick={goToHistory}>전적 보기</button>
        <button onClick={goToIngameInfo}>인게임</button>
      </div>
      <div id="content-box">
        <div id="summoner-info">
          {loading === true ? (
            <Loading />
          ) : (
            <Fragment>
              <div className="summoner-league-info">
                <img id="profile-icon" src={getImage("profileicon", summonerInfo.profileIconId)} alt="profile"></img>
                <h1>{summonerInfo.name}</h1>
                <h1>Level {summonerInfo.summonerLevel}</h1>
              </div>
              <div className="summoner-league-info">
                <h1>솔로랭크</h1>
                {soloLeagueInfo.tier === "Unranked" ? (
                  <h2>{soloLeagueInfo.tier}</h2>
                ) : (
                  <Fragment>
                    <img id="rank-emblem" src={getRankEmblem(soloLeagueInfo.tier)} alt="rank emblem"></img>
                    <h1>{getTier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</h1>
                    <h2>{soloLeagueInfo.leaguePoints}LP</h2>
                    <h2>
                      {soloLeagueInfo.wins}W {soloLeagueInfo.losses}L
                    </h2>
                    <h2>승률 {getWinRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</h2>
                  </Fragment>
                )}
              </div>
              <div className="summoner-league-info">
                <h1>자유랭크</h1>
                {flexLeagueInfo.tier === "Unranked" ? (
                  <h2>{flexLeagueInfo.tier}</h2>
                ) : (
                  <Fragment>
                    <img id="rank-emblem" src={getRankEmblem(flexLeagueInfo.tier)} alt="rank emblem"></img>
                    <h1>{getTier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</h1>
                    <h2>{flexLeagueInfo.leaguePoints}LP</h2>
                    <h2>
                      {flexLeagueInfo.wins}W {flexLeagueInfo.losses}L
                    </h2>
                    <h2>승률 {getWinRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</h2>
                  </Fragment>
                )}
              </div>
            </Fragment>
          )}
        </div>
        <div>
          <SummonerInfoContext.Provider value={summonerInfo}>
            <Outlet />
          </SummonerInfoContext.Provider>
        </div>
      </div>
    </Fragment>
  );
};

export default ResultPage;
