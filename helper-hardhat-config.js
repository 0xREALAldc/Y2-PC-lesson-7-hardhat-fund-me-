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

module.exports = {
  networkConfig,
  
}