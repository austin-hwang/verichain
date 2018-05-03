//react and Front End imports
import React, { Component } from "react";

import CreateAuction from "./Create.js";
import AuctionDetails from "./Details.js";
import PurchaseTicket from "./PurchaseTicket.js";
import Settlement from "./Settlement.js";
import Login from "./Login.jsx";

import { watchEvents } from "./event-watcher.js";

class App extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    const userId = window.localStorage.getItem("userId") ? window.localStorage.getItem("userId").toLowerCase() : null;
    const privateKey = window.localStorage.getItem("privateKey");
    const relevantAuctions = window.localStorage.getItem("relevantAuctions");
    this.state = {
      curAuction: null,
      auctionId: null,
      sub_feature: userId ? "View" : "Login",
      message: null,
      relevantAuctions: relevantAuctions ? JSON.parse(relevantAuctions) : [], // ie. auctions you have bidded on that havent ended.
      userId: userId,
      privateKey: privateKey ? privateKey : null
    };
  }

  updateStatus = (msgVal, isErr, append, clear) => {
    if (clear) {
      this.setState({ message: null });
      return;
    }

    if (isErr) {
      msgVal = "<font color='red'>" + msgVal + "</font>";
    }
    msgVal = "<p>" + msgVal + "</p>";
    if (append && this.state.message) {
      msgVal = this.state.message + msgVal;
    }
    this.setState({ message: msgVal });
  };

  setAuctionDetails = (pAuction, pAuctioneerId) => {
    this.setState({ auctioneerId: pAuctioneerId });
  };

  

  addRelevantAuction = addr => {
    const newAuctions = Array.from(
      new Set(this.state.relevantAuctions.concat(addr))
    );
    window.localStorage.setItem(
      "relevantAuctions",
      JSON.stringify(newAuctions)
    );
    this.setState({
      relevantAuctions: newAuctions
    });
  };

  setAuctionId = (pAuctionObj, pAuctionId) => {
    if (pAuctionObj) {
      this.setState({ auctionId: pAuctionId });
      // start listening to events when the auction is created
      // watchEvents(pAuctionObj, pAuctionId, this.updateStatus);
    }
  };

  render() {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top"
          id="mainNav"
        >
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav navbar-sidenav" id="exampleAccordion">
              <li
                className="nav-item"
                data-toggle="tooltip"
                data-placement="right"
                title="Auction Management"
              >
                <a
                  onClick={() => {
                    this.setState({ sub_feature: "view" });
                  }}
                  className="nav-link nav-link-collapse collapsed"
                  data-toggle="collapse"
                  href="#collapseExamplePages"
                  data-parent="#exampleAccordion"
                >
                  <span className="nav-link-text">Auction Management</span>
                </a>
                <ul className="sidenav-second-level" id="collapseExamplePages">
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "Login" });
                      }}
                    >
                      Login
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "Create" });
                      }}
                    >
                      Create
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "View" });
                      }}
                    >
                      View
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "Withdraw" });
                      }}
                    >
                      Withdraw
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "Verification" });
                      }}
                    >
                      Verification
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ feature: "A" });
                        this.setState({ sub_feature: "Delete" });
                      }}
                    >
                      Remove
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="container-fluid">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active">Auction</li>
              <li className="breadcrumb-item">{this.state.sub_feature}</li>
            </ol>

            <div>
              <div dangerouslySetInnerHTML={{ __html: this.state.message }} />
            </div>
            {this.state.sub_feature === "Login" && (
              <Login
                onLogin={(userId, privateKey) =>
                  this.setState({
                    sub_feature: "View",
                    userId: userId,
                    privateKey: privateKey
                  })
                }
              />
            )}
            {this.state.sub_feature === "Create" && (
              <CreateAuction
                onAuctionDetails={this.setAuctionDetails}
                notifier={this.updateStatus}
              />
            )}

            {this.state.sub_feature === "View" && (
              <AuctionDetails
                userId={this.state.userId}
                privateKey={this.state.privateKey}
                onAuctionId={this.setAuctionId}
                notifier={this.updateStatus}
                onBid={this.addRelevantAuction}
                relevantAuctions={this.state.relevantAuctions}
              />
            )}

            {this.state.sub_feature === "Withdraw" && (
              <PurchaseTicket
                auctionId={this.state.auctionId}
                notifier={this.updateStatus}
              />
            )}

            {this.state.sub_feature === "Verification" && (
              <Settlement
                userId={this.state.userId}
                auctionId={this.state.setAuctionId}
                notifier={this.updateStatus}
                auctions={this.state.relevantAuctions}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
