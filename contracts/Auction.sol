pragma solidity ^0.4.11;


contract Auction {

	bool public isActive = true;

	//dont want external to modify this	
	uint32 private ticketId = 1; 
    uint32 public balanceTikets;
    uint32 public totalTickets;
    uint32 public ticketPerPerson;
    uint32 public minimumBid;
    uint32 public lastBid;
    uint32 public currentBidCount;
    uint32 public highestBid;
    //create this from constructor or some logic later
    uint32 public maxBidsPerTicket = 2; 
    uint256 public endTime;


	address public highestBidder;
    address public lastBidder;
    address public auctioneer;

    //owner of each ticket
    //stores history of allotment
    mapping( address => Ticket[]) public allotedTickets;

    //mapping bids for each ticketId  as : TicketId => (bidder => bidAmt)
    //this will have history of all bids for a ticket
    mapping( uint32 => mapping( address => uint32)) public bids;


    event BidCreated(address bidder, uint32 bidAmount, uint32 pTicketId);
    event HighestBid(address bidder, uint32 bidAmount, uint32 pTicketId);
    event TicketAlloted(address bidder, uint32 bidAmount, uint32 pTicketId);
    event BidError(address bidder, uint32 bidAmount, uint32 errorCode);

    struct Ticket {
       uint32 id;
       uint32 pricePaid;
       address owner;

    }

    /*
    * Do not allow the auctioneer to bid
    */
    modifier noAuctioneer() {
    	require(msg.sender != auctioneer);
        _;
	}

	/**
	* Actually this can be done from Escrow
	* but for now this will do
	*/
    modifier ownerOnly() {
    	require(msg.sender == auctioneer);
        _;
	}


	/**
	* Constructor. Initialized all vars to params
	*/
	function Auction (address owner, uint32 pTicketPerPerson, uint32 pTotalTickets, uint32 pMinimumBid, uint256 pEndTime ) public {
		auctioneer = owner;
		ticketPerPerson = pTicketPerPerson;
		totalTickets = pTotalTickets;

		// reduced each time on allotment
		balanceTikets = pTotalTickets; 
		
		endTime = now + (pEndTime * 1 hours );
		minimumBid = pMinimumBid;
		
	}

	
	/*
	* Bid for a Ticket in this auction. Following rules apply
	*  <p> bidder cannot be auctioneer
	*  <p> bidder should not have received max tickets per person
	*  <p> amount should be greater than last bid of this bidder
	*  <p> if number of bids for a ticket are reached. The max bidder get allocated 
	*  the current ticket
	*/
	function bid(uint32 bidAmt) public 
	        noAuctioneer {

		uint32 errCode = validBid(msg.sender, bidAmt);
		if( errCode != 0) {
			BidError(msg.sender, bidAmt, errCode);

		} else {

			bids[ticketId][msg.sender] = bidAmt;
			lastBidder = msg.sender;
			lastBid = bidAmt;
			BidCreated(msg.sender, bidAmt, ticketId);
			//increment the count to reach count of allocation
			currentBidCount++;

			if(bidAmt > highestBid) {
				highestBid = bidAmt;
				highestBidder = msg.sender;
				HighestBid(msg.sender, highestBid, ticketId);
			}

			//allocate ticket
			if(currentBidCount >= maxBidsPerTicket ) {
				allotAndReset();
			}
		}
	}



	/*
	* Assign current ticket to the last highest bidder
	* and reset all the values for next ticket
	*/
	function allotAndReset() internal {

		//evalute and check if bidderHasQuota call is required
		allotedTickets[highestBidder].push(Ticket ({id:ticketId, pricePaid: highestBid, owner:highestBidder}));
		
		TicketAlloted(highestBidder, highestBid, ticketId);

		//reset values that are per ticket
		ticketId++;
		balanceTikets--;
		highestBidder = 0x0;
		highestBid = 0;
		lastBid = 0;
		lastBidder = 0x0;
		currentBidCount = 0;
		//if all tickets are alloted disable auction
		if(balanceTikets == 0) {
			isActive = false;
		}

	}


	/*
	* returns an error code to indicate the status
	* 0 means success and everything is ok
	* TODO: document each error code at contract level
	*/
	function validBid(address bidder, uint32 amt) internal constant returns (uint32) {

		// auction has expired
		if(!isActive) {
			return 500;
		}

		//accept bid only for values >= of minimum bid amt
		if( amt <= 0 || amt < minimumBid) {
			return 100;
		}

		//ENALBE THIS:: check for auction expiry and disable for future requests
		//if(now < endTime) { isActive = false; return 101; }

		
		if(allotedTickets[bidder].length >= ticketPerPerson) {
			return 102;
		}

		//in case the address has not bid earlier 
		// the value of her address will be '0'
		uint32 lastBidByAddress = bids[ticketId][bidder];

		if(lastBidByAddress == 0 || lastBidByAddress < amt ) { //has not bid earlier
			return 0;
		} else if(lastBidByAddress > amt) { // dont accept lower bids from same bidder
			return 103;
		} 
	}

	/**
	* get the bid amount for this bidder for current ticket.
	* Currently used only for tests from console
	*/
	function getBidFor(address bidderAddress) public constant returns (uint32) {
		return bids[ticketId][bidderAddress];
	}

    function getPayableBidsTotal(address bidder) public constant returns (uint32 bidTotal) {
        			//get the biider address
			Ticket [] storage tkts = allotedTickets[bidder];
			if(tkts.length > 0) {
				uint32 totalAmt = 0;
				for(uint32 i=0; i< tkts.length; i++) {
					if(tkts[i].owner ==  bidder)
						totalAmt += tkts[i].pricePaid;
				}
				return totalAmt;
			}
			return 0;

    }

}