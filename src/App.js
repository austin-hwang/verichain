//react and Front End imports
import React, { Component } from "react";

import CreateAuction from "./Create.js";
import AuctionDetails from "./Details.js";
import PurchaseTicket from "./PurchaseTicket.js";
import Settlement from "./Settlement.js";
import Login from "./Login.jsx"


import { watchEvents } from "./event-watcher.js";

class App extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    this.state = {
      currAuction: null,
      auctionId: null,
      sub_feature: "Login",
      message: null,
      userId: null
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
                onLogin={userId =>
                  this.setState({ sub_feature: "View", userId: userId })
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
                auctioneerId={this.state.userId}
                onAuctionId={this.setAuctionId}
                notifier={this.updateStatus}
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
                auctioneerId={this.state.auctioneerId}
                auctionId={this.state.auctionId}
                notifier={this.updateStatus}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
