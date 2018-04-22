export function   watchEvents (bidAuction, itemId, callback) {

      //console.log(" from watcher   " + bidAuction + " " + itemId + " " + callback);

      var bidEvent = bidAuction.BidCreated({fromBlock: 'latest', toBlock: 'latest', address : itemId});
          bidEvent.watch(function(error, result){
              if(!error) {
                callback("Bid received for Ticket Id " + result.args.pTicketId + " of amount " + result.args.bidAmount+ " from address " + result.args.bidder, false, true);
              } else {
                callback("Err in BidCreated event "+ error, true, true);
              }
          });

        var highEvent = bidAuction.HighestBid({fromBlock: 'latest', toBlock: 'latest', address : itemId});
          highEvent.watch(function(error, result){
              if(!error) {
                callback("Highest bid received for Ticket Id " + result.args.pTicketId + " of amount " + result.args.bidAmount + " from address " + result.args.bidder, false, true);
              } else {
                callback("Err in Highest Bid event "+ error, true, true);
              }
          });

        var errEvent = bidAuction.BidError({fromBlock: 'latest', toBlock: 'latest', address : itemId});
          errEvent.watch(function(error, result){
              if(!error) {
                callback(" Invalid Bid of amount " + result.args.bidAmount
                + " from address " + result.args.bidder + " <p> Error:  " +  getErrMsg(result.args.errorCode.toString()), true, true);
              }
              else {
                callback("Err in BidError event "+ error, true, true);
              }
          });

          var tktEvent = bidAuction.TicketAlloted({fromBlock: 'latest', toBlock: 'latest', address : itemId});
          tktEvent.watch(function(error, result){
              if(!error) {
                callback("Ticket Id " + result.args.pTicketId + " alloted to " + result.args.bidder+ " for amount " + result.args.bidAmount, false, true);
              } else {
                callback("Err in TicketAlloted event "+ error, true, true);
              }
          });
}



export function getErrMsg(errCode){
  
  var resMsg = errCode + " : ";
  if(errCode === '100' ) {
    resMsg += "Bid Amount cannot be less than minimum bid amount";
  } else if(errCode === '101'|| errCode === '500') {
    resMsg += "The Auction has expired!";
  } else if(errCode === '102') {
    resMsg += "Bidder has been alloted maximum allowed tickets for this Auction";
  } else if(errCode === '103') {
    resMsg += "Current bid cannot be less than previous bid for this ticket";
  }
  return resMsg;
}


export default {watchEvents, getErrMsg}