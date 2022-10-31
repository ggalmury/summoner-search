import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../molecules/Header.js";
import SummonerInfo from "../pages/SummonerInfo.js";
import SummonerSearch from "../pages/SummonerSearch.js";
import MatchHistory from "../pages/MatchHistory.js";
import Ingame from "../pages/Ingame.js";
import Page404 from "../pages/Page404.js";

const MainRouter = () => {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path="/" element={<SummonerSearch />}></Route>
        <Route path="/summoner/*" element={<SummonerInfo />}>
          <Route path="history" element={<MatchHistory />}></Route>
          <Route path="ingame" element={<Ingame />}></Route>
        </Route>
        <Route path="*" element={<Page404 />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MainRouter;
