import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = (props) => {
  const navigate = useNavigate();

  const goToMain = (event) => {
    navigate("/");
  };

  return (
    <div>
      <h1 id="web-title" onClick={goToMain}>
        API TEST
      </h1>
    </div>
  );
};

export default Header;
