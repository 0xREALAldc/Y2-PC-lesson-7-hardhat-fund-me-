const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name) ? describe.skip 
  : describe("FundMe", function () {
      let fundMe
      let deployer
      const sendValue = ethers.utils.parseEther("0.1")
      
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async function () {
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        await fundTxResponse.wait(1)
        console.log(sendValue.toString())
        
        const withdrawTxResponse = await fundMe.withdraw()
        await withdrawTxResponse.wait(1)

        const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
        console.log(endingFundMeBalance.toString())
        assert.equal(endingFundMeBalance.toString(), "0")
      })
    })