import { React, useEffect, useState } from "react";
import "./SummonerInfo.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(location.state.profile);
  const [ingameInfo, setIngameInfo] = useState("");

  useEffect(() => {
    axios
      .get("/api/spectatorV4", { params: { encryptedSummonerId: userProfile.id } })
      .then((response) => {
        setIngameInfo(response);
        console.log(response);
      })
      .catch((err) => {
        console.log(err.response);
      });
  }, []);

  // TODO : 메뉴 선택시 페이지 전환 구현
  const goToInfo = (event) => {
    navigate("/result");
  };

  const goToIngameInfo = (event) => {
    navigate("/ingame", { state: { ingameInfo: ingameInfo } });
  };

  return (
    <div>
      {ingameInfo.status === 200 ? (
        <div>
          <h2>이름 : {userProfile.name}</h2>
          <h2>레벨 : {userProfile.summonerLevel}</h2>
          <button onClick={goToInfo}>종합</button>
          <button onClick={goToIngameInfo}>인게임 정보 보기</button>
        </div>
      ) : (
        <div>
          <h2>loading</h2>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
