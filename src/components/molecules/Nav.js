import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import "./Nav.css";

const Nav = (props) => {
  const navigate = useNavigate();
  // 종합으로 이동
  const goToHistory = (event) => {
    alert("test1");
    // navigate("/summoner/history");
  };

  // 인게임 정보로 이동
  const goToIngameInfo = (event) => {
    alert("test2");
    // navigate("/summoner/ingame");
  };
  return (
    <div id="nav">
      <button onClick={goToHistory}>전적 보기</button>
      <button onClick={goToIngameInfo}>인게임</button>
    </div>
  );
};

export default Nav;
