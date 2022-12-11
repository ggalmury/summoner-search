import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../molecules/Header.js";
import Footer from "../molecules/Footer.js";
import SummonerInfo from "../pages/SummonerInfo.js";
import SummonerSearch from "../pages/SummonerSearch.js";
import Ingame from "../pages/Ingame.js";
import Page404 from "../pages/Page404.js";

const MainRouter = () => {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path="/" element={<SummonerSearch />}></Route>
        <Route path="/summoner/:summonerName/*" element={<SummonerInfo />}>
          <Route path="ingame" element={<Ingame />}></Route>
        </Route>
        <Route path="*" element={<Page404 />}></Route>
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
};

export default MainRouter;
