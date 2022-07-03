pragma solidity >=0.8.0 <0.9.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AvocadoToken.sol";

contract AvocadoTokenShop is Ownable {
    uint256 public constant tokensPerEth = 100;

    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

    AvocadoToken public token;

    constructor(address tokenAddress) {
        token = AvocadoToken(tokenAddress);
    }

    function buyTokens() public payable {
        uint256 transferAmount = msg.value * tokensPerEth;
        require(transferAmount > 0, "You couldn't buy the token, send more money please");
        token.transfer(payable(msg.sender), transferAmount);
        emit BuyTokens(msg.sender, msg.value, transferAmount);
    }

    function withdraw() public payable onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function sellTokens(uint256 amount) public payable {
        token.transferFrom(msg.sender, address(this), amount);
        uint256 earningsAmount = amount / tokensPerEth;
        payable(msg.sender).transfer(earningsAmount);
    }
}
