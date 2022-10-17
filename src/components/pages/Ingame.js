import { React, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Ingame = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // const [encryptedSummonerId, setEncryptedSummonerId] = useState(location.state.encryptedSummonerId);
  const [participantsList, setparticipantsList] = useState([]);
  const [ingameInfo, setIngameInfo] = useState(location.state.ingameInfo);

  const test = (event) => {
    // TODO :: ingameInfo 빈값 수정
    console.log(ingameInfo);

    // const ul = document.querySelector("#now-gaming");

    // participantsList.map((player) => {
    //   const li = document.createElement("li");
    //   li.textContent = player.summonerName;
    //   ul.appendChild(li);
    // });
  };

  const goToInfo = (event) => {
    // navigate("/result");
    console.log(participantsList);
  };

  return (
    <div>
      <button onClick={goToInfo}>종합</button>
      <button onClick={test}>참여자 목록</button>
      <ul id="now-gaming"></ul>
    </div>
  );
};

export default Ingame;
