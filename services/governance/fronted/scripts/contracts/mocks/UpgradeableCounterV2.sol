// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UpgradeableCounterV1.sol";

contract UpgradeableCounterV2 is UpgradeableCounterV1 {
    uint256 public multiplier;

    event MultiplierChanged(uint256 multiplier);

    function version() external pure override returns (string memory) {
        return "v2";
    }

    function initializeV2(uint256 initialMultiplier) external reinitializer(2) {
        multiplier = initialMultiplier;
        emit MultiplierChanged(initialMultiplier);
    }

    function increment() external override {
        uint256 step = multiplier == 0 ? 1 : multiplier;
        value += step;
        emit ValueChanged(value);
    }

    function setMultiplier(uint256 newMultiplier) external {
        multiplier = newMultiplier;
        emit MultiplierChanged(newMultiplier);
    }
}
