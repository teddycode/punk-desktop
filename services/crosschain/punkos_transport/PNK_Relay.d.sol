// deploy.sol  
pragma solidity ^0.8.0;  

import "forge-std/Script.sol";  
import "src/PNK/RelayContract.sol";
import "src/HUB/MultiChainManager.sol";
//forge script script/SSC_Relay.d.sol:DeployScript --rpc-url http:127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -vvvv
contract DeployScript is Script {  
    string public env;
    uint256 public privateKey;
    string public dataRoot;
    string public myName = "PNK";
    address public myAddress;
    PNK_Relay public myContract;

    string public managerName = "Manager";
    address public managerAddress;
    MultiChain public managerContract;
    function run() public {  
        loadDev();
        vm.startBroadcast(privateKey);
        managerAddress = loadContractAddress(managerName);
        managerContract = MultiChain(managerAddress);
        //向多链管理合约查询中继合约是否创建，若创建返回部署地址，若未创建则部署新合约并注册
        uint256 myChainID = managerContract.getSourceChainIDBySymbol(myName);
        if(myChainID == 0){
            revert();
        }
        (,,,uint numContract,address[] memory addresses) = managerContract.getSourceChainInfo(myChainID);
        if (numContract > 1){
            revert();
        }
        else if (numContract == 1){
            myAddress = addresses[0];
            myContract = PNK_Relay(myAddress);
            vm.stopBroadcast();
            generateGenesis();
        }
        else{
            myContract = new PNK_Relay();
            myAddress =  address(myContract);
            saveContractAddress(myName, myAddress); 
            myContract.updateContractManager(managerAddress);
            console.log("Result of setting multiChainContract as manager of PNK_Relay:", myContract.getContractManager() == managerAddress);
            generateGenesis();
            vm.stopBroadcast();  
        } 
    } 
    function loadDev() public{
        env = vm.envString("DEPLOY_ENV");       
        if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("dev"))) {  
            privateKey = vm.envUint("DEV_PRIVATE_KEY");   
            console.log("Deploying to Dev Environment");  
        } 
        else if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("test"))) {  
            privateKey = vm.envUint("TEST_PRIVATE_KEY");   
            console.log("Deploying to Test Environment");  
        } 
        else {  
            revert("Invalid environment");  
        }
        string memory projectRoot = vm.projectRoot();   
        dataRoot = string(abi.encodePacked(projectRoot, "/data/", env, "/"));   
    }
    function saveContractAddress(string memory contractName, address contractAddress) internal {   
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        string memory data = vm.toString(contractAddress);  
        vm.writeFile(filePath, data);  
        console.log("Contract address saved to", filePath);  
    }   
    function loadContractAddress(string memory contractName) internal view returns (address){     
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        return vm.parseAddress(vm.readFile(filePath));  
    } 
    function generateGenesis() public returns (bool) {  
        // 准备 Python 脚本调用  
        string[] memory inputs = new string[](3);  
        //inputs[0] = "python3";  
        string memory pythonPath = vm.envString("PYTHON_PATH");
        inputs[0] = pythonPath;
        inputs[1] = "./punkos_transport/get_PNK_Header.py";
        inputs[2] = "-1";   
        
        // 执行脚本  
        string memory result = string(vm.ffi(inputs));
        bool res = vm.parseJsonBool(result,".status");
        if (!res){
            return false;
        }
        //bytes32 hashGenesis = vm.parseJsonBytes32(result,".hash");
        bytes memory rawGenesis = vm.parseJsonBytes(result,".raw");
        uint heightGenesis = vm.parseJsonUint(result,".height");
        // 解析 JSON 结果  
        //console.logBytes32(hashGenesis);
        //console.logBytes(rawGenesis);
        //console.logUint(heightGenesis);
        bytes memory param = abi.encode(heightGenesis);
        bytes memory payload = abi.encodeWithSignature("setGenesisShadowLedgerByManager(bytes,bytes)", rawGenesis,param);
        string memory projectRoot = vm.projectRoot();   
        string memory filePath = string(abi.encodePacked(dataRoot, "PNK.genesis"));   
        string memory data = vm.toString(payload);  
        vm.writeFile(filePath, data);  
        console.log("Genesis payload saved to", filePath); 
        return true;  
    }
}  