pragma solidity ^0.4.11;

import './Auction.sol';

/**
* Instance of this will be per auction
* It holds all the money during bidding of each auction
* and finally refunds the balances as applicable to the bidders
*/
contract AuctionEscrow {

    address private auctioneer;
    Auction private auction;

    
    event TicketPaid(address buyer, uint256 price);
    event TicketReceipt(address buyer);
    event SelfDestructError(string evtMsg);
    event DoublePayError(address buyer, string evtMsg);
    event PaymentRelease(address buyer);
    event PaymentReleaseFail(address buyer, uint256 price);

    modifier auctioneerOnly {
        if(msg.sender != auctioneer) revert();
        _;
    }
    
    /**
     * Each buyers payment status is stored here.
     * Once buyer confirms recieving ticket 
     * the funds are moved to auctioneer
    */
    mapping (address => Payment) public payments;
    address [] public arrBuyers;

    struct Payment {
        uint256 amount;
        bool released;
        bool tktReceived;
        uint256 releaseDate;
    }
 
 
    function AuctionEscrow(address _actioneer, Auction _auction) public {
        auctioneer = _actioneer;
        auction = _auction;
    }
    
    /**
     * If buyer has paid then value will be greater than 0
    */
    function hasPaid (address buyer) public constant returns (bool paymentStatus) {
        return payments[buyer].released == false && payments[buyer].amount > 0;
    }

    
    function recordTicketReceipt() public {
        //dont update ticket status if not paid
        assert( hasPaid(msg.sender) == true && payments[msg.sender].tktReceived == false);
        //update status 
        payments[msg.sender].tktReceived = true;
        TicketReceipt(msg.sender);
    }
    
    // /** Dont accept payment on contract. Cleanup method would avoid this problem*/
    // function () { throw; }
    
    /**
     * Atleast at this point the assumption is that someone 
     * cannot call selfdestruct directly on contract even if 
     * this contract does not override it
     */
    function cleanup() public auctioneerOnly {
        if(canDelete() == false) {
            SelfDestructError("Unreleased tickets exist. Cannot destruct");
            revert();
        }
        selfdestruct(auctioneer);
    }
    
    function canDelete() private returns (bool del) {
        for(uint256 i = 0; i < arrBuyers.length; i++) {
            Payment p = payments[arrBuyers[i]];
            if(p.released == false || p.amount > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Called by the customer for him to recieve the tickets
     * 
     */
    function payForTickets() public payable {

        //check that auction has expired
        if(!auction.isActive()) {
                Payment storage p = payments[msg.sender];
                if(!p.released && p.amount == 0) { //allow only once
                    uint txnVal = msg.value;
                    uint32 bidTotal = auction.getPayableBidsTotal(msg.sender);
                    //accept payment for all tickets only
                    if(bidTotal > 0 && bidTotal == txnVal) {

                        payments[msg.sender] = Payment({amount: msg.value, released: false, tktReceived : false, releaseDate: 0});
                        arrBuyers.push(msg.sender);
                        TicketPaid(msg.sender, p.amount);
                        
                    } else {//dont accept money if total is less
                        revert();
                    }
                } else {
                    DoublePayError(msg.sender, "Buyer has paid earlier");
                    revert();
                }
        }
    }



    /**
     * The public function which the auctioneer will call to move funds
     * to his account
     */
    function releasePayment(address buyer) public auctioneerOnly {
        
        if(hasPaid(buyer) && payments[buyer].tktReceived == true) {
            bool sent = auctioneer.send(payments[buyer].amount);
            if(sent) {
                payments[buyer].amount = 0;
                payments[buyer].released = true;
                payments[buyer].releaseDate = now;
                PaymentRelease(buyer);
            } else {
                PaymentReleaseFail(buyer, payments[buyer].amount);
            }
        } else {
            revert();
        }

    }
    
  



}