// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Execute_Auction.sol";

contract DeployDest is Script {
    function run() external {
        // 读取私钥
        uint256 deployerPrivateKey = vm.envUint("DEV_PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 部署合约
        DestinationAuction destAuction = new DestinationAuction();
        
        console.log("DestinationAuction Deployed at:", address(destAuction));

        vm.stopBroadcast();
    }
}
