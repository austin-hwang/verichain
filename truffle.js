var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "effort spawn traffic raw senior age disease solve solar pig cattle extra"
module.exports = {
  migrations_directory: "./migrations",
  // contracts_build_directory: "./src/contracts",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/gLzEkcUhupmDJ4vBbrrN")
      },
      network_id: 3,
      gas: 4612388
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 500
    }
  } 
};