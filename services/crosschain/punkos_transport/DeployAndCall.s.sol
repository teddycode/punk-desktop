// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Auction.sol";

contract DeployAndCall is Script {
    function run() external {
        // 从环境变量获取私钥
        uint256 deployerPrivateKey = vm.envUint("DEV_PRIVATE_KEY");

        // 开始广播交易（这之后的操作都会上链）
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署合约
        Auction auction = new Auction();
        console.log("Auction Contract Deployed at:", address(auction));

        // 2. 调用 startAuction 触发事件
        auction.startAuction();
        console.log("startAuction called successfully. Event emitted.");

        vm.stopBroadcast();
    }
}
