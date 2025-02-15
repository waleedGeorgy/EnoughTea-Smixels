import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { EnoughTea_backend } from "../../../declarations/EnoughTea_backend";
import CURRENT_USER_ID from "../main";
import { useEffect, useState } from "react";

export default function Header() {

  const [ownedNFTGallery, setNFTGallery] = useState();
  const [listedNFTsDiscover, setListedNFTs] = useState();

  async function getUserNFT(){
    const userNFTIds = await EnoughTea_backend.getOwnedNFT(CURRENT_USER_ID);
    setNFTGallery(<Gallery title="My NFTs" ids={userNFTIds} role="collection" />);

    const listedNFTIDs = await EnoughTea_backend.getListedNFTs();
    setListedNFTs(<Gallery title="Market" ids={listedNFTIDs} role="discover" />);
  }

  useEffect(() => { getUserNFT(); }, []);

  return (
    <BrowserRouter>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src="../../tea-icon.png" />
            <div className="header-vertical-9"></div>
            <Link to="/"><h5 className="Typography-root header-logo-text">EnoughTea</h5></Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link reloadDocument to="/discover">Market</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link reloadDocument to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Routes>
        <Route exact path="/" element={<img src="../../main-background.png" alt="Homepage image" />}></Route>
        <Route path="/discover" element={listedNFTsDiscover}></Route>
        <Route path="/minter" element={<Minter />}></Route>
        <Route path="/collection" element={ownedNFTGallery}></Route>
      </Routes>
    </BrowserRouter>
  );
}
