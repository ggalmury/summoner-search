import { Fragment, React, useEffect, useState, createContext } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading.js";
import util from "util/util.js";
import champ from "util/champion.json";

export const SummonerInfoContext = createContext({});

const ResultPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const summonerName = params.summonerName;
  const [summonerInfo, setSummonerInfo] = useState({});
  const [soloLeagueInfo, setSoloLeagueInfo] = useState({});
  const [flexLeagueInfo, setFlexLeagueInfo] = useState({});
  const [champMasteryInfo, setChampMasteryInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  // 소환사 정보 갱신
  const updateHistory = async (event) => {
    const updatedInfoRaw = await axios.post("/api/update", { encryptedSummonerId: summonerInfo.id });
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

  const goToMain = () => {
    navigate(`/summoner/${summonerName}`);
  };

  const goToHistory = () => {
    alert("test1");
    // navigate("/summoner/history");
  };

  const goToIngameInfo = () => {
    navigate(`/summoner/${summonerName}/ingame`);
  };

  const getTier = (tier, rank) => {
    return tier + " " + rank;
  };

  const getImage = (category, code) => {
    const ddragonVersion = util.ddragonVersion();
    return `http://ddragon.leagueoflegends.com/cdn/${ddragonVersion}/img/${category}/${code}.png`;
  };

  const getChampName = (num) => {
    if (champMasteryInfo.length <= num) {
      return null;
    }

    return util.champNumToName(champMasteryInfo[num].championId);
  };

  const getChampImage = (name) => {
    if (name === null) {
      return `${process.env.PUBLIC_URL}/images/question_mark.jpeg`;
    }

    return `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${name}_0.jpg`;
  };

  useEffect(() => {
    const fetchData = async () => {
      let infoResult;

      setSoloLeagueInfo({ tier: "UNRANKED" });
      setFlexLeagueInfo({ tier: "UNRANKED" });

      try {
        const infoResultRaw = await axios.post("/api/summonerV4", { summonerName });
        infoResult = infoResultRaw.data;

        if (infoResult.success === false) {
          alert("존재하지 않는 소환사입니다.");
          navigate(-1);
          return;
        }

        setSummonerInfo(infoResult.data[0]);
      } catch (err) {
        console.log(err);
        alert("소환사 정보 검색 오류");
        return;
      }

      axios
        .all([axios.post("/api/masteryV4", { encryptedSummonerId: infoResult.data[0].id }), axios.post("/api/leagueV4", { encryptedSummonerId: infoResult.data[0].id })])
        .then(
          axios.spread((champResultRaw, rankResultRaw) => {
            const rankResult = rankResultRaw.data;
            const champResult = champResultRaw.data;

            setChampMasteryInfo(champResult.data);

            rankResult.data.forEach((rank) => {
              switch (rank.queueType) {
                case "RANKED_FLEX_SR":
                  setFlexLeagueInfo(rank);
                  break;
                case "RANKED_SOLO_5x5":
                  setSoloLeagueInfo(rank);
                  break;
                default:
                  break;
              }
            });
            setLoading(false);
          })
        )
        .catch((err) => {
          console.log(err);
          alert("소환사 정보 검색 오류");
        });
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
            <div id="summoner">
              <div id="summoner-info">
                <div className="summoner-detail">
                  <img id="profile-icon" src={getImage("profileicon", summonerInfo.profileIconId)} alt="profile"></img>
                  <div>{summonerInfo.name}</div>
                  <div>Level {summonerInfo.summonerLevel}</div>
                </div>
                <div className="summoner-detail">
                  <div>솔로랭크</div>
                  <img className="rank-emblem" src={util.rankEmblem1(soloLeagueInfo.tier)} alt="rank emblem"></img>
                  {soloLeagueInfo.tier === "UNRANKED" ? (
                    <div className="rank-emblem-unranked">{soloLeagueInfo.tier}</div>
                  ) : (
                    <Fragment>
                      <div>{getTier(soloLeagueInfo.tier, soloLeagueInfo.rank)}</div>
                      <div>{soloLeagueInfo.leaguePoints}LP</div>
                      <div className="outcome">
                        <div className="outcome-win">{soloLeagueInfo.wins}W </div>
                        <div className="outcome-lose">{soloLeagueInfo.losses}L</div>
                      </div>
                      <div>승률 {util.winRate(soloLeagueInfo.wins, soloLeagueInfo.losses)}%</div>
                    </Fragment>
                  )}
                </div>
                <div className="summoner-detail">
                  <div>자유랭크</div>
                  <img className="rank-emblem" src={util.rankEmblem1(flexLeagueInfo.tier)} alt="rank emblem"></img>
                  {flexLeagueInfo.tier === "UNRANKED" ? (
                    <div className="rank-emblem-unranked">{flexLeagueInfo.tier}</div>
                  ) : (
                    <Fragment>
                      <div>{getTier(flexLeagueInfo.tier, flexLeagueInfo.rank)}</div>
                      <div>{flexLeagueInfo.leaguePoints}LP</div>
                      <div className="outcome">
                        <div className="outcome-win">{flexLeagueInfo.wins}W</div>
                        <div className="outcome-lose">{flexLeagueInfo.losses}L</div>
                      </div>
                      <div>승률 {util.winRate(flexLeagueInfo.wins, flexLeagueInfo.losses)}%</div>
                    </Fragment>
                  )}
                </div>
              </div>
              <div id="summoner-champ">
                <div className="champ-mastery">
                  <img className="champ-mastery-img1" src={getChampImage(getChampName(1))} alt="champion"></img>
                  <div className="champ-mastery-info">
                    {champMasteryInfo[1] !== undefined ? (
                      <Fragment>
                        <div>{getChampName(1)}</div>
                        <div>{champMasteryInfo[1].championLevel} LV</div>
                        <div>{champMasteryInfo[1].championPoints} P</div>
                      </Fragment>
                    ) : (
                      <div>no result</div>
                    )}
                  </div>
                </div>
                <div className="champ-mastery">
                  <img className="champ-mastery-img2" src={getChampImage(getChampName(0))} alt="champion"></img>
                  <div className="champ-mastery-info">
                    {champMasteryInfo[0] !== undefined ? (
                      <Fragment>
                        <div>{getChampName(0)}</div>
                        <div>{champMasteryInfo[0].championLevel} LV</div>
                        <div>{champMasteryInfo[0].championPoints} P</div>
                      </Fragment>
                    ) : (
                      <div>no result</div>
                    )}
                  </div>
                </div>
                <div className="champ-mastery">
                  <img className="champ-mastery-img1" src={getChampImage(getChampName(2))} alt="champion"></img>
                  <div className="champ-mastery-info">
                    {champMasteryInfo[2] !== undefined ? (
                      <Fragment>
                        <div>{getChampName(2)}</div>
                        <div>{champMasteryInfo[2].championLevel} LV</div>
                        <div>{champMasteryInfo[2].championPoints} P</div>
                      </Fragment>
                    ) : (
                      <div>no result</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Fragment>
        <SummonerInfoContext.Provider value={summonerInfo}>
          <Outlet />
        </SummonerInfoContext.Provider>
      </div>
    </Fragment>
  );
};

export default ResultPage;
