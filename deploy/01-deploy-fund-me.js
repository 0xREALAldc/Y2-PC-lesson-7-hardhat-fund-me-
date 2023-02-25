
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
const { verify } = require("../utils/verify")

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
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
  }
  
  // to deploy we use the code below
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    //here we pass the arguments/parameters to the constructor, that in our would be the address for the chainlink data feed
    // args: args, 
    //since the variable and parameter have the same name, we don't need to pass it like 'args: args', JS undestand that 'args' is the parameter and value
    args, 
    log: true, //some custom logs
    waitConfirmations: network.config.blockConfirmations || 1, 
  })
  // automatically verifying our contract
  
  // we check to see if we are NOT in a development chain and if we have the etherscan api key
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args)
  }
  log("-----------------------------------------------------------")
}

module.exports.tags = ["all", "fundMe"]