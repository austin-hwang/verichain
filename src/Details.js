//react and Front End imports
import React, { Component } from "react";
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3 } from "web3";

//contracts
import { default as contract } from "truffle-contract";
import auctionFactory from "./contracts/AuctionFactory.json";
import auction from "./contracts/dataAuction.json";
import { BounceLoader } from "react-spinners";

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

const sensors = [
  "any",
  "humidity",
  "temperature",
  "voiceSearches",
  "fridgeContents",
  "heartRate",
  "moisture"
];

const units = ["any", "bpm", "percent", "celsius", "farenheight"];
const dataTypes = ["any", "string", "number", "picture"];

function minBidPrice(searchResults) {
  return searchResults
    ? Object.entries(searchResults).reduce(
        (cur, [key, val]) => cur + val.highestBid,
        0
      ) + Object.keys(searchResults).length
    : 0;
}

function propertiesIncludes(properties, val) {
  if (val === "any") {
    return true;
  }
  return (
    Object.values(properties).filter(sensor =>
      Object.values(sensor).includes(val)
    ).length !== 0
  );
}

function formatMetadata(metadata) {
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

const states = ["Open", "Locked", "Completed", "Incomplete"];

export default class AuctionDetails extends Component {
  constructor(props) {
    super(props);
    //the url should come from config /props
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    console.warn("webb3 connected  " + web3);
    AuctionFactory.setProvider(web3.currentProvider);
    Auction.setProvider(web3.currentProvider);

    this.state = {
      searchResults: null,
      auctions: [],
      auction: null,
      selectedAuction: "",
      loading: false,
      relevantAuctionsView: false
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
    this.handleChange = this.handleChange.bind(this);
  }

  async getAuctionInfo(address) {
    let myAuction = await Auction.at(address);
    let beneficiary = await myAuction.beneficiary.call();
    let auctionEnd = (await myAuction.auctionEnd.call())["c"] * 1000;
    let metadata = JSON.parse(await myAuction.metadata.call());
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
  async endAuctions(
    auction = this.state.selectedAuction,
    bidder = this.props.userId,
    phrase = this.props.privateKey
  ) {
    if (auction) {
      let unlocked = await web3.personal.unlockAccount(bidder, phrase, 10);
      let bidAuction = await Auction.at(auction);
      try {
        const result = await bidAuction.endAuction({ from: bidder });
        console.log(await bidAuction.state.call());
      } catch (e) {
        console.log(e);
      }

      this.refreshResult(auction);
    }
  }

  async bid(
    auction = this.state.selectedAuction,
    bidAmount = this.refs.txtBidAmount.value,
    bidder = this.props.userId,
    phrase = this.props.privateKey
  ) {
    if (auction) {
      let unlocked = await web3.personal.unlockAccount(bidder, phrase, 10);
      console.log("Balance: ", web3.fromWei(web3.eth.getBalance(bidder)));
      console.log("Unlocked: " + unlocked);
      console.log(bidAmount, bidder);

      let bidAuction = await Auction.at(auction);
      try {
        let txnHash = await bidAuction.bid.sendTransaction({
          gas: 2000000,
          value: bidAmount,
          from: bidder
        });

        console.log("Transaction Id " + txnHash);
      } catch (e) {
        console.log(e.message);
      }
      this.refreshResult(auction);
      this.props.onBid(auction);
    }
  }

  getRelevantAuctions = async () => {
    this.setState({ loading: true });
    let auctionDetails = {};
    for (const addr of this.props.relevantAuctions) {
      auctionDetails[addr] = await this.getAuctionInfo(addr);
    }

    this.setState({
      searchResults: auctionDetails,
      selectedAuction: this.props.relevantAuctions.length
        ? this.props.relevantAuctions[0]
        : "",
      loading: false,
      relevantAuctionsView: true
    });
  };

  getApiKey = async auctionAddr => {
    me.props.notifier(null, false, false, true);
    let buyer = this.props,
      userId;
    let apiKey = await (await Auction.at(auctionAddr)).retrieveKey.call();
    return apiKey;
  };
  collectKeys = async () => {
    await this.endExpired();
    for (const addr of this.props.relevantAuctions.filter(
      addr =>
        this.state.searchResults[addr].auctionStatus === "Locked" &&
        this.props.userId === this.state.searchResults[addr].highestBidder
    )) {
      console.log(await this.getApiKey(addr));
    }
  };

  endExpired = async () => {
    const now = Date.now();
    for (const addr of this.props.relevantAuctions.filter(
      addr =>
        this.state.searchResults[addr].auctionEnd < now &&
        this.state.searchResults[addr].auctionStatus === "Open"
    )) {
      this.endAuctions(addr);
    }
  };

  searchAuctions = async () => {
    this.setState({
      loading: true,
      relevantAuctionsView: false
    });
    const sensor = this.refs.sensorType.value;
    const unit = this.refs.unit.value;
    const dataType = this.refs.dataType.value;

    let searchResults = {};
    for (const auctionAddr of this.state.auctions) {
      const info = await this.getAuctionInfo(auctionAddr);
      if (Date.now() > info.auctionEnd) {
        continue;
      }
      if (
        !Object.keys(info.metadata.properties).includes(sensor) &&
        !sensor === "any"
      ) {
        continue;
      }
      if (!propertiesIncludes(info.metadata.properties, unit)) {
        continue;
      }
      if (!propertiesIncludes(info.metadata.properties, dataType)) {
        continue;
      }
      searchResults[auctionAddr] = info;
    }
    const queriedKeys = Object.keys(searchResults);
    this.setState({
      searchResults: searchResults,
      selectedAuction: queriedKeys.length ? queriedKeys[0] : "",
      loading: false
    });
  };

  async handleChange(event) {
    let auctionAddress = event.target.value;

    me.setState({
      selectedAuction: auctionAddress
    });
  }

  refreshResult = async addr => {
    this.state.searchResults[addr] = await this.getAuctionInfo(addr);

    this.setState({ searchResults: this.state.searchResults });
  };

  massBid = async () => {
    for (const [addr, { highestBid }] of Object.entries(
      this.state.searchResults
    )) {
      this.bid(addr, highestBid + 1);
    }
    this.refs.massBid.value = minBidPrice(this.state.searchResults);
  };
  massBid;
  render() {
    if (this.state.selectedAuction)
      var {
        beneficiary,
        auctionEnd,
        metadata,
        highestBidder,
        highestBid,
        collectionEnd,
        auctionStatus
      } = this.state.searchResults[this.state.selectedAuction];
    const minBid = minBidPrice(this.state.searchResults);
    return (
      <form>
        <div className="card mb-3">
          <div className="card-header"> Auction Details</div>
          <div className="card-body">
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-2">
                  <label htmlFor="sensorType">Sensor Type</label>
                  <select
                    className="form-control"
                    ref="sensorType"
                    id="sensorType"
                  >
                    {sensors.map(sensor => (
                      <option key={sensor} value={sensor}>
                        {sensor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="unit">Unit of Measure</label>
                  <select className="form-control" ref="unit" id="unit">
                    {units.map(unit => <option value={unit}>{unit}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="dataType">Data Type</label>
                  <select className="form-control" ref="dataType" id="dataType">
                    {dataTypes.map(dataType => (
                      <option key={dataType} value={dataType}>
                        {dataType}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="form-group">
              <div className="form-row">
                <div className="col-md-2">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.searchAuctions}
                  >
                    Search
                  </a>
                </div>
                <div className="col-md-2">
                  <a
                    className="btn btn-primary btn-block"
                    onClick={this.getRelevantAuctions}
                  >
                    Get Relevant Auctions
                  </a>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              {this.state.searchResults !== null && (
                <div className="form-group">
                  <div className="form-row">
                    <div className="col-md-2">
                      <input
                        className="form-control"
                        ref="massBid"
                        type="number"
                        min={minBid}
                        defaultValue={minBid}
                      />
                    </div>
                    <div className="col-md-2">
                      <a
                        className="btn btn-primary btn-block"
                        onClick={() => this.massBid()}
                      >
                        Mass Bid
                      </a>
                    </div>
                    {this.state.relevantAuctionsView && (
                      <div className="col-md-2">
                        <a
                          className="btn btn-primary btn-block"
                          onClick={this.collectKeys}
                        >
                          Collect Keys
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {this.state.selectedAuction && !this.state.loading ? (
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
                          defaultValue={this.state.selectedAuction}
                          onInput={this.handleChange}
                        >
                          {Object.keys(this.state.searchResults).map(
                            auction => (
                              <option key={auction} value={auction}>
                                {auction}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>Beneficiary</td>
                      <td>{beneficiary}</td>
                    </tr>
                    <tr>
                      <td>Auction End</td>
                      <td>{`In ${(auctionEnd - Date.now()) /
                        (60 * 1000)} minutes`}</td>
                    </tr>
                    <tr>
                      <td>Metadata</td>
                      <td>{formatMetadata(metadata)}</td>
                    </tr>
                    <tr>
                      <td>Highest Bidder</td>
                      <td>
                        {highestBidder === this.props.userId
                          ? `Me (${highestBidder})`
                          : highestBidder}
                      </td>
                    </tr>
                    <tr>
                      <td>Highest Bid</td>
                      <td>{highestBid}</td>
                    </tr>
                    <tr>
                      <td>Collection End</td>
                      <td>{collectionEnd}</td>
                    </tr>
                    <tr style={{ borderBottom: "5px solid #000" }}>
                      <td>Auction Status</td>
                      <td>{auctionStatus}</td>
                    </tr>
                    <tr>
                      <td>Bid Amount</td>
                      <td>
                        <input
                          className="form-control"
                          ref="txtBidAmount"
                          type="number"
                          defaultValue={highestBid + 1}
                          placeholder="Bid Amount"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <a
                          className="btn btn-primary btn-block"
                          onClick={() => this.bid()}
                        >
                          Bid
                        </a>
                      </td>
                      <td>
                        <a
                          className="btn btn-primary btn-block"
                          onClick={() => this.endAuctions()}
                        >
                          End Auction
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ display: "inline-block" }}>
                      <BounceLoader
                        color={"#6f42c1"}
                        loading={this.state.loading}
                      />
                      {this.state.searchResults !== null &&
                        !Object.keys(this.state.searchResults).length &&
                        !this.state.loading &&
                        "Your Search Returned No Results!"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
}
