var sha256 = require('js-sha256');
//react and Front End imports
import React, { Component } from "react";
import PropTypes from "prop-types";
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3 } from "web3";

//contracts
import { default as contract } from "truffle-contract";
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/dataAuction.json";
import sampleMetadata from "./sampleMetadata.json";

//var watching = false; //start watching to events only
// var passwd = false;

var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

export default class CreateAuction extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    //the url should come from config /props
    AuctionFactory.setProvider(this.props.web3.currentProvider);
    Auction.setProvider(this.props.web3.currentProvider);
    me = this;
  }

  async componentDidMount() {
    this.props.notifier(null, false, false, true);
    this.props.web3.eth.getAccounts(function(error, accounts) {
        me.refs.beneficiary.value = accounts[0];
        console.log(accounts[0]);
    });
  }

  setupSampleAuctions = () => {
    sampleMetadata.forEach(metadata => {
      this.refs.metadata.value = JSON.stringify(metadata);
      this.createAuction();
    });
  };
  createAuction = () => {
    this.props.notifier(null, false, false, true);

    try {
      let beneficiary = this.refs.beneficiary.value;
      let metadata = this.refs.metadata.value;
      let sellerHash = this.refs.sellerHash.value;
      let collectionPeriod = this.refs.collectionPeriod.value;
      let biddingTime = this.refs.biddingTime.value;
      let apiKey = this.refs.apiKey.value;

      ///// CHANGE TO USER AUTH
      //   // if(!unlockaccount(auctioneerHash, phrase)) {
      //   //   return;
      //   }
      // var me = this;

      AuctionFactory.deployed().then(function(factoryInstance) {
        console.log("AuctionFactory " + factoryInstance);
        // me.writeMsg("TEEETETE", false, false);
        factoryInstance
          .createAuction(
            biddingTime,
            beneficiary,
            collectionPeriod,
            sellerHash,
            metadata,
            apiKey,
            { gas: 1500000, from: beneficiary }
          )
          .then(function(auction) {
            me.props.notifier(
              "Auction created for " + beneficiary,
              false,
              false
            );
            me.props.onAuctionDetails(auction, beneficiary);
          });
      });
    } catch (err) {
      me.props.notifier("Error creating auction " + err, true, false);
    }
  };

  render() {
    return (
      <form>
        <div className="card mb-3">
          <div className="card-header"> Create Auction</div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="beneficiary">Beneficiary</label>
              <input
                className="form-control"
                ref="beneficiary"
                placeholder="Beneficiary"
              />
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-md-6">
                  <label htmlFor="metadata">Metadata</label>
                  <input
                    className="form-control"
                    ref="metadata"
                    placeholder="Metadata"
                    defaultValue={JSON.stringify(sampleMetadata[0])}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="sellerHash">Seller Hash</label>
                  <input
                    className="form-control"
                    ref="sellerHash"
                    aria-describedby="nameHelp"
                    placeholder="Seller Hash"
                    defaultValue={"0x" + sha256("12345678910")}
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-6">
                  <label htmlFor="collectionPeriod">Collection Period</label>
                  <input
                    className="form-control"
                    ref="collectionPeriod"
                    type="number"
                    min="1"
                    defaultValue="120"
                    placeholder="Collection Period in Seconds"
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="biddingTime">Bidding Time</label>
                  <input
                    className="form-control"
                    ref="biddingTime"
                    type="number"
                    defaultValue="120"
                    min="1"
                    placeholder="Duration in Seconds"
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="biddingTime">API Key</label>
                  <input
                    className="form-control"
                    ref="apiKey"
                    placeholder="API Key"
                    defaultValue="hari_is_a_cutiepie"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div className="form-row">
                <div className="col-md-4">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.createAuction}
                  >
                    Create
                  </a>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-4">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.setupSampleAuctions}
                  >
                    Setup Sample Auctions
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

CreateAuction.propTypes = {
  onAuctionDetails: PropTypes.func.isRequired,
  notifier: PropTypes.func.isRequired
};
