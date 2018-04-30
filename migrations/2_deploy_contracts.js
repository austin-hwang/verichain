var Auction = artifacts.require("./Auction.sol");
var AuctionFactory = artifacts.require("./AuctionFactory.sol");
var dataAuction = artifacts.require("./dataAuction.sol");
var AuctionEscrow = artifacts.require("./AuctionEscrow.sol");

module.exports = function(deployer) {
  deployer.deploy(AuctionFactory);
};
