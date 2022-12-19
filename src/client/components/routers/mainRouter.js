import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "../molecules/header.js";
import Footer from "../molecules/footer.js";
import InfoMain from "../pages/infoMain";
import SummonerInfo from "../pages/summonerInfo.js";
import SummonerSearch from "../pages/summonerSearch.js";
import Ingame from "../pages/ingame.js";
import Page404 from "../pages/page404.js";

const MainRouter = () => {
  return (
    <BrowserRouter>
      <Header></Header>
      <Routes>
        <Route path="/" element={<SummonerSearch />}></Route>
        <Route path="/summoner/:summonerName/" element={<SummonerInfo />}>
          <Route path="" element={<InfoMain />}></Route>
          <Route path="ingame" element={<Ingame />}></Route>
        </Route>
        <Route path="*" element={<Page404 />}></Route>
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
};

export default MainRouter;
