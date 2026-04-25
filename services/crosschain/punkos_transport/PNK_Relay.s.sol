// deploy.sol  
pragma solidity ^0.8.0;  

import "forge-std/Script.sol";  
import "src/PNK/RelayContract.sol";
import "src/HUB/MultiChainManager.sol";
//forge script script/BTC_Relay.s.sol:RunScript --rpc-url http:127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -vvvv
contract RunScript is Script {  
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
        if (!checkIfRelayWork()){
            vm.stopBroadcast();
            return;
        }
        if (!checkIfRelayer()){
            vm.stopBroadcast();
            return;
        }
        //withdrawStake();
        //relayBlock();
        vm.stopBroadcast(); 
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
    function loadContractAddress(string memory contractName) internal view returns (address){    
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        return vm.parseAddress(vm.readFile(filePath));  
    }
    function checkIfRelayWork() internal returns (bool){
        
        uint256 myChainID = managerContract.getSourceChainIDBySymbol(myName);
        if(myChainID != 0){
            (,,,uint numContract,address[] memory addresses) = managerContract.getSourceChainInfo(myChainID);
            if (numContract == 1){
                myAddress = addresses[0];
                myContract = PNK_Relay(myAddress);
                if(myContract.getContractState() == 2){
                    return true;
                }  
            }
        }
        return false;
    }
    function checkIfRelayer() internal returns (bool){
        uint256 myStake = myContract.getMyStake();
        uint256 targetStake = 2 * myContract.getRequireStake();
        if(myStake >= targetStake){
            return true;
        }
        else{
            uint newStake = targetStake - myStake;
            myContract.becomeRelayer{value: newStake}();
            myStake = myContract.getMyStake();
            if(myStake >= targetStake){
                return true;
            }
        }
        return false;
    }
    function relayBlock() internal returns (bool){
        uint256 topHeight = uint256(myContract.getTopKeyFromShadowLedger_slot());
        bytes32 topKey = myContract.getTopKeyFromShadowLedger();
        console.log("TopHeight:",topHeight);
        (bytes32 key, bytes memory raw) = getBlockHeaderFromHeight(topHeight + 1);
        //console.logBytes32(key);
        //console.logBytes32(topKey);
        bytes32 v = myContract.getCommitState(key,topKey);
        //console.logBytes32(v); 
        if (v == bytes32(0)){
            console.log("I am the first relayer");
            (bytes32 keyOld, bytes memory rawOld) = getBlockHeaderFromHeight(topHeight);
            myContract.updateShadowLedgerByRelayer{gas:1000000}(rawOld,key,keccak256(abi.encodePacked(raw,vm.addr(privateKey))));
        }
        else{
            console.log("I am not the first relayer");
            (bytes32 keyNew, bytes memory rawNew) = getBlockHeaderFromHeight(topHeight + 2);
            myContract.updateShadowLedgerByRelayer{gas:1000000}(raw,keyNew,keccak256(abi.encodePacked(rawNew,vm.addr(privateKey))));
        }      
    }
    function withdrawStake() internal returns (bool){
        uint256 myStake = myContract.getMyStake();
        myContract.withdrawStake(myStake);
        console.log("My stake is:", myContract.getMyStake());
    }
    function getBlockHeaderFromHeight(uint256 height) public returns (bytes32 key, bytes memory raw) {  
        // 准备 Python 脚本调用  
        string[] memory inputs = new string[](3);  
        //inputs[0] = "python3";  
        string memory pythonPath = vm.envString("PYTHON_PATH");
        inputs[0] = pythonPath;
        inputs[1] = "./script/get_PNK_Header.py";
        inputs[2] = vm.toString(height);   
        
        // 执行脚本  
        string memory result = string(vm.ffi(inputs));
        bool status = vm.parseJsonBool(result,".status");
        if (!status){
            revert();
        }
        key = vm.parseJsonBytes32(result,".hash");
        raw = vm.parseJsonBytes(result,".raw");
        //myContract.updateShadowLedgerByRelayer{gas:1000000}(rawPrev,keyShadowBlock,keccak256(abi.encodePacked(rawShadowBlock,vm.addr(privateKey)))); 
    }   
}  