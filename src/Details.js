//react and Front End imports
import React, { Component } from "react";
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3 } from "web3";

//contracts
import { default as contract } from "truffle-contract";
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/dataAuction.json";

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

function formatMetadata(metadata) {
  metadata = JSON.parse(metadata);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Type</th>
          <th>Sensors</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{metadata.name}</td>
          <td>{metadata.description}</td>
          <td>{metadata.type}</td>
          <td>
            <table>
              <thead>
                <tr>
                  <th>Sensor Name</th>
                  <th>Type</th>
                  <th>Unit</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metadata.properties).map(
                  ([key, properties]) => (
                    <tr>
                      <td>{key}</td>
                      <td>{properties.type}</td>
                      <td>{properties.unit}</td>
                      <td>{properties.description}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

const states = ['Open', 'Locked', 'Completed', 'Incomplete'];

export default class AuctionDetails extends Component {
  constructor(props) {
    super(props);
    //the url should come from config /props
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.warn("webb3 connected  " + web3);
    AuctionFactory.setProvider(web3.currentProvider);
    Auction.setProvider(web3.currentProvider);

    this.state = {
      auctions: [],
      auction: null,
      selectedAuction: "",
    };

    me = this;
  }

  async componentDidMount() {
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

    return {
      beneficiary,
      auctionEnd,
      metadata,
      highestBidder,
      highestBid,
      collectionEnd,
      auctionStatus
    };
  }

  async bid() {
    let auction = this.state.selectedAuction;
    let bidder = this.refs.txtBidderId.value;
    let bidAmount = this.refs.txtBidAmount.value;
    let phrase = this.refs.txtPrivateKey.value;

    if (auction) {
      let unlocked = await web3.personal.unlockAccount(bidder, phrase, 10);
      console.log(unlocked);
      console.log(bidAmount + bidder);

      let bidAuction = await Auction.at(auction);
      let txnHash = await bidAuction.bid.sendTransaction({gas: 2000000, value: bidAmount, from: bidder});
      console.log("Transaction Id " + txnHash)

      let auctionInfo = await me.getAuctionInfo(auction);

      me.setState({
        auction: auctionInfo,
      });
    }
  }

  async handleChange(event) {
    let auctionAddress = event.target.value;
    let auction = await me.getAuctionInfo(auctionAddress);

    me.setState({
      auction,
      selectedAuction: auctionAddress
    });
  }

  render() {
    if (this.state.auction)
      var {
        beneficiary,
        auctionEnd,
        metadata,
        highestBidder,
        highestBid,
        collectionEnd,
        auctionStatus
      } = this.state.auction;

    return (
      <form>
        <div className="card mb-3">
          <div className="card-header"> Auction Details</div>
          <div className="card-body">
            <div className="table-responsive">
              {this.state.auction ? (
                <table
                  className="table table-bordered"
                  id="dataTable"
                  width="100%"
                  cellSpacing="0"
                >
                  <tbody>
                    <tr>
                      <td>Auction Id</td>
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
                      <td>Auction End</td>
                      <td>{auctionEnd}</td>
                    </tr>
                    <tr>
                      <td>Metadata</td>
                      <td>{formatMetadata(metadata)}</td>
                    </tr>
                    <tr>
                      <td>Highest Bidder</td>
                      <td>{highestBidder}</td>
                    </tr>
                    <tr>
                      <td>Highest Bid</td>
                      <td>{highestBid}</td>
                    </tr>
                    <tr>
                      <td>Collection End</td>
                      <td>{collectionEnd}</td>
                    </tr>
                    <tr style={{borderBottom: "5px solid #000"}}>
                      <td>Auction Status</td>
                      <td>{auctionStatus}</td>
                    </tr>
                    <tr>
                      <td>Bidder Id</td>
                      <td><input className="form-control" ref="txtBidderId"  defaultValue={'0x29E31f7f33dA4835741572dD34CBed5449F9EaD8'}  placeholder="Bidder Address" /></td>
                    </tr>
                    <tr>
                      <td>Private Key</td>
                      <td><input className="form-control" ref="txtPrivateKey"  defaultValue={'f68538c02fdac6099a24985a30f37b41b859238a6d3c0d4d9ee8c492cc58b45c'}  placeholder="Bidder Address" /></td>
                    </tr>
                    <tr>
                      <td>Bid Amount</td>
                      <td><input className="form-control" ref="txtBidAmount" type='number' defaultValue={0} placeholder="Bid Amount" /></td>
                    </tr>
                    <tr>
                      <a className="btn btn-primary btn-block" onClick={() => this.bid()}>Bid</a>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <table
                  className="table table-bordered"
                  id="dataTable"
                  width="100%"
                  cellSpacing="0"
                >
                  <tbody>
                    <tr>
                      <td>Auction Id</td>
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
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
}
