//react and Front End imports
import React, { Component } from 'react';
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

export default class CreateAuction extends Component {

  // componentDidMount() {}
  // componentWillUnmount() {}
  

  constructor (props) {

    super(props);
      //the url should come from config /props
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
     console.warn("webb3 connected  " + web3 );
     AuctionFactory.setProvider(web3.currentProvider);
     Auction.setProvider(web3.currentProvider);
    
      me = this;
        
  }

  componentDidMount() {
    this.props.notifier(null,false,false,true);

  }

  createAuction = () => {

      this.props.notifier(null, false, false, true);

       try {
          let beneficiary = this.refs.beneficiary.value; 
          let metadata = this.refs.metadata.value; 
          let sellerHash = this.refs.sellerHash.value;
          let collectionPeriod = this.refs.collectionPeriod.value;
          let biddingTime = this.refs.biddingTime.value;
    

          ///// CHANGE TO USER AUTH
          var unlocked = web3.personal.unlockAccount(beneficiary, 'welcome123', 10);
          //var info = '';
          console.log('unlocked' + unlocked);
        //   // if(!unlockaccount(auctioneerHash, phrase)) {
        //   //   return;
        //   }
          // var me = this;

          AuctionFactory.deployed().then(function(factoryInstance) {
            console.log("AuctionFactory " + factoryInstance);
            // me.writeMsg("TEEETETE", false, false);
            factoryInstance.createAuction( biddingTime, beneficiary, collectionPeriod, sellerHash, metadata,{gas:1500000,from:beneficiary}).then(function(auction) {
                me.props.notifier("Auction created for "+ beneficiary, false, false);
                me.props.onAuctionDetails(auction, beneficiary);
             });
          });
        } catch (err) {
            me.props.notifier("Error creating auction "+ err, true, false);
        }

  }


  render() {
    
    return (
        
            <form>
              <div className="card mb-3">
                <div className="card-header"> Create Auction</div>
                <div className="card-body">

                  <div className="form-group">
                    <label htmlFor="beneficiary">Beneficiary</label>
                    <input className="form-control" ref="beneficiary"  defaultValue="0x0Ea55fd4140012e999a0c397DCcf2d2FD46bf112" placeholder="Beneficiary" />
                  </div>

                  <div className="form-group">
                    <div className="form-row">
                      <div className="col-md-6">
                        <label htmlFor="metadata">Metadata</label>
                        <input className="form-control" ref="metadata" placeholder="Metadata" />
                      </div>                    
                      <div className="col-md-6">
                        <label htmlFor="sellerHash">Seller Hash</label>
                        <input className="form-control" ref="sellerHash" aria-describedby="nameHelp" placeholder="Seller Hash" />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="form-row">
                      <div className="col-md-6">
                        <label htmlFor="collectionPeriod">Collection Period</label>
                        <input className="form-control" ref="collectionPeriod" type="number" min="1"  placeholder="Collection Period" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="biddingTime">Bidding Time</label>
                        <input className="form-control" ref="biddingTime" type="number" min="1" placeholder="Duration in Hours" />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-row">
                      <div className="col-md-4">
                          <a className="btn btn-primary btn-block" onClick={this.createAuction}>Create</a>
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
  notifier : PropTypes.func.isRequired

}


