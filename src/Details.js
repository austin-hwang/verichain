//react and Front End imports
import React, { Component } from 'react';
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3} from 'web3';

//contracts
import { default as contract } from 'truffle-contract'
import auctionFactory from './contracts/AuctionFactory.json'
import auction from './contracts/dataAuction.json'

//var watching = false; //start watching to events only
// var passwd = false;

var web3 = null;
var AuctionFactory = contract(auctionFactory);
var Auction = contract(auction);

//variable to refer to currnet component context
// else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
var me = null;

export default class AuctionDetails extends Component {

  constructor (props) {
    super(props);
      //the url should come from config /props
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
     console.warn("webb3 connected  " + web3 );
     AuctionFactory.setProvider(web3.currentProvider);
     Auction.setProvider(web3.currentProvider);

      this.state = {
        auctions: [],
        auction: null,
        selectedAuction: '',
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
    this.setState({auctions});

    this.handleChange = this.handleChange.bind(this);
  }

  async getAuctionInfo(address) {
    let myAuction = await Auction.at(address);
    let beneficiary = await myAuction.beneficiary.call();
    let auctionEndEpoch = await myAuction.auctionEnd.call();
    let auctionEnd = new Date(1000 * auctionEndEpoch['c']).toUTCString();
    let metadata = await myAuction.metadata.call();
    let highestBidder = await myAuction.highestBidder.call();
    let highestBid = parseInt(await myAuction.highestBid.call());
    let collectionEnd = parseInt(await myAuction.collectionEnd.call());
    //let incomplete = await myAuction.incomplete.call();
    //let auctionStatus = incomplete ? 'Active' : 'Expired';

    return {
      beneficiary,
      auctionEnd,
      metadata,
      highestBidder,
      highestBid,
      collectionEnd,
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

  render() {
    if (this.state.auction)
      var { beneficiary, auctionEnd, metadata, highestBidder, highestBid, collectionEnd, auctionStatus } = this.state.auction

    return (
      <form>
        <div className="card mb-3">
          <div className="card-header"> Auction Details</div>
          <div className="card-body">
            <div className="table-responsive">
              {this.state.auction ? (
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <tbody>
                    <tr>
                      <td>Auction Id</td>
                      <td>
                        <select className="form-control" value={this.state.selectedAuction} onChange={this.handleChange}>
                          {this.state.auctions.map(auction => <option value={auction}>{auction}</option>)}
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
                      <td>{metadata}</td>
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
                    <tr>
                      <td>Auction Status</td>
                      <td>{auctionStatus}</td>
                    </tr>
                    </tbody>
                  </table>
                ) :
                (
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                    <tbody>
                    <tr>
                      <td>Auction Id</td>
                      <td>
                        <select className="form-control" value={this.state.selectedAuction}
                                onChange={this.handleChange}>
                          {this.state.auctions.map(auction => <option value={auction}>{auction}</option>)}
                        </select>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>
        </div>
      </form>
    );
  }
}



