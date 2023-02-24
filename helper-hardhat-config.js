// here we're gonna define addresses for data feeds that will help us deploy to different chains 

const networkConfig = {
  4: {
    name: "goerli",
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  },
  42161: {
    name: "arbitrum",
    ethUsdPriceFeedAddress: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
  },
  //31337 hardhat Network
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000 //the price we want + the number of decimals after with ZEROS 

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
}