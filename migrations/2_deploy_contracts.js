var AuctionFactory = artifacts.require("./AuctionFactory.sol");
var dataAuction = artifacts.require("./dataAuction.sol");

module.exports = function(deployer) {
  deployer.deploy(AuctionFactory);
};
