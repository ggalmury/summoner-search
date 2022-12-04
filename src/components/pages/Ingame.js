import { React, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import { SummonerInfoContext } from "./SummonerInfo";
import util from "util/util.js";

const Ingame = () => {
  const summonerInfo = useContext(SummonerInfoContext);
  const [ingameInfo, setIngameInfo] = useState({});
  const [summRankInfo, setSummRankInfo] = useState([]);
  const [bannedChampImg, setBannedChampImg] = useState([]);
  const [loading, setLoading] = useState(true);

  const getChampSquareImg = (id) => {
    const ddversion = util.ddragonVersion();
    const champName = util.champNumToName(id);

    if (id === undefined || id === -1) {
      return `${process.env.PUBLIC_URL}/images/random-champion.png`;
    }

    return util.champSquareImg(champName, ddversion);
  };

  const bannedChampList = (list) => {
    let champArr = [];

    if (list !== undefined) {
      for (let i = 0; i < 10; i++) {
        const id = list[i].championId;
        champArr.push(getChampSquareImg(id));
      }
    } else {
      for (let i = 0; i < 10; i++) {
        champArr.push(getChampSquareImg(-1));
      }
    }

    setBannedChampImg(champArr);
  };

  const summonerRank = (list) => {
    const id = [];

    const promise = new Promise((resolve, reject) => {
      list.map(async (participant) => {
        try {
          const rankData = await axios.post("/api/leagueV4", { encryptedSummonerId: participant.summonerId });
          id.push(rankData);
        } catch (err) {
          console.log(err);
        }
        resolve(id);
      });
    });

    promise.then((data) => {
      console.log(data);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      let ingameResult = {};

      try {
        const ingameResultRaw = await axios.post("/api/spectatorV4", { encryptedSummonerId: summonerInfo.id });
        ingameResult = ingameResultRaw.data;

        setIngameInfo(ingameResult);

        console.log(ingameResult);
      } catch (err) {
        console.log(err);
      }

      if (ingameResult.success === true) {
        summonerRank(ingameResult.data.participants);
        bannedChampList(ingameResult.data.bannedChampions);
      }

      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, [summonerInfo]);

  return (
    <Fragment>
      {loading === true ? (
        <Loading />
      ) : (
        <div id="ingame-box">
          {ingameInfo.success === true ? (
            <Fragment>
              <div className="ingame-status">게임중입니다</div>
              <div id="ingame-info">
                <div id="first-team">
                  <table className="ingame-tb">
                    <thead>
                      <tr>
                        {bannedChampImg.map((value, idx) => {
                          if (idx >= 5) {
                            return;
                          }

                          return (
                            <th className="champ-square" key={idx}>
                              <img className="champ-square-img" src={value}></img>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th className="ingame-tb-name" scope="col">
                          이름
                        </th>
                        <th className="ingame-tb-tier" scope="col">
                          티어
                        </th>
                      </tr>
                      {/* {ingameInfo.map((value, idx) => {
                        return (
                          <tr key={idx}>
                            <th>{value.name}</th>
                            <th>{value.rank.tier}</th>
                          </tr>
                        );
                      })} */}
                    </tbody>
                  </table>
                </div>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div>게임중이 아닙니다</div>
            </Fragment>
          )}
        </div>
      )}
    </Fragment>
  );
};

export default Ingame;
