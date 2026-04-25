// deploy.sol  
pragma solidity ^0.8.0;  

import "forge-std/Script.sol";  
import "src/HUB/MultiChainManager.sol";
contract DeployScript is Script {  
    string public env;//部署环境
    uint256 public privateKey;//部署者私钥,用于签名交易
    string public dataRoot;//存储合约地址的根目录
    string public myName = "Manager";//待部署合约的名称
    MultiChain public myContract;//部署后的合约实例
    address public myAddress;//部署后的合约地址
    function run() public {  
        vm.txGasPrice(tx.gasprice);  // 设置交易的 gas 价格为当前区块的 gas 价格
        loadDev();  // 加载环境配置（私钥、文件路径等）
        vm.startBroadcast(privateKey);  // 开始广播交易（使用私钥签名）
        myContract = new MultiChain();  // 部署 MultiChain 合约（创建新实例）
        myAddress = address(myContract);  // 获取部署后的合约地址
        console.log("Contract deployed to:", myAddress);  // 打印部署地址
        saveContractAddress(myName, myAddress);  // 保存地址到文件
        vm.stopBroadcast();  // 停止广播交易
    }
    function loadDev() public {
        env = vm.envString("DEPLOY_ENV");  // 读取环境变量 DEPLOY_ENV（如 dev/test）
        // 根据环境选择私钥（通过 keccak256 比较字符串，避免直接字符串比较的 gas 问题）
        if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("dev"))) {  
            privateKey = vm.envUint("DEV_PRIVATE_KEY");  // 开发环境私钥（来自环境变量）
            console.log("Deploying to Dev Environment");  
        } else if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("test"))) {  
            privateKey = vm.envUint("TEST_PRIVATE_KEY");  // 测试环境私钥（来自环境变量）
            console.log("Deploying to Test Environment");  
        } else {  
            revert("Invalid environment");  // 环境不合法时回滚
        }
        // 构建存储合约地址的文件路径（项目根目录/data/环境名/）
        string memory projectRoot = vm.projectRoot();  // 获取项目根目录（Foundry 提供）
        dataRoot = string(abi.encodePacked(projectRoot, "/data/", env, "/"));  
    }
    function saveContractAddress(string memory contractName, address contractAddress) internal {     
        // 构建文件路径（如 data/dev/Manager.address）
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        string memory data = vm.toString(contractAddress);  // 将地址转为字符串
        vm.writeFile(filePath, data);  // 写入文件（Foundry 的 vm 工具函数）
        console.log("Contract address saved to", filePath);  
    }
    function loadContractAddress(string memory contractName) internal view returns (address){  
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));
        return vm.parseAddress(vm.readFile(filePath));  // 读取文件并解析为地址
    }
}