import { Fragment, React, useEffect, useState, createContext } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading.js";

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
    const ddragonVersion = "12.22.1";
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
        <button className="btn-category" onClick={updateHistory}>
          소환사 정보 갱신
        </button>
        <button className="btn-category" onClick={goToMain}>
          종합
        </button>
        <button className="btn-category" onClick={goToHistory}>
          전적 보기
        </button>
        <button className="btn-category" onClick={goToIngameInfo}>
          인게임
        </button>
      </div>
      <div id="content-box">
        <Fragment>
          {loading === true ? (
            <Loading />
          ) : (
            <div id="summoner-info">
              <div className="summoner-detail">
                <img id="profile-icon" src={getImage("profileicon", summonerInfo.profileIconId)} alt="profile"></img>
                <div>{summonerInfo.name}</div>
                <div>Level {summonerInfo.summonerLevel}</div>
              </div>
              <div className="summoner-detail">
                <div>솔로랭크</div>
                {soloLeagueInfo.tier === "Unranked" ? (
                  <div>{soloLeagueInfo.tier}</div>
                ) : (
                  <Fragment>
                    <img id="rank-emblem" src={getRankEmblem(soloLeagueInfo.tier)} alt="rank emblem"></img>
                    <div>{getTier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</div>
                    <div>{soloLeagueInfo.leaguePoints}LP</div>
                    <div className="outcome">
                      <div className="outcome-win">{soloLeagueInfo.wins}W </div>
                      <div className="outcome-lose">{soloLeagueInfo.losses}L</div>
                    </div>
                    <div>승률 {getWinRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</div>
                  </Fragment>
                )}
              </div>
              <div className="summoner-detail">
                <div>자유랭크</div>
                {flexLeagueInfo.tier === "Unranked" ? (
                  <div>{flexLeagueInfo.tier}</div>
                ) : (
                  <Fragment>
                    <img id="rank-emblem" src={getRankEmblem(flexLeagueInfo.tier)} alt="rank emblem"></img>
                    <div>{getTier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</div>
                    <div>{flexLeagueInfo.leaguePoints}LP</div>
                    <div className="outcome">
                      <div className="outcome-win">{flexLeagueInfo.wins}W</div>
                      <div className="outcome-lose">{flexLeagueInfo.losses}L</div>
                    </div>
                    <div>승률 {getWinRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</div>
                  </Fragment>
                )}
              </div>
            </div>
          )}
        </Fragment>
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
