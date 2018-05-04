import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import Web3 from 'web3';


window.addEventListener('load', function() {
    var web3Provided;
    // Supports Metamask and Mist, and other wallets that provide 'web3'.
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'production') {
        web3Provided = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
        console.log("Entered localhost")
    }
    else if (typeof web3 !== 'undefined') {
        web3Provided = new Web3(window.web3.currentProvider);
        console.log("Entered rpc")
    }

    ReactDOM.render(<App web3={web3Provided}/>, document.getElementById("root"));
    registerServiceWorker();
});