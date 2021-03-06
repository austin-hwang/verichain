//react and Front End imports
import React, { Component } from "react";

import CreateAuction from "./Create.js";
import AuctionDetails from "./Details.js";
import Login from "./Login.jsx";

class App extends Component {
  // componentDidMount() {}
  // componentWillUnmount() {}

  constructor(props) {
    super(props);
    const userId = window.localStorage.getItem("userId")
      ? window.localStorage.getItem("userId").toLowerCase()
      : null;
    const privateKey = window.localStorage.getItem("privateKey");
    const relevantAuctions = window.localStorage.getItem("relevantAuctions");
    const completedAuctions = window.localStorage.getItem("completedAuctions");
    this.state = {
      curAuction: null,
      auctionId: null,
      sub_feature: userId ? "View" : "Login",
      message: null,
      relevantAuctions: relevantAuctions ? JSON.parse(relevantAuctions) : [], // ie. auctions you have bidded on that havent ended.
      userId: userId,
      privateKey: privateKey ? privateKey : null,
      completedAuctions: completedAuctions ? JSON.parse(completedAuctions) : []
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

  completeAuction = addr => {
    const prunedAuctions = this.state.relevantAuctions.filter(
      val => val !== addr
    );
    const completedAuctions = Array.from(
      new Set(this.state.completedAuctions.concat(addr))
    );
    this.setState({
      relevantAuctions: prunedAuctions,
      completedAuctions: completedAuctions
    });
    window.localStorage.setItem(
      "relevantAuctions",
      JSON.stringify(prunedAuctions)
    );
    window.localStorage.setItem(
      "completedAuctions",
      JSON.stringify(completedAuctions)
    );
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
      this.state.userId ? 
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
                        window.localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Logout
                    </a>
                  </li>
                  {/* <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "Create" });
                      }}
                    >
                      Create
                    </a>
                  </li> */}
                  <li>
                    <a
                      onClick={() => {
                        this.setState({ sub_feature: "View" });
                      }}
                    >
                      View
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="container-fluid">

            <div>
              <div dangerouslySetInnerHTML={{ __html: this.state.message }} />
            </div>
            {this.state.sub_feature === "Create" && (
              <CreateAuction
                web3={this.props.web3}
                onAuctionDetails={this.setAuctionDetails}
                notifier={this.updateStatus}
              />
            )}

            {this.state.sub_feature === "View" && (
              <AuctionDetails
                web3={this.props.web3}
                userId={this.state.userId}
                privateKey={this.state.privateKey}
                onAuctionId={this.setAuctionId}
                notifier={this.updateStatus}
                onBid={this.addRelevantAuction}
                completeAuction={this.completeAuction}
                relevantAuctions={this.state.relevantAuctions}
              />
            )}
          </div>
        </div>
      </div>
      : 
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
                </ul>
              </li>
            </ul>
          </div>
        </nav>

        <div className="content-wrapper">
          <div className="container-fluid">

            <div>
              <div dangerouslySetInnerHTML={{ __html: this.state.message }} />
            </div>
            {this.state.sub_feature === "Login" && (
              <Login
                onLogin={(userId, privateKey) =>
                  {if (userId === "" || privateKey === "") {
                    window.location.reload();
                  } else {
                    this.setState({
                      sub_feature: "View",
                      userId: userId,
                      privateKey: privateKey
                    })
                  }}
                }
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
