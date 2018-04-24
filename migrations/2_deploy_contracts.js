var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var TutorialToken = artifacts.require("./TutorialToken.sol");
var ComplexStorage = artifacts.require("./ComplexStorage.sol");
var Auction = artifacts.require("./Auction.sol");
var AuctionFactory = artifacts.require("./AuctionFactory.sol");
var dataAuction = artifacts.require("./dataAuction.sol");
var AuctionEscrow = artifacts.require("./AuctionEscrow.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(TutorialToken);
  deployer.deploy(ComplexStorage);
  deployer.deploy(AuctionFactory);
};
