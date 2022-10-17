import { BrowserRouter, Routes, Route } from "react-router-dom";
import SummonerInfo from "../pages/SummonerInfo.js";
import SummonerSearch from "../pages/SummonerSearch.js";
import Ingame from "../pages/Ingame.js";
import Header from "../molecules/Header.js";

const MainRouter = () => {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path="/" element={<SummonerSearch />}></Route>
        <Route path="/result" element={<SummonerInfo />}></Route>
        <Route path="/ingame" element={<Ingame />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
