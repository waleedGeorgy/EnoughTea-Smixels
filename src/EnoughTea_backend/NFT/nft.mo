import Principal "mo:base/Principal";
import Nat8 "mo:base/Nat8";

/* Creating the NFT smart contract with the actor class that will allow us to programmatically
   create unique canisters for each new NFT */
// Adding "this" keyword in order to access this actoe class properties instantly
actor class NFT (name: Text, owner: Principal, contents: [Nat8]) = this {
    
    private let imgName = name;
    private var imgOwner = owner;
    private let imgContents = contents;

    public query func getName(): async Text{
        return imgName;
    };

    public query func getOwner(): async Principal{
        return imgOwner;
    };

    public query func getContents(): async [Nat8]{
        return imgContents;
    };

    public query func getCanisterId(): async Principal {
        return Principal.fromActor(this);
    };

    public shared(msg) func transferOwnership(newOwner: Principal): async Text{
        if(msg.caller == imgOwner){
            imgOwner := newOwner;
            return "Success";
        } else {
            return "Error: Not initiated by NFT owner.";
        }
    };
}