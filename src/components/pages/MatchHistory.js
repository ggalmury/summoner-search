import { React, useEffect, useState, useContext, Fragment, useRef } from "react";
import axios from "axios";
import Loading from "./Loading.js";
import { SummonerInfoContext } from "./SummonerInfo";

const MatchHistory = () => {
  const summonerInfo = useContext(SummonerInfoContext);
  const [historyInfo, setHistoryInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log(summonerInfo.puuid);
      try {
        const historyRaw = await axios.post("/api/matches", { puuid: summonerInfo.puuid, start: 0, count: 5 });

        setHistoryInfo(historyRaw.data.data);
        console.log(historyRaw.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    setLoading(true);
    fetchData();
  }, [summonerInfo]);

  return (
    <div>
      <h2>hello test</h2>
    </div>
  );
};

export default MatchHistory;
