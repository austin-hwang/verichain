//react and Front End imports
import React, { Component } from "react";
import PropTypes from "prop-types";

//Eth libraries
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

//contracts
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/Auction.json";
import auctionEscrow from "./contracts/AuctionEscrow.json";

//utilities
import { TxnConsensus } from "./block-verify.js";

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);
var AuctionEscrow = contract(auctionEscrow);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

export default class PurchaseTicket extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    //the url should come from config /props
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.warn("webb3 connected  " + web3);
    AuctionFactory.setProvider(web3.currentProvider);
    Auction.setProvider(web3.currentProvider);
    AuctionEscrow.setProvider(web3.currentProvider);

    console.log(
      " props " + this.props.auctionId + " " + this.props.auctioneerId
    );

    this.state = {
      payableAmt: 0
    };

    me = this;
  }

  componentDidMount() {
    this.props.notifier(null, false, false, true);
  }

  watchTkt = (escrow, id) => {
    console.log("Watching tkt " + escrow + " esc id " + id);
    var event = escrow.TicketReceipt({
      fromBlock: "latest",
      toBlock: "latest",
      address: id
    });
    event.watch(function(error, result) {
      if (!error) {
        me.props.notifier(
          "Ticket Receipt confirmed for buyer " + result.args.buyer,
          false,
          true
        );
      } else {
        me.props.notifier("Error confirming ticket :; " + error, true, true);
      }
    });
  };

  confirmTktReceipt = () => {
    this.props.notifier(null, false, false, true);

    let buyer = this.refs.tktReceiptId.value;

    // console.log("confirmTktReceipt details " + buyer + " " + auctioneerId);
    var unlocked = web3.personal.unlockAccount(buyer, "welcome123", 10);
    console.log("unlocked " + unlocked);

    AuctionFactory.deployed().then(function(factInstance) {
      factInstance.getEscrow.call(me.props.auctionId).then(function(escId) {
        var pEscrow = AuctionEscrow.at(escId);
        // console.log(" conftkt auctionId " + auctionId + " esc id :: " + escId);

        me.watchTkt(pEscrow, escId);

        pEscrow.recordTicketReceipt
          .sendTransaction({ from: buyer, gas: 4000000 })
          .then(function(txnHash) {
            // writeMsg("Transaction Id " + txnHash, false, false);
            console.log("Transaction Id " + txnHash);
            TxnConsensus(web3, txnHash, 3, 4000, 4, function(err, receipt) {
              // console.log("Got result from block confirmation");
              if (receipt) {
                console.log(
                  "recordTicketReceipt Receipt status " + receipt.status
                );
                console.log(
                  "recordTicketReceipt receipt blockHash " + receipt.blockHash
                );
                console.log(
                  "recordTicketReceipt receipt blockNumber " +
                    receipt.blockNumber
                );
                console.log(
                  "recordTicketReceipt receipt transactionIndex " +
                    receipt.transactionIndex
                );
              } else {
                me.props.notifier(
                  "Error confirming ticket receipt " + err,
                  true,
                  false
                );
              }
            });
          });
      });
    });
  };

  releaseFunds = () => {
    this.props.notifier(null, false, false, true);

    let auctioneerId = this.props.auctioneerId;
    let buyer = this.refs.tktReceiptId.value;

    console.log(" details " + buyer + " " + auctioneerId);

    var unlocked = web3.personal.unlockAccount(auctioneerId, "welcome123", 10);
    console.log("unlocked " + unlocked);
    // if(!unlockaccount(auctioneerId, phrase)) {
    //   return;
    // }

    AuctionFactory.deployed().then(function(factInstance) {
      factInstance.getEscrow.call(me.props.auctionId).then(function(escId) {
        var pEscrow = AuctionEscrow.at(escId);

        pEscrow.PaymentRelease().watch((err, response) => {
          //once the event has been detected, take actions as desired
          //writeMsg('Funds of tickets for buyer : ' + response.args.buyer + " released to auctioneer " + auctioneerId, false, true);
          console.log(
            "Funds of tickets for buyer : " +
              response.args.buyer +
              " released to auctioneer " +
              auctioneerId
          );
        });

        pEscrow.PaymentReleaseFail().watch((err, response) => {
          //once the event has been detected, take actions as desired
          //writeMsg('Relase Funds failed of tickets for buyer : ' + response.args.buyer + " with total price " + response.args.price, true, true);
          console.log(
            "Relase Funds failed of tickets for buyer : " +
              response.args.buyer +
              " with total price " +
              response.args.price
          );
        });

        pEscrow.releasePayment
          .sendTransaction(buyer, { from: auctioneerId, gas: 400000 })
          .then(function(txnHash) {
            // writeMsg("Transaction Id " + txnHash, false, false);
            console.log("Transaction Id " + txnHash);
            TxnConsensus(web3, txnHash, 3, 4000, 4, function(err, receipt) {
              // console.log("Got result from block confirmation");
              if (receipt) {
                me.props.notifier(
                  "Funds released successfully. Txn Id : " + txnHash
                );
                console.log("releaseFunds Receipt status " + receipt.status);
                console.log("receipt blockHash " + receipt.blockHash);
                console.log("receipt blockNumber " + receipt.blockNumber);
                console.log(
                  "receipt transactionIndex " + receipt.transactionIndex
                );
              } else {
                // writeMsg("Error reading receipt " + err, true, true);
                me.props.notifier("Error releasing funds " + err, true, false);
              }
            });
          });
      });
    });
  };

  render() {
    return (
      <form>
        <div className="card mb-3">
          <div className="card-header">Confirm and Verify Data</div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-bordered"
                id="dataTable"
                width="100%"
                cellSpacing="0"
              >
                <tbody>
                  <tr>
                    <td>Auctioneer Id</td>
                    <td>{this.props.auctioneerId}</td>
                  </tr>
                  <tr>
                    <td>Auction Id</td>
                    <td>{this.props.auctionId}</td>
                  </tr>
                  <tr>
                    <td>Buyer Address</td>
                    <td>
                      <input
                        className="form-control"
                        ref="tktReceiptId"
                        defaultValue="0x3ad78130DCff93d6c942c37aA45F0A004A0Ffe0C"
                        placeholder="Buyer Address"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-3">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.confirmTktReceipt}
                  >
                    Send Data Hash
                  </a>
                </div>
                <div className="col-md-3">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.releaseFunds}
                  >
                    Obtain API Key
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }
}

PurchaseTicket.propTypes = {
  auctionId: PropTypes.string.isRequired,
  auctioneerId: PropTypes.string.isRequired,
  notifier: PropTypes.func.isRequired
};
