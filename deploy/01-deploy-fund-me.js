
// // we can declare a explicit function to do our deploy inside
// function deployFunc() {
//   console.log('hi')
// }

// module.exports.default = deployFunc

//or do a anonymous function
                        // hre - Hardhat Runtime Environment
// module.exports = async (hre) => {}

const { networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
  // we're getting the deploy and log functions
  const { deploy, log } = deployments

  // here we're gettint the deployer account that we defined in the hardhat.config.js
  const { deployer } = await getNamedAccounts() // this is a way for us to get accounts 

  // we get the chainId
  const chainId = network.config.chainId

  // when going for localhost or hardhat network we want to use a mock
  // we will do something to have the contract address for the chainlink datafeed to be easy to be changed
  // when we change the chain that we're deploying

  // using the variable 'networkConfig' we can use the 'chainId' to get the contract address to that specific chain
  const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

  //if the contract doesn't exist, we deploy a minimal version of it for our local testing

  
  // to deploy we use the code below
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [
      ethUsdPriceFeedAddress,
    ], //here we pass the arguments/parameters to the constructor, that in our would be the address for the chainlink data feed
    log: true, //some custom logs 
  })
}