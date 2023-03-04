// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.8;
//imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

//error codes
error FundMe__NotOwner();
error FundMe__SpendMoreEth();

//Interfaces, Libraries, Contracts
/**@title A contract for crowd funcding
 * @author 0xREALaldc
 * @notice This contract is to demo a sample funding contract 
 * @dev This implements price feeds as our library
 */
contract FundMe {
    //type declarations
    using PriceConverter for uint256;

    // State variables
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface private s_priceFeed;

    //modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }
    
    // passing this parameter in the constructor will allow us to set the contract address for the 
    // price feed from the chain that we're deploying to
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //   write their tests after TODO
    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     * @notice This function funds this contract
     * @dev This implements a function that fund the contract
     */
    function fund() public payable {
        // require(msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD, "You need to spend more ETH!");
        if (msg.value.getConversionRate(s_priceFeed) < MINIMUM_USD) revert FundMe__SpendMoreEth();
        // console.log("Amount funded: %s", msg.value);
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }
    
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
      // here we're going to use 'memory' because it's going to be a lot cheaper than if we keep 
      // reading from the 's_funders' that is a storage variable
      address[] memory funders = s_funders;
      
      // quick note, mappings can't be in memory, solidity doesn't allow it
      // so we can't put the s_addressToAmountFunded in a local variable 
      for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
        address funder = funders[funderIndex];
        s_addressToAmountFunded[funder] = 0;
      }

      s_funders = new address[](0);
      (bool success, ) = i_owner.call{ value: address(this).balance}("");
      require(success);
    }

    // View / Pure
    function getOwner() public view returns(address) {
      return i_owner;
    }

    function getFunder(uint256 index) public view returns(address) {
      return s_funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns(uint256) {
      return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns(AggregatorV3Interface) {
      return s_priceFeed;
    }
}