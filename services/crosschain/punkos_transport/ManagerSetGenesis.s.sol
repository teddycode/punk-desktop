// deploy.sol  
pragma solidity ^0.8.0;  

import "forge-std/Script.sol";  
import "src/HUB/MultiChainManager.sol";
//forge script script/ManagerSetGenesis.s.sol:RunScript --rpc-url http:127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast -vvvv
contract RunScript is Script {  
    string public env;//部署环境
    uint256 public privateKey;//部署者私钥
    string public dataRoot;//数据文件根目录
    string public myName = "Manager";//核心合约名称
    MultiChain public myContract;//MultiChain合约实例
    address public myAddress;//MultiChain地址
    //源链配置列表(符号与全名对应)
    string[] public sourceNameList = ["PNK"];
    string[] public sourceFullNameList = ["Punkos Chain"];//源链全名列表
    function run() public {
        vm.txGasPrice(tx.gasprice);//动态设置交易 gas 价格
        loadDev();//加载环境配置（私钥、文件路径等）
        vm.startBroadcast(privateKey);//开始广播交易（使用私钥签名）
        myAddress = loadContractAddress(myName);//从文件读取 Manager 合约地址
        myContract = MultiChain(myAddress);
        //循环处理每条源链的初始化   
        for(uint i = 0; i < sourceNameList.length; i ++){
            //添加源链(返回链 ID)
            uint chainID = addNewSourceChain(sourceNameList[i],sourceFullNameList[i]);
            //加载该源链对应的中继合约地址
            address sourceAddress = loadContractAddress(sourceNameList[i]);
            //将中继合约关联到源链,并输出结果
            bool res = addRelayContractToSourceChain(chainID,sourceAddress);
            console.log("The result of add relay contract:", res);
            //设置中继合约的创世状态,并输出结果
            setRelayGenesis(sourceNameList[i],sourceAddress);
        }
        vm.stopBroadcast();  //停止广播交易
    } 
    function loadDev() public{
        env = vm.envString("DEPLOY_ENV");//从环境变量读取部署环境
        //根据环境变量设置私钥
        if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("dev"))) {  
            privateKey = vm.envUint("DEV_PRIVATE_KEY");   //开发环境私钥
            console.log("Deploying to Dev Environment");  //打印环境信息
        } 
        else if (keccak256(abi.encodePacked(env)) == keccak256(abi.encodePacked("test"))) {  
            privateKey = vm.envUint("TEST_PRIVATE_KEY");   //测试环境私钥
            console.log("Deploying to Test Environment");  
        } 
        else {  
            revert("Invalid environment");  //环境无效时回滚
        }
        //构建数据文件根目录路径
        string memory projectRoot = vm.projectRoot();   
        dataRoot = string(abi.encodePacked(projectRoot, "/data/", env, "/"));   
    }
    //合约地址加载函数,从指定路径的文件中读取合约地址
    function loadContractAddress(string memory contractName) internal view returns (address){     
        string memory filePath = string(abi.encodePacked(dataRoot, contractName, ".address"));   
        return vm.parseAddress(vm.readFile(filePath));  
    }
    //添加源链函数,通过检查避免重复添加
    function addNewSourceChain(string memory _symbol,string memory _name) internal returns (uint256 chainID){
        //check if source chain exists
        chainID = myContract.getSourceChainIDBySymbol(_symbol);
        if(chainID == 0){
            myContract.addNewSourceChain(_symbol,_name);
            chainID = myContract.getSourceChainIDBySymbol(_symbol);
        }
    }
    //关联中继合约到源链函数
    function addRelayContractToSourceChain(uint256 _chainID, address _relayAddress) internal returns (bool){
        //查询中继合约当前信息(链 ID,状态等)
        (,uint256 chainID,,uint256 state) = myContract.getSystemContractInfo(_relayAddress);
        if(state != 0){//若合约已关联(状态非 0)
            if(chainID !=_chainID){//链 ID 不匹配,返回失败
                return false;
            }
            else{//链 IDp匹配,返回成功
                return true;
            } 
        }
        //若合约未关联,则进行关联操作,调用方法关联到源链
        myContract.addNewSystemContractToSourceChain(_chainID,_relayAddress);
        //再次查询信息验证结果
        (,chainID,,state) = myContract.getSystemContractInfo(_relayAddress);
        //若状态为 1 且链 ID 匹配,返回成功
        if((state == 1) && (chainID == _chainID)) {
            return true;
        }
        else{
            return false;
        }
    }
    function setRelayGenesis(string memory sourceSymbol, address _relayAddress) internal returns (bool){
        //构建创世数据文件路径（如 data/dev/SSC.genesis）
        string memory projectRoot = vm.projectRoot();   
        string memory filePath = string(abi.encodePacked(dataRoot, sourceSymbol, ".genesis"));   
        //读取文件内容并解析为字节数据,payload 是创世初始化函数调用的编码数据
        //bytes memory payload = vm.parseBytes(vm.readFile(filePath)); 
        bytes memory payload;  // 在这里声明payload
        try vm.parseBytes(vm.readFile(filePath)) returns (bytes memory data) {
            payload = data;
            console.log("payload length: %d", payload.length);
        } catch {
            console.log("failed to read payload");
            return false;
        }
        //检查中继状态(必须为 1,即已关联但未初始化)
        (,,,uint256 state) = myContract.getSystemContractInfo(_relayAddress);
        console.log("the state of this contract %d", state);
        if (state != 1){
            return false;
        }
        //执行创世初始化操作(发送 payload 到中继合约)并更新状态为 2
        myContract.operateSystemContract(_relayAddress,payload);
        myContract.updateSystemContractState(_relayAddress, 2);
        return true;
    }

}  