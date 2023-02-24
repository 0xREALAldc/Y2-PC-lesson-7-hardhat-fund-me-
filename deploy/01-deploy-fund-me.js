
// // we can declare a explicit function to do our deploy inside
// function deployFunc() {
//   console.log('hi')
// }

// module.exports.default = deployFunc

//or do a anonymous function
                        // hre - Hardhat Runtime Environment
// module.exports = async (hre) => {}

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
  // we're getting the deploy and log functions
  const { deploy, log, get } = deployments

  // here we're gettint the deployer account that we defined in the hardhat.config.js
  const { deployer } = await getNamedAccounts() // this is a way for us to get accounts 

  // we get the chainId
  const chainId = network.config.chainId

  // when going for localhost or hardhat network we want to use a mock
  let ethUsdPriceFeedAddress

  // if we're in a development network
  if (developmentChains.includes(network.name)) {
    // this GET used here, if we're using a development network, will get the latest deployed contract with the 
    // name that we informed
    const ethUsdAggregator = await get("MockV3Aggregator") 
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    // using the variable 'networkConfig' we can use the 'chainId' to get the contract address to that specific chain
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }
  
  // to deploy we use the code below
  const fundMe = await deploy("FundMe", {
    from: deployer,
    //here we pass the arguments/parameters to the constructor, that in our would be the address for the chainlink data feed
    args: [
      ethUsdPriceFeedAddress,
    ], 
    log: true, //some custom logs 
  })
  // automatically verifying our contract
  log("-----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]