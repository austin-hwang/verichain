//react and Front End imports
import React, { Component } from "react";
import PropTypes from "prop-types";

//Eth libraries
import { default as Web3 } from "web3";
import { default as contract } from "truffle-contract";

//contracts
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/dataAuction.json";

//utilities
import { TxnConsensus } from "./block-verify.js";

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

const states = ["Open", "Locked", "Completed", "Incomplete"];

export default class Settlement extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    //the url should come from config /props
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.warn("webb3 connected  " + web3);
    AuctionFactory.setProvider(web3.currentProvider);
    Auction.setProvider(web3.currentProvider);

    console.log(
      " props " + this.props.auctionId + " " + this.props.auctioneerId
    );

    this.state = {
      auctions: [],
      auction: null,
      payableAmt: 0
    };

    me = this;
  }

  async componentDidMount() {
    this.props.notifier(null, false, false, true);
    let factoryInstance = await AuctionFactory.deployed();
    let auctionsLength = parseInt(await factoryInstance.numAuctions.call());
    let auctions = [];
    for (var i = 0; i < auctionsLength; i++) {
      let auction = await factoryInstance.getAuction.call(i);
      auctions.push(auction);
    }
    this.setState({ auctions });
    if (auctions.length) {
      let auction = await this.getAuctionInfo(auctions[0]);
      this.setState({
        auction,
        selectedAuction: auctions[0]
      });
    }
    this.handleChange = this.handleChange.bind(this);
  }

  async getAuctionInfo(address) {
    let myAuction = await Auction.at(address);
    let beneficiary = await myAuction.beneficiary.call();
    let auctionEndEpoch = await myAuction.auctionEnd.call();
    let auctionEnd = new Date(1000 * auctionEndEpoch["c"]).toUTCString();
    let metadata = await myAuction.metadata.call();
    let highestBidder = await myAuction.highestBidder.call();
    let highestBid = parseInt(await myAuction.highestBid.call());
    let collectionEnd = parseInt(await myAuction.collectionEnd.call());
    let idx = parseInt(await myAuction.state.call());
    let auctionStatus = states[idx];
    // if (auctionStatus = "Locked") {
    //     apiKey = await myAuction.retrieveKey.call();
    // }

    return {
      myAuction,
      beneficiary,
      auctionEnd,
      metadata,
      highestBidder,
      highestBid,
      collectionEnd,
      auctionStatus
    };
  }

  async handleChange(event) {
    let auctionAddress = event.target.value;
    let auction = await me.getAuctionInfo(auctionAddress);

    me.setState({
      auction,
      selectedAuction: auctionAddress
    });
  }

  async getApiKey () {
    me.props.notifier(null, false, false, true);
    let buyer = me.refs.buyerAddress.value;
    let apiKey = "No API Key available";
    for (const auctionAddr of me.state.auctions) {
      const info = await me.getAuctionInfo(auctionAddr);
        info.myAuction.retrieveKey.call()
        .then(function(api) {
            apiKey += api + "\n";
        }, function(error) {
            console.log("Cannot get API Key")
        })
    }

    me.props.notifier(
      "API Key: " + apiKey,
      false,
      false
    );
  }

  async getMoney () {
    me.props.notifier(null, false, false, true);
    let buyer = me.refs.buyerAddress.value;
    for (const auctionAddr of me.state.auctions) {
      const info = await me.getAuctionInfo(auctionAddr);
       info.myAuction.withdrawReward.call()
        .then(function(api) {
          me.props.notifier(
            "Money sent.",
            false,
            false
          );
        }, function(error) {
            console.log("Cannot get money yet")
        })
    }
  }
  
  render() {
    if (this.state.auction)
      var {
        beneficiary,
        auctionStatus
      } = this.state.auction;
      
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
                    <td>Auction ID</td>
                    <td>
                      <select
                        className="form-control"
                        value={this.state.selectedAuction}
                        onChange={this.handleChange}
                      >
                        {this.state.auctions.map(auction => (
                          <option value={auction}>{auction}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Beneficiary</td>
                    <td>{beneficiary}</td>
                  </tr>
                  <tr>
                    <td>Buyer Address</td>
                    <td>
                      <input
                        className="form-control"
                        ref="buyerAddress"
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
                    onClick={this.getMoney}
                  >
                    Send Data Hash
                  </a>
                </div>
                <div className="col-md-3">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.getApiKey}
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

Settlement.propTypes = {
  auctionId: PropTypes.string.isRequired,
  auctioneerId: PropTypes.string.isRequired,
  notifier: PropTypes.func.isRequired
};