// deploy.sol  
pragma solidity ^0.8.0;  

import "forge-std/Script.sol";  
import "src/HUB/MultiChainManager.sol";
//forge script script/ManagerAddSource.s.sol:RunScript --rpc-url http:127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -vvvv
contract RunScript is Script {  
    string public env;//部署环境
    uint256 public privateKey;//部署者私钥
    string public dataRoot;//存储合约地址的根目录
    string public myName = "Manager";//目标合约的名称
    MultiChain public myContract;//已部署的 MultiChain 合约实例
    address public myAddress;//已部署的 MultChain 合约地址
    function run() public {  
        vm.txGasPrice(tx.gasprice);//设置交易 gas 价格为当前区块的 gas 价格
        loadDev();//加载环境配置（私钥、文件路径等）
        vm.startBroadcast(privateKey); //开始广播交易（使用私钥签名）
        myAddress = loadContractAddress(myName);//从文件读取""Manager""合约地址
        myContract = MultiChain(myAddress);//绑定地址到合约实例,用于后续调用
        //console.log("ChainID of SEP:", addNewSourceChain("SEP","Sepolia Test Chain"));
        //console.log("ChainID of SSC:", addNewSourceChain("SSC","Simple Source Chain"));
        //console.log("ChainID of BTC:", addNewSourceChain("BTC","Bitcoin Mainnet"));
        console.log("ChainID of PNK:", addNewSourceChain("PNK","Punkos Chain"));
        // console.log("ChainID of ETH:", addNewSourceChain("ETH","Ethereum Beacon"));
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
    //合约地址加载函数
    function loadContractAddress(string memory contractName) internal view returns (address){    
        //拼接文件路径
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        return vm.parseAddress(vm.readFile(filePath));  //读取文件内容并解析为地址
    }
    //添加源链函数,这里的 myContract 是之前部署的 Manager.d.sol 合约实例
    function addNewSourceChain(string memory _symbol,string memory _name) internal returns (uint256 chainID){
        //check if source chain exists
        chainID = myContract.getSourceChainIDBySymbol(_symbol);
        if(chainID == 0){
            myContract.addNewSourceChain(_symbol,_name);
            chainID = myContract.getSourceChainIDBySymbol(_symbol);
        }
    }
}  