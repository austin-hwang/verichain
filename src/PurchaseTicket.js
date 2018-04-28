//react and Front End imports
import React, { Component } from "react";
import PropTypes from "prop-types";
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

//contracts and lib
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/Auction.json";
import auctionEscrow from "./contracts/AuctionEscrow.json";
import { TxnConsensus } from "./block-verify.js";

//styles?? can remove later
//import './App.css';

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

    console.log(" got Auction ID from props " + this.props.auctionId);

    this.state = {
      payableAmt: 0
    };

    me = this;
  }

  getPayable = () => {
    this.props.notifier(null, false, false, true);

    let buyer = this.refs.txtBuyerId.value;
    var auction = Auction.at(this.props.auctionId);

    auction.getPayableBidsTotal
      .call(buyer, { from: buyer })
      .then(function(amt) {
        console.log("Payable  " + amt);
        me.setState({ payableAmt: amt["c"] });
      });
  };

  watchPurchase = (escrow, id) => {
    console.log("Watching purchase tkt " + escrow + " esc id " + id);
    var tPaidEvent = escrow.TicketPaid({
      fromBlock: "latest",
      toBlock: "latest",
      address: id
    });
    tPaidEvent.watch(function(error, result) {
      if (!error) {
        me.props.notifier(
          "Payment received from buyer : " +
            result.args.buyer +
            " of amount " +
            result.args.price,
          false,
          true
        );
      } else {
        me.props.notifier("Error reading receipt " + error, true, true);
      }
    });
  };

  pay = () => {
    this.props.notifier(null, false, false, true);

    let buyer = this.refs.txtBuyerId.value;
    let orderAmt = this.state.payableAmt;

    // var bidAuction = Auction.at(this.props.auctionId);

    // console.log('got auction ' + bidAuction);

    var unlocked = web3.personal.unlockAccount(buyer, "welcome123", 10);
    console.log("unlocked " + unlocked);

    AuctionFactory.deployed().then(function(factInstance) {
      factInstance.getEscrow.call(me.props.auctionId).then(function(escId) {
        var pEscrow = AuctionEscrow.at(escId);
        console.log("Escrow  " + pEscrow);
        me.watchPurchase(pEscrow, escId);

        pEscrow.hasPaid.call(buyer).then(function(status) {
          console.log("Buyer " + buyer + " hasPaid " + status);
        });

        pEscrow.payForTickets
          .sendTransaction({ from: buyer, value: orderAmt, gas: 4000000 })
          .then(function(buytxnHash) {
            console.log("Transaction Id " + buytxnHash);
            TxnConsensus(web3, buytxnHash, 3, 4000, 4, function(err, receipt) {
              // console.log("Got result from block confirmation");
              if (receipt) {
                console.log("buyTicket Receipt status " + receipt.status);
                console.log("buyTicket receipt blockHash " + receipt.blockHash);
                console.log(
                  "buyTicket receipt blockNumber " + receipt.blockNumber
                );
                console.log(
                  "buyTicket receipt transactionIndex " +
                    receipt.transactionIndex
                );
              } else {
                console.log("buyTicket err from poll " + err);
                me.props.notifier(
                  "Error while paying for ticket " + err,
                  true,
                  false
                );
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
          <div className="card-header">Withdraw Bid</div>
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
                    <td>Auction ID</td>
                    <td>{this.props.auctionId}</td>
                  </tr>
                  <tr>
                    <td>Verification</td>
                    <td>
                      <input
                        className="form-control"
                        ref="txtBuyerId"
                        defaultValue="0x3ad78130DCff93d6c942c37aA45F0A004A0Ffe0C"
                        placeholder="Buyer Address"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Total Payable</td>
                    <td>{this.state.payableAmt}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-3">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.getPayable}
                  >
                    Get Payable
                  </a>
                </div>
                <div className="col-md-3">
                  <a className="btn btn-primary btn-block" onClick={this.pay}>
                    Pay
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
  notifier: PropTypes.func.isRequired
};
