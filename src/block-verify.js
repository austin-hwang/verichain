export const TxnConsensus = (txWeb3, txhash, blockCount, repeatInSeconds, numPollAttempts, callback) => {
   // var txWeb3 = web3s[0];
   var startBlock = Number.MAX_SAFE_INTEGER;
   var interval;
   var stateEnum = { start: 1, mined: 2, awaited: 3, confirmed: 4, unconfirmed: 5 };
   var savedTxInfo;
   var attempts = 0;

   var pollState = stateEnum.start;
   
   // console.log("poll start " + txhash);


   var poll = function() {
     if (pollState === stateEnum.start) {
      // console.log('poll State ' + pollState);
       txWeb3.eth.getTransaction(txhash, function(e, txInfo) {
         if (e || txInfo == null) {
          // console.log("err in start " + e);
           return; // XXX silently drop errors
         }
         if (txInfo.blockHash != null) {
           startBlock = txInfo.blockNumber;
           savedTxInfo = txInfo;
           // console.log("mined");
           pollState = stateEnum.mined;
           // console.log(" now mined " + savedTxInfo);
         }
       });
     }
     else if (pollState === stateEnum.mined) {
      // console.log('poll State ' + pollState);
        // console.log(" is mined " + pollState);
         txWeb3.eth.getBlockNumber(function (e, blockNum) {
           if (e) {
            // console.log("err in mined " + e);
             return; // XXX silently drop errors
           }
           // console.log("blockNum: ", blockNum);
           if (blockNum >= (blockCount + startBlock)) {
             pollState = stateEnum.awaited;
             // console.log(" now awaited " + pollState);
           }
         });
     }
    else if (pollState === stateEnum.awaited) {
      // console.log('poll State ' + pollState);
          // console.log(" is awaited " + pollState);
         txWeb3.eth.getTransactionReceipt(txhash, function(e, receipt) {
           if (e || receipt == null) {
              // console.log("err in receipt " + e);
             return; // XXX silently drop errors.  TBD callback error?
           }
           // confirm we didn't run out of gas
           // XXX this is where we should be checking a plurality of nodes.  TBD
           clearInterval(interval);
           // console.log("Got recepit while polling " + receipt);
           console.log(" chk gas " + receipt.gasUsed + " avlbl " + savedTxInfo.gas);

           //<<<<<<<<<<<<<< check the txn status using receipt.status instead of gas >>>>>>>>>>>>>>>
           if (receipt.gasUsed >= savedTxInfo.gas) {
             pollState = stateEnum.unconfirmed;
             callback(new Error("we ran out of gas, not confirmed!"), null);
           } else {
             pollState = stateEnum.confirmed;
             callback(null, receipt);
           }
       });
     } else {
       throw(new Error("We should never get here, illegal state: " + pollState));
     }

     attempts++;
     if (attempts > numPollAttempts) {
       clearInterval(interval);
       pollState = stateEnum.unconfirmed;
       callback(new Error("Timed out, not confirmed"), null);
     }
   };

   //poll for updates every XX ms
   interval = setInterval(poll, repeatInSeconds);
   poll();
 
 }


