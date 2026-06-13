// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract UpgradeableCounterV1 is Initializable, UUPSUpgradeable {
    uint256 public value;
    address public upgradeAuthority;

    event ValueChanged(uint256 value);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialUpgradeAuthority, uint256 initialValue) public initializer {
        require(initialUpgradeAuthority != address(0), "Invalid authority");

        __UUPSUpgradeable_init();
        upgradeAuthority = initialUpgradeAuthority;
        value = initialValue;
    }

    function version() external pure virtual returns (string memory) {
        return "v1";
    }

    function increment() external virtual {
        value += 1;
        emit ValueChanged(value);
    }

    function _authorizeUpgrade(address) internal view override {
        require(msg.sender == upgradeAuthority, "Only upgrade authority");
    }
}
