pragma solidity 0.8.4;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable {

  uint256 public constant tokensPerEth = 100;

  event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

  YourToken public yourToken;

  constructor(address tokenAddress) {
    yourToken = YourToken(tokenAddress);
  }

  function buyTokens() public payable {
    uint256 transferAmount = msg.value * tokensPerEth;
    require(transferAmount > 0, "You couldn't buy the token, send more money please");
    yourToken.transfer(payable(msg.sender), transferAmount);
    emit BuyTokens(msg.sender, msg.value, transferAmount);
  }

  function withdraw() public payable onlyOwner {
      payable(msg.sender).transfer(address(this).balance);
  }

  function sellTokens(uint256 amount) public payable {
    yourToken.transferFrom(msg.sender, address(this), amount);
    uint256 earningsAmount = amount / tokensPerEth;
    payable(msg.sender).transfer(earningsAmount);
  }

}
