//react and Front End imports
import React, {Component } from 'react';
import PropTypes from 'prop-types';
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

  // componentDidMount() {}
  // componentWillUnmount() {}
  

  constructor (props) {

    super(props);
      //the url should come from config /props
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
     console.warn("webb3 connected  " + web3 );
     AuctionFactory.setProvider(web3.currentProvider);
     Auction.setProvider(web3.currentProvider);

      this.state= {
          auctionId: null,
          beneficiary: null,
          auctionEnd: null,
          metadata: null,
          highestBidder: null,
          highestBid: null,
          collectionEnd: null,
      }

      me = this;
        
  }

  componentDidMount = () => {

    me.props.notifier(false, false, false, true);
    let auctioneerId = this.props.auctioneerId;

    AuctionFactory.deployed().then(function (factoryInstance) {
      factoryInstance.getAuction.call(auctioneerId).then(function (result) {
        console.warn("address of auction for  " + auctioneerId + " is " + result);
        Auction.at(result).then(myAuction => {
          me.props.onAuctionId(myAuction, result);

          me.setState({auctionId: result});

          myAuction.beneficiary.call().then(function (beneficiary) {
            me.setState({beneficiary});
          });

          myAuction.auctionEnd.call().then(function (auctionEnd) {
            const dateStr = new Date(1000 * auctionEnd['c']).toUTCString()
            me.setState({auctionEnd: dateStr});
          });

          myAuction.metadata.call().then(function (metadata) {
            me.setState({metadata});
          });

          myAuction.highestBidder.call().then(function (highestBidder) {
            me.setState({highestBidder});
          });
          myAuction.highestBid.call().then(function (highestBid) {
            me.setState({highestBid: highestBid['c']});
          });
          myAuction.collectionEnd.call().then(function (collectionEnd) {
            me.setState({collectionEnd: collectionEnd['c']});
          });
          myAuction.incomplete.call().then(function (status) {
            if (status)
              me.setState({auctionStatus: 'Active'});
            else
              me.setState({auctionStatus: 'Expired'});
          });
        });
      });
    });
  }


  render() {
    
    return (
      <form>
        <div className="card mb-3">
          <div className="card-header"> Auction Details</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                  <tbody>
                  
                    <tr>
                      <td>Auctioneer Address</td>
                      <td><input className="form-control" ref="auctioneerId"  defaultValue={this.props.auctioneerId} placeholder="Enter Auctioneer Address" /></td>
                    </tr>
                    <tr>
                      <td>Auction Id</td>
                      <td>{this.state.auctionId}</td>
                    </tr>
                    <tr>
                      <td>Beneficiary</td>
                      <td>{this.state.beneficiary}</td>
                    </tr>
                    <tr>
                      <td>Auction End</td>
                      <td>{this.state.auctionEnd}</td>
                    </tr>
                    <tr>
                      <td>Metadata</td>
                      <td>{this.state.metadata}</td>
                    </tr>
                    <tr>
                      <td>Highest Bidder</td>
                      <td>{this.state.highestBidder}</td>
                    </tr>
                    <tr>
                      <td>Highest Bid</td>
                      <td>{this.state.highestBid}</td>
                    </tr>
                    <tr>
                      <td>Collection End</td>
                      <td>{this.state.collectionEnd}</td>
                    </tr>
                  </tbody>
                </table>                
              </div>
          </div>
        </div>
      </form>
    );
  }
}


AuctionDetails.propTypes = {
   auctioneerId: PropTypes.string.isRequired,
    onAuctionId: PropTypes.func.isRequired,
    notifier: PropTypes.func.isRequired,
//   totalTickets: PropTypes.number,
//   ticketPerPerson: PropTypes.number,
//   lastBidder: PropTypes.string,
//   lastBid: PropTypes.number,
//   highestBidder: PropTypes.string,
//   highestBid: PropTypes.number,
//   balanceTikets: PropTypes.number,
//   auctionStatus: PropTypes.string
}



