// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";
import "./ExampleExternalContract.sol";

contract Staker {

  ExampleExternalContract public exampleExternalContract;
  uint256 public constant threshold = 1 ether;
  uint256 public deadline = block.timestamp + 72 hours;
  bool public openForWithdraw = true;
  bool private executeCalled = false;

  event Stake(address stacker, uint256 amount);
  event Withdraw(address stacker, uint256 amount);

  constructor(address exampleExternalContractAddress) {
      exampleExternalContract = ExampleExternalContract(exampleExternalContractAddress);
  }

  receive() external notCompleted payable {
      stake();
  }

  mapping (address => uint256) public balances;

  modifier notCompleted() {
      require(!exampleExternalContract.completed(), "Funds already stacked at the ExampleExternalContract. This contract written as disposable");
      _;
  }

  function stake() public notCompleted payable  {
    balances[msg.sender] += msg.value;

    if (address(this).balance >= threshold) {
        openForWithdraw = false;
    }

    emit Stake(msg.sender, msg.value);
  }


  function withdraw() public notCompleted {
      uint balance = balances[msg.sender];
      require(balance > 0, "Nothing to withdraw, bro :(");
      balances[msg.sender] = 0;
      payable(msg.sender).transfer(balance);
      emit Withdraw(msg.sender, balance);
  }

  function execute() public notCompleted {
    require(timeLeft() == 0, "Locked until deadline");
    if (address(this).balance > threshold) {
        openForWithdraw = false;
        callExternalComplete();
    } else {
        openForWithdraw = true;
    }
  }

  function callExternalComplete() internal {
      exampleExternalContract.complete{value: address(this).balance}();
  }

  function timeLeft() public view returns (uint256) {
      if (block.timestamp >= deadline) {
        return 0;
      }

      return deadline - block.timestamp;
  }
}

