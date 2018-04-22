//react and Front End imports
import React, {Component } from 'react';
import PropTypes from 'prop-types';
//import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'

//Eth libraries
import { default as Web3} from 'web3';

//contracts
import { default as contract } from 'truffle-contract'
import auctionFactory from './contracts/AuctionFactory.json'
import auction from './contracts/Auction.json'
import {TxnConsensus} from './block-verify.js';
import Auth from './auth.js'

    var web3 = null;
    var AuctionFactory = contract(auctionFactory);
    var Auction = contract(auction);

    //variable to refer to currnet component context
    // else ctx is not visible from anonymous functions and we cant call other functions like writeMsg
    var me = null;



export default class BidAuction extends Component {

  // componentDidMount() {}
  // componentWillUnmount() {}
  

  constructor (props) {

    super(props);
      //the url should come from config /props
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
     console.warn("webb3 connected  " + web3 );
     AuctionFactory.setProvider(web3.currentProvider);
     Auction.setProvider(web3.currentProvider);

     this.state = { 
      doAuth: false,
      bidder: '0x3ad78130DCff93d6c942c37aA45F0A004A0Ffe0C',
      amt: null

    };

      me = this;
        
  }



  askAuth = () => {
    
    this.props.notifier(null, false, false, true);

    let bidAmount = this.refs.txtBidAmount.value; 
    if(!bidAmount || bidAmount < 1) {
      this.props.notifier("Invalid Bid Amount ", true, false);
      return;
    }
    this.setState({bidder: this.refs.txtBidderId.value});
    this.setState({amt: this.refs.txtBidAmount.value});
    this.setState({doAuth: true});
  }

  doAuth = (authStatus, returnProps) => {

    //close the auth screen
    this.setState({doAuth: false});
    if(!authStatus) {
      me.props.notifier('Transaction Auth Cancelled!', false, false);
      return;
    }
        
    this.bid();
        
  }


   bid = () => {
    
    this.props.notifier(null, false, false, true);

    let bidder = this.state.bidder; 
    let bidAmount = this.state.amt; 

    console.log('bid details '+ bidder + " " + bidAmount);
    
    console.log('Auction id from props ' + this.props.auctionId);

      var bidAuction = Auction.at(this.props.auctionId);

      console.log('got auction ' + bidAuction);

      // var unlocked = web3.personal.unlockAccount(bidder, 'welcome123', 10);
      // console.log('unlocked ' + unlocked);

      bidAuction.bid.sendTransaction(bidAmount, {gas: 4000000, from:bidder}).then(function(txnHash) {
        console.log("Transaction Id " + txnHash, false, false);
        //Magic Numbers : wait for 3 confirmations at 4000ms intervals for 4 repetitions
        //these three params should be configs. change to 12 confirmations eventually
        TxnConsensus(web3, txnHash, 3, 4000, 4, function(err, receipt) { 
          // console.log("Got result from block confirmation");
          if(receipt) {
            console.log("receipt blockHash " + receipt.blockHash);
            console.log("receipt blockNumber " + receipt.blockNumber);
            console.log("receipt transactionIndex " + receipt.transactionIndex);            
          } else {
            console.log("err from poll " + err);
            me.props.notifier("Error bidding for ticket " + err, true, false);
          }
        });
      });
       

} // getDetails


  render() {
    return (
    <div>

      { this.state.doAuth &&
        <Auth resultCallback={this.doAuth} bidderId={this.refs.txtBidderId.value} />

      }


    {!this.state.doAuth &&
     <form>
        <div className="card mb-3">
          <div className="card-header">Bid for Ticket</div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                  <tbody>
                    
                    <tr>
                      <td>Auction Id</td>
                      <td>{this.props.auctionId}</td>
                    </tr>
                    <tr>
                      <td>Bidder Id</td>
                      <td><input className="form-control" ref="txtBidderId"  defaultValue={this.state.bidder}  placeholder="Bidder Address" /></td>
                    </tr>
                    <tr>
                      <td>Bid Amount</td>
                      <td><input className="form-control" ref="txtBidAmount" type='number' defaultValue={this.state.amt} placeholder="Bid Amount" /></td>
                    </tr>

                  </tbody>
                </table>                
              </div>
              <div className="form-group">
                <div className="form-row">
                  <div className="col-md-6">
                      <a className="btn btn-primary btn-block" onClick={this.askAuth}>Bid</a>
                  </div>
                </div>
              </div>              
          </div>
        </div>
      </form>
      }

      
    </div>
    );
  }
}


BidAuction.propTypes = {
  auctionId: PropTypes.string.isRequired,
  notifier : PropTypes.func.isRequired

}


