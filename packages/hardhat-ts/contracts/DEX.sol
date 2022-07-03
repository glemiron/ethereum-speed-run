pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DEX {
  using SafeMath for uint256;

  uint256 public totalLiquidity;
  mapping (address => uint256) liquidity;

  event EthToToken(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event TokenToEth(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event Withdraw(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
  event Deposit(address buyer, uint256 amountOfETH, uint256 amountOfTokens);

  IERC20 token;

  constructor(address token_address) {
    token = ERC20(token_address);
  }

  function init(uint256 tokens) public payable returns (uint256) {
      require(totalLiquidity == 0, "DEX:init - already has liquidity");
      totalLiquidity = address(this).balance;
      liquidity[msg.sender] = totalLiquidity;

      require(token.transferFrom(msg.sender, address(this), tokens));

      return totalLiquidity;
  }

  function price(uint256 input_amount, uint256 input_reserve, uint256 output_reserve) public view returns (uint256) {
      uint256 input_amount_with_fee = input_amount.mul(997);
      uint256 numerator = input_amount_with_fee.mul(output_reserve);
      uint256 denominator = input_reserve.mul(1000).add(input_amount_with_fee);

      return numerator / denominator;
  }

  function priceEth(uint256 amount) public view returns (uint256) {
      uint256 token_reserve = token.balanceOf(address(this));

      return price(amount, address(this).balance, token_reserve);
  }


  function ethToToken() public payable returns (uint256) {
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 tokens_bought = price(msg.value, address(this).balance.sub(msg.value), token_reserve);

        require(token.transfer(msg.sender, tokens_bought));

        emit EthToToken(msg.sender, msg.value, tokens_bought);

        return tokens_bought;
  }

  function tokenToEth(uint256 tokensAmount) public returns (uint256) {
      uint256 token_reserve = token.balanceOf(address(this));
      uint256 eth_bought = price(tokensAmount, token_reserve, address(this).balance);

      require(token.transferFrom(msg.sender, address(this), tokensAmount));
      payable(msg.sender).transfer(eth_bought);

      emit TokenToEth(msg.sender, eth_bought, tokensAmount);

      return eth_bought;
  }

  function deposit() public payable returns (uint256) {
      uint256 eth_reserve = address(this).balance.sub(msg.value);
      uint256 token_reserve = token.balanceOf(address(this));
      uint256 token_amount = msg.value.mul(token_reserve).div(eth_reserve).add(1);
      uint256 liquidity_minted = msg.value.mul(totalLiquidity).div(eth_reserve);
      liquidity[msg.sender] = liquidity[msg.sender].add(liquidity_minted);
      totalLiquidity = totalLiquidity.add(liquidity_minted);
      require(token.transferFrom(msg.sender, address(this), token_amount));

      emit Deposit(msg.sender, msg.value, token_amount);

      return liquidity_minted;
  }

  function withdraw(uint256 tokensAmount) public returns (uint256, uint256) {
        uint256 token_reserve = token.balanceOf(address(this));
        uint256 eth_amount = tokensAmount.mul(address(this).balance).div(totalLiquidity);
        uint256 token_amount = tokensAmount.mul(token_reserve).div(totalLiquidity);
        require(liquidity[msg.sender] >= eth_amount);
        liquidity[msg.sender] = liquidity[msg.sender].sub(eth_amount);
        totalLiquidity = totalLiquidity.sub(eth_amount);
        require(token.transfer(msg.sender, token_amount));
        payable(msg.sender).transfer(eth_amount);

        emit Withdraw(msg.sender, eth_amount, token_amount);

        return (eth_amount, token_amount);
  }

  receive() external payable {}
  fallback() external payable {}
}
