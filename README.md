
# Enabling the Dissemination of High-Value IoT Data Through Decentralized Auctions on the Blockchain

![Logo](https://i.imgur.com/sfpkfud.png)

# Instructions

To install dependencies on both the frontend and backend: `npm install`

Either install the Ganache GUI and change port number to `8545` or run in terminal `ganache-cli -b 3`

Start IoT backend according to its README. Copy the Auction Factory address generated in terminal and replace it in Details.js at line 216.  
NOTE: In production, this step can be achieved automatically using an API which stores a list of open AuctionFactories 

```bash
Running migration: 2_deploy_contracts.js
  Deploying AuctionFactory...
  ... 0x782fd6a0e54f7c3934261f94e6bdcbb257a6ad2adf9f63d923c23ca4fb1492ab
  AuctionFactory: 0xd62ba15ba2ec4e589b569c6f04eabe61c99c7008
```

```javascript
async refreshAuctions() {
    let factoryInstance = await AuctionFactory.at(
      "0xd62ba15ba2ec4e589b569c6f04eabe61c99c7008"
    );
    ...
}
```

To start the frontend: `npm test`

When the frontend has loaded:
1. Login with Ethereum public address and private key that you're going to bid with generated by Ganache.

![Step1](https://i.imgur.com/vxRbCQI.png)

2. Click `Search` to view all available auctions for IoT devices from the API backend.

![Step2](https://i.imgur.com/VJF2VTP.png)

3. Enter in a bid in Wei and click `Bid`.

![Step3](https://i.imgur.com/ZEd57nC.png)

4. Wait until end of auction and then click `Relevant Auctions`.

![Step4](https://i.imgur.com/qf7xxjr.png)

5. Then click `Collect Data`.

![Step5](https://i.imgur.com/UEVK3hP.png)

# Files

## /contracts

This folder contains `AuctionFactory.sol` which creates a smart contract for creating new auction smart contracts for the IoT devices, and it stores all the active auctions. 

The file `dataAuction.sol` creates a smart contract for managing auctions, allowing for:
1. Bidding.
2. Getting an API key after transaction is locked.
3. Confirming the validity of the data provided by an API key by comparing hashes.
4. Allow refunding of bids lower than highest bid.
5. Withdrawing rewards after auction is completed.

## /public

This folder contains `landingpage.html` and all its JavaScript and CSS dependencies. The landing page gives a fancy intro to our project and contains some basic information. 

The file `index.html` is where the dashboard is rendered for users to bid on auctions and view auction details.

## /scripts

This folder contains `start.js`, which is what the program runs on `npm start`.

## /dataAnalysis

A folder detailing an example use case for a data scientist who wants to plot out the temperature data recieved. Symbolizes the last step in the transaction: using the data!

## /src

This folder contains `App.js` which helpers render the auction dashboard and stores relevant auctions and completed auctions in Local Storage. 

The file `countries.json` contains a list of countries abbreviations to allow for searching IoT devices by country location.

The file `Create.js` was used mostly for testing purposes throughout the project and utilized the Auction Factory to create test auctions from IoT devices.

The file `Details.js` is the main file where all the auction activity happens. 
- The user can search for IoT devices based on sensor type (e.g temperature, fridge), unit of measure (e.g celsius), data type (e.g picture, numbers), and location.
- Allow batch bidding on all auctions returned by search results
- Bid on any auctions that are not locked yet.
- Get relevant auctions (any auctions that the user is the highest bidder in AND where the auction is locked)
- Collect data which initiates a series of steps: 
  - Getting the API key
  - Getting the associated data from the IoT device
  - Hashing the first 256 bytes of data with SHA256
  - Verifying the hash
  - On success, gives bidder a file to download with the data
  
The file `index.js` allows us to specify whether or not to use localhost or the Ropsten Test Network for contract deployment.

The file `Login.jsx` requires the user to login before being able to view the dashboard so that they can begin bidding. It keeps track of user ethereum address and private key in Local Storage.

The file `sampleMetadata.json` is a generated metadata file that we expect to get from teach IoT device to display in auction details.
