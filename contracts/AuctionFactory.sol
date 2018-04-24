pragma solidity ^0.4.11;

import './Auction.sol';
import './AuctionEscrow.sol';


/**
* The usefullness of this is to be considered. As a new deployment is still required
* for the factory when <pre>Auction</pre> changes. For now this is only a holder
* for each user and her Product as auction. Does not provide the immutability
* as the child object change will force changes to this factory
*/
contract AuctionFactory {

	// This is dummy holder so that changes to Product are loaded along with factory
	// This number will match the migration number
	uint256 public version = 16;

	//restrict call to create produt later using this owner only
	address factoryOwner;

	// contains the owner of an auction mapped to the hash of that auction
	mapping( address => address) public auctions;
	mapping( address => address) public escrows;

	function AuctionFactory() {
		factoryOwner = msg.sender;
	}
	
    function createAuction(uint32 pTicketPerPerson, uint32 pTotalTickets, uint32 pMinimumBid, uint256 pEndTime ) returns (address auctionAddress) {
        
        address owner = msg.sender;
        Auction auction = new Auction(owner, pTicketPerPerson, pTotalTickets, pMinimumBid, pEndTime); 
        auctions[owner] = auction;
        AuctionEscrow escrow = new AuctionEscrow(owner, auction);
        escrows[auction] = escrow;

		return auctions[owner];
    
    }

    function getAuction(address owner) returns (address) {
        return auctions[owner];
    }

    function getEscrow(address auction) returns (address) {
        return escrows[auction];
    }


}

