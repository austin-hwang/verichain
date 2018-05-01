//react and Front End imports
import React, { Component } from "react";
import PropTypes from "prop-types";
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

//contracts and lib
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/dataAuction.json";
import { TxnConsensus } from "./block-verify.js";

//styles?? can remove later
//import './App.css';

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

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
