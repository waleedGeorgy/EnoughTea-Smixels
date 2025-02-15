import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/TokenBackend";
import { useEffect, useState } from "react";
import Button from "./Button";
import { EnoughTea_backend } from "../../../declarations/EnoughTea_backend";
import CURRENT_USER_ID from "../main";
import PriceLabel from "./PriceLabel";
import { Principal } from "@dfinity/principal";

export default function Item(props) {

  const [displayName, setName] = useState();
  const [owner, setOwner] = useState();
  const [nftImage, setImage] = useState();
  const [sellButton, setSellButton] = useState();
  const [sellInput, setSellInput] = useState();
  const [loaderState, setLoaderState] = useState(true);
  const [blur, setBlur] = useState();
  const [listedStatus, setListedStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [itemIsDisplayed, setItemDisplayed] = useState(true);

  const canisterId = props.id;
  
  let NFTActor;

  // To get data from the NFT canister we need to create an HTTP request to said canister
  // This is done using the HttpAgent class provided by DFinity
  const agent = new HttpAgent({ host:"http://localhost:3000" });

  // A function that will load the nfts and any related information
  async function loadNFT() {

    // Fetch root key for certificate validation during local development
    if (process.env.DFX_NETWORK !== "ic") {
      await agent.fetchRootKey().catch((err) => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }

    // Now we use the agent to fetch the canister and its data, using the Actor class
    // To create the actor we need to provide the IDL of the NFT canister
    NFTActor = await Actor.createActor(idlFactory, { agent, canisterId });

    if(props.role == "collection"){
      const nftIsListed = await EnoughTea_backend.isListed(props.id);
      if (nftIsListed){
        setOwner("EnoughTea");
        setBlur({filter: "blur(3px)"});
        setListedStatus("Listed");
      } else {
        setSellButton(<Button clickHandle={handleSell} text="Sell" />);
      }
    } else if (props.role == "discover"){
      const originalOwner = await EnoughTea_backend.getOriginalOwner(props.id);
      if (originalOwner.toText() != CURRENT_USER_ID.toText()){
        setSellButton(<Button clickHandle={handleBuy} text="Buy" />);
      }
      const itemPrice = await EnoughTea_backend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={itemPrice.toString()} />);
    }
    
    // Here we can call the methods inside the NFT canister
    const name = await NFTActor.getName();
    const owner = await NFTActor.getOwner();
    const imageData = await NFTActor.getContents();
    const imageContent = new Uint8Array(imageData);
    const image = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    );
    
    setName(name);
    setOwner(owner.toText());
    setImage(image);
  }

  // Now we should call the loadNFT function on page load
  useEffect(() => { loadNFT(); }, []);

  let price;
  function handleSell(){
    setSellInput(<input
      placeholder="Price in GEOD"
      type="number"
      className="price-input"
      value={price}
      onChange={(e) => {price = e.target.value}}
    />);
    setSellButton(<Button clickHandle={sellItem} text="Confirm" />);
  }

  async function sellItem(){
    setBlur({filter: "blur(4.5px)"});
    setLoaderState(false);
    console.log("Confirm clicked with price " + price);
    const listingResult = await EnoughTea_backend.addToListing(props.id, Number(price));
    console.log("Listing " + listingResult);
    if(listingResult == "Success"){
      
      const enoughTeaId = await EnoughTea_backend.getMainCanisterId();
      const transferResult = await NFTActor.transferOwnership(enoughTeaId);
      console.log("transfer " + transferResult);
      if(transferResult == "Success"){
        setLoaderState(true);
        setSellButton();
        setSellInput();
        setListedStatus("Listed");
        setOwner("EnoughTea");
      }
    }
  }

  async function handleBuy(){
    console.log("Buy was triggered!");
    setLoaderState(false);
    const tokenActor = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("aovwi-4maaa-aaaaa-qaagq-cai")
    });

    const sellerID = await EnoughTea_backend.getOriginalOwner(props.id);
    const price = await EnoughTea_backend.getListedNFTPrice(props.id);

    const result = await tokenActor.transfer(sellerID, price);
    console.log(result);
    if (result == "Success"){
      const transferResult = await EnoughTea_backend.completePurchase(props.id, sellerID, CURRENT_USER_ID);
      console.log("purchase " + transferResult);
      setLoaderState(true);
      setItemDisplayed(false);
    }
  }

  return (
    <div style={{display: itemIsDisplayed ? "inline" : "none"}} className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={nftImage}
          style={blur}
        />
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {displayName}<b><span className="purple-text"> {listedStatus}</span></b>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            <b>Owner:</b> {owner}
          </p>
          <div hidden={loaderState} className="lds-ellipsis">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          {sellInput}
          {sellButton}
        </div>
      </div>
    </div>
  );
}
