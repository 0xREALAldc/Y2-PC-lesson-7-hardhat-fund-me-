const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function() {
  let fundMe
  let deployer
  let mockV3Aggregator
  beforeEach(async function () {
    // deploy our FundMe contract
    // using Hardhat-deploy 
    // because we use hardhat-deploy, our contracts for mock will be deployed too

    //another way to get different accounts from our hardhat.config is using the commands in the two lines below
    // const accounts = await ethers.getSigners() // this will return all the accounts in the 'accounts' property in the hardhat.config for the network you're using
    // const accountZero = accounts[0] //you would need to do this to get the first account in the returned array

    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["all"])
    // we get the contract and connect a account to the contract
    // so whenever we call a function on fundMe, it'll be 'deployer' the msg.sender
    fundMe = await ethers.getContract("FundMe", deployer) 
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
  })
  
  describe("constructor", async function () {
    it("sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("fund", async function() {
    it("Fails if you don't send enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
    })
  })
})