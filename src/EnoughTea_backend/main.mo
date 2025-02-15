import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import NFTActor "./NFT/nft";
import Cycles "mo:base/ExperimentalCycles";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";

// Main motoko backend
actor EnoughTea{
    // A hashmap that will hold each minted NFT (value) and its canister id (key)
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActor.NFT>(1, Principal.equal, Principal.hash);
    
    // A hashmap that will hold each user principal id and the list of NFTs they minted
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);

    // To create the listings, we will create a new data type for the listing that will hold the item owner and its price
    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat
    };

    // A hasmap of all the NFT listings. It will hold the listed NFT as the key, and the listing as the item
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

    // function to mint new NFTs by providing the NFT image, its name, and owner
    // Here, the frontend will provide the name and the image, while the owner will be the actor that called the function
    public shared(msg) func mint(imgData: [Nat8], name: Text): async Principal{
        let owner: Principal = msg.caller;

        // Allocating cycles for NFT canister creation and maintnance
        Cycles.add<system>(100_500_000_000);

        // Minting a new NFT with the specified input parameters
        let newNFT = await NFTActor.NFT(name, owner, imgData);

        // Getting the canister ID of each NFT
        let newNFTCanisterId = await newNFT.getCanisterId();

        mapOfNFTs.put(newNFTCanisterId, newNFT);
        addOwnership(owner, newNFTCanisterId);

        return newNFTCanisterId;
    };

    // A function that will get all the NFTs owned by a user and push them to the userNFTs hashmap
    private func addOwnership(owner: Principal, nftId: Principal){
        var ownedNFTs: List.List<Principal> = switch(mapOfOwners.get(owner)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        ownedNFTs := List.push(nftId, ownedNFTs);
        mapOfOwners.put(owner, ownedNFTs);
    };

    // A function that returns an array of NFTs owned by the user
    public query func getOwnedNFT(userPrincipal: Principal): async [Principal]{
        var userNFTList: List.List<Principal> = switch(mapOfOwners.get(userPrincipal)){
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(userNFTList);
    };

    // A function that returns all the listed NFTs
    public query func getListedNFTs(): async [Principal]{
        let ids = Iter.toArray(mapOfListings.keys());
        return ids;
    };

    // A function that will add the NFT to mapOfListings  
    public shared(msg) func addToListing(id: Principal, price: Nat): async Text{
        var item : NFTActor.NFT = switch(mapOfNFTs.get(id)){
            case null return "NFT does not exist.";
            case (?result) result;
        };

        let owner = await item.getOwner();
        if(Principal.equal(owner, msg.caller)){
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListings.put(id, newListing);
            return "Success";
        } else {
            return "You can't sell this NFT.";
        }
    };

    // A function to get the principal id of the user browsing the website
    public query func getMainCanisterId(): async Principal{
        return Principal.fromActor(EnoughTea);
    };
    
    // A function to check whether an item is listed, in order to control its appearance on the frontend
    public query func isListed(id: Principal): async Bool{
        if (mapOfListings.get(id) == null){
            return false;
        } else {
            return true;
        }
    };

    // A function that returns the original owner of an NFT by supplying it the id of the NFT
    public query func getOriginalOwner(id: Principal): async Principal{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return Principal.fromText("");
            case (?result) result;
        };
        return listing.itemOwner;
    };

    // A function that returns the price of an NFT by supplying it its id
    public query func getListedNFTPrice(id: Principal): async Nat{
        var listing: Listing = switch(mapOfListings.get(id)){
            case null return 0;
            case (?result) result;
        };
        return listing.itemPrice;
    };

    // A function that handle the transfer of NFT and token between sellers to buyers
    public func completePurchase(id: Principal, oldOwnerID: Principal, newOwnerID: Principal): async Text {
        var purchasedNFT : NFTActor.NFT = switch (mapOfNFTs.get(id)){
            case null return "NFT does not exist.";
            case (?result) result;
        };

        let transferResult = await purchasedNFT.transferOwnership(newOwnerID);
        if (transferResult == "Success"){
            mapOfListings.delete(id);
            var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(oldOwnerID)){
                case null List.nil<Principal>();
                case (?result) result;
            };
            ownedNFTs := List.filter(ownedNFTs, func(listItem : Principal): Bool{
                return listItem != id;
            });
            addOwnership(newOwnerID, id);
            return "Success";
        } else {
            return transferResult;
        }
    };
}