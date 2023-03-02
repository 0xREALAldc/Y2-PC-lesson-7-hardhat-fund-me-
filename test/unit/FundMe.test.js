const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function() {
  let fundMe
  let deployer
  let mockV3Aggregator
  const sendValue = ethers.utils.parseEther("1") //"1000000000000000000" // 1 eth
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
    it("updated the amount funded data structure", async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.addressToAmountFunded(deployer)
      assert.equal(response.toString(), sendValue.toString())
    })
    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue })
      const funder = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })

  describe("withdraw", function () {
    // we add a beforeEach() here so for all of our tests in this describe, we already have some money in the contract
    beforeEach(async function () {
      await fundMe.fund({ value: sendValue })
    })

    it("Withdraw ETH from a single founder", async function () {
      // Arrange
      // here we use the '.provider' from fundMe, we could have used from 'ethers.provider' also
      // but we just choose to use the one comming with the contract. It doesn't matter wich one
      // we use here, both will work fine. We will get the balances the same way
      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
      // Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt

      // as the two variables are bigNumbers, we will use the function '.mul' to multiply them
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      // Assert
      assert.equal(endingFundMeBalance, 0, "Contract balance is different than the expected")
      
      // because of bigNumbers we will be using the .add to sum the two numbers
      assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), 
        endingDeployerBalance.add(gasCost).toString(), "Deployer balance is different than the expected")
    })
    it("Allows us to withdraw with multiple funders", async function () {
      //we will get the accounts first
      const accounts = await ethers.getSigners()
      
      //then we'll looop through some of the accounts to fund the contract with some of them
      // we will begin in the index 1 because index 0 is the 'deployer' account
      for(let i = 1; i < 6; i++) {
        // Arrange
        
        // here we are connecting each account with the contract, just like above we did using the 
        // ethers.getContract("FundMe", deployer) where we connected the deployer
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({ value: sendValue })
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
      // Act
      const transactionResponse = await fundMe.withdraw()
      const transactionReceipt = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReceipt

      // as the two variables are bigNumbers, we will use the function '.mul' to multiply them
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      // Assert
      assert.equal(endingFundMeBalance, 0, "Contract balance is different than the expected")
      
      // because of bigNumbers we will be using the .add to sum the two numbers
      assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), 
        endingDeployerBalance.add(gasCost).toString(), "Deployer balance is different than the expected")

      // Make sure the 'funders' array are reset properly

      // if we try to access the index 0 in the array, should throw an error
      await expect(fundMe.funders(0)).to.be.reverted

      // here we validate if the amount in each account was set to 0
      for (i = 1; i < 6; i++) {
        assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0, "Account amount fundded should be 0")
      }
    })
    it("Only allows the owner to withdraw", async function () {
      // we first get the accounts 
      const accounts = await ethers.getSigners()

      // we will select one here that will not be the owner, because the owner is 'account[0]', that we named 'deployer'
      const attacker = accounts[1]

      // then we connect our 'attacker' account to a contract object
      const attackerConnectedContract = await fundMe.connect(attacker)

      // then we validate that it will not pass
      await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
    })
  })
})