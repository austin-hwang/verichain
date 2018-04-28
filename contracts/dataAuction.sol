pragma solidity ^0.4.19;

contract dataAuction {
    // Parameters of the auction. Times are either
    // absolute unix timestamps (seconds since 1970-01-01)
    // or time periods in seconds.
    address public beneficiary; // Owner of the auction
    uint public auctionEnd; // End time of the auction to be calculated
    string public metadata; // Auction metadata, should be replaced by IPFS
    string apiKey;

    address public highestBidder;
    uint public highestBid;
    
    // Open:bidding, Locked:auction closed and highest bid set
    // Completed: data exanged successfully and seller paid
    // Incomplete: data not exchanged in given time and only outbid users can retrieve funds, buyer funds burned
    enum State { Open, Locked, Completed, Incomplete }  
    State public state; // Current state of the auction.

    
    bytes32 sellerHash; // Hash of seller's first 256 bytes of data
    
    uint collectionPeriod; //Seconds
    uint public collectionEnd; //Set after auction lock
    

    // Allowed withdrawals of previous bids
    mapping(address => uint) pendingReturns;

    // Set to true at the end, disallows any change
    bool ended;

    // Events that will be fired on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    //Check for a specified state
    modifier inState(State _state) {
        require(state == _state);
        _;
    }
    
    //Check if transaction started by buyer
    modifier onlyBuyer() {
        require(msg.sender == highestBidder);
        _;
    }

    //Check if transaction started by seller
    modifier onlySeller() {
        require(msg.sender == beneficiary);
        _;
    }

    // The following is a so-called natspec comment,
    // recognizable by the three slashes.
    // It will be shown when the user is asked to
    // confirm a transaction.

    /// Create a simple auction with `_biddingTime`
    /// seconds bidding time on behalf of the
    /// beneficiary address `_beneficiary`.
    function dataAuction(
        uint _biddingTime,
        address _beneficiary,
        uint _collectionPeriod,
        bytes32 _sellerHash,
        string _metadata,
        string _apiKey
    ) public {
        require(_biddingTime >= 0);
        require(_beneficiary != 0);
        apiKey = _apiKey;
        beneficiary = _beneficiary;
        auctionEnd = now + _biddingTime;
        metadata = _metadata;
        state = State.Open;
        collectionPeriod = _collectionPeriod;
        sellerHash = _sellerHash;
    }
    
    
    
    /// Bid on the auction with the value sent
    /// together with this transaction.
    /// The value will only be refunded if the
    /// auction is not won.
    function bid() public payable {
        // No arguments are necessary, all
        // information is already part of
        // the transaction. The keyword payable
        // is required for the function to
        // be able to receive Ether.

        // Revert the call if the bidding
        // period is over.
        require(now <= auctionEnd);

        // If the bid is not higher, send the
        // money back.
        require(msg.value > highestBid);

        require(msg.value != 0);

        if (highestBid != 0) {
            // Sending back the money by simply using
            // highestBidder.send(highestBid) is a security risk
            // because it could execute an untrusted contract.
            // It is always safer to let the recipients
            // withdraw their money themselves.
            pendingReturns[highestBidder] += highestBid;
        }
        highestBidder = msg.sender;
        highestBid = msg.value;
        HighestBidIncreased(msg.sender, msg.value);
    }

    /// Withdraw a bid that was overbid.
    function refundBid() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            // It is important to set this to zero because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            pendingReturns[msg.sender] = 0;

            if (!msg.sender.send(amount)) {
                // No need to call throw here, just reset the amount owing
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        if(address(this).balance==highestBid){
            selfdestruct(this);
        }
        return true;
    }
    
    // Seller can get reward if buyer has verified it
    function withdrawReward() public inState(State.Completed)  onlySeller() {
        msg.sender.transfer(highestBid);
    }
    
    // Confirm that buyer has payload, pay seller
    function confirmExchange(bytes32 buyerHash) public inState(State.Locked) onlyBuyer() returns (bool) {
        if(buyerHash==sellerHash){
            state = State.Completed;
            return true;
        }
        return false;
    }
    // Retrieve key
    function retrieveKey() public inState(State.Locked) onlyBuyer() returns (string) {
        return apiKey;
    }
    
    // Allows users to check if the auction has been completed. 
    // If not after the collection period, then the auction becomes incomplete and buyer's money is gone
    function incomplete() public inState(State.Locked) returns (bool) {
        require(now >= collectionEnd); // collection period is over
        state = State.Incomplete;
        if(address(this).balance == highestBid){
            selfdestruct(this);
        }
        return true;
    }
    
    /// End the auction and set state to locked
    function endAuction() public {

        require(now >= auctionEnd); // auction did not yet end
        require(!ended); // this function has already been called

        ended = true;
        AuctionEnded(highestBidder, highestBid);

        state = State.Locked;
        collectionEnd = now + collectionPeriod;

    }
}