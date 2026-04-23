// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "forge-std/console.sol";

// ======================= 0. 基础依赖 =======================

library RLPReader {
    uint8 constant STRING_SHORT_START = 0x80;
    uint8 constant STRING_LONG_START  = 0xb8;
    uint8 constant LIST_SHORT_START   = 0xc0;
    uint8 constant LIST_LONG_START    = 0xf8;
    uint8 constant WORD_SIZE = 32;

    struct RLPItem {
        uint len;
        uint memPtr;
    }

    // 简化版 RLP 解析逻辑，仅用于让代码编译通过并能跑通基本逻辑
    // 真实生产环境请使用 Hamdi Allam 的 RLPReader
    function toRlpItem(bytes memory item) internal pure returns (RLPItem memory) {
        uint memPtr;
        assembly { memPtr := add(item, 0x20) }
        return RLPItem(item.length, memPtr);
    }
    function toList(RLPItem memory item) internal pure returns (RLPItem[] memory result) {
        // Mock: 假设输入总是符合预期，不做复杂解析，仅用于测试
        // 这里只是为了让 PNK_OLC 不报错。真实测试中建议 Mock 掉 PNK_OLC 的 RLP 部分
        return new RLPItem[](0); 
    }
    function toUint(RLPItem memory item) internal pure returns (uint) { return 0; }
    function toBytes(RLPItem memory item) internal pure returns (bytes memory) { return new bytes(0); }
}

abstract contract SystemContract {
    address public manager;
    bool public isWorking = true;
    constructor() { manager = msg.sender; }
    modifier onlyManager() { require(msg.sender == manager, "Not manager"); _; }
    modifier onlyWorking() { require(isWorking, "System paused"); _; }
}

abstract contract StakeManagement is SystemContract {
    uint256 private requireStake;
    uint256 private totalPenalty;
    mapping (address => uint256) private stakeOf; 
    
    enum StakeLabel{ Default, Add_Unlocked_Stake, Withdraw_Unlocked_Stake, Lose_Unlocked_Stake, Lose_Locked_Stake, Lock_Stake, Unlock_Stake, Receive_Reward, Withdraw_Penalty, Modify_Setting }
    event UpdateStake(address indexed relayer, StakeLabel indexed label, uint256 value); 
    error NonEnoughStake();
    
    modifier onlyRelayer{ if (stakeOf[msg.sender] < requireStake) revert NonEnoughStake(); _; }
    constructor(){ totalPenalty = 0; requireStake = 1 ether; }

    function setRequireStake(uint256 _newStake) external onlyWorking{ requireStake = _newStake; }
    function getRequireStake() public view returns (uint256){ return requireStake; }
    function getMyStake() external view returns (uint256 stake){ return stakeOf[msg.sender]; }
    
    function becomeRelayer() external payable onlyWorking{
        if (stakeOf[msg.sender] + msg.value < requireStake) revert NonEnoughStake();
        stakeOf[msg.sender] += msg.value;
        emit UpdateStake(msg.sender, StakeLabel.Add_Unlocked_Stake, msg.value); 
    }
    
    function unlockStake(address relayer, uint256 value) internal {
        stakeOf[relayer] += value;
        emit UpdateStake(relayer, StakeLabel.Unlock_Stake, value);
    }
    function lockStake(address relayer, uint256 value) internal {
        if(stakeOf[relayer] < value) revert NonEnoughStake();
        stakeOf[relayer] -= value;
        emit UpdateStake(relayer, StakeLabel.Lock_Stake, value);
    }
    function punishLockedRelayer(address relayer, uint256 value) internal{
        emit UpdateStake(relayer, StakeLabel.Lose_Locked_Stake, value); 
        totalPenalty += value; 
    }
    function punishUnlockedRelayer(address relayer, uint256 value) internal {
        if(stakeOf[relayer] < value) revert NonEnoughStake();
        stakeOf[relayer] -= value;
        emit UpdateStake(relayer, StakeLabel.Lose_Unlocked_Stake, value); 
        totalPenalty += value; 
    }
}

// ======================= 1. PNK_OLC & Rules =======================

// 模拟 SourceConsensusRules
abstract contract SourceConsensusRules {
    enum RelayerLabel { Valid, Invalid_Honest, Dishonest }
    function setGenesisShadowBlock(bytes calldata rawGenesisShadowBlock, bytes calldata params) internal virtual returns(bool);
    function submitNewShadowBlock(bytes calldata rawNewShadowBlock) internal virtual returns(RelayerLabel, bytes32);
    function getTopKeyFromShadowLedger() external view virtual returns(bytes32);
    function checkIfOldFork(bytes32 keyShadowBlock) virtual public view returns(bool);
    function getKeyFromShadowBlock(bytes calldata rawShadowBlock) virtual public pure returns(bytes32);
    function verifyTxByShadowLedger (bytes calldata leafNode, bytes calldata proof, bytes32 rootKey, uint delay) virtual public view returns (bool success);
}

// 你的 PNK_OLC 实现
contract PNK_OLC is SourceConsensusRules {
    using RLPReader for bytes;
    using RLPReader for RLPReader.RLPItem;

    bytes32 private latestHash;
    uint256 private lastSlot;

    // [HACK] 修改：直接通过 ABI 解码初始化，方便测试
    function setGenesisShadowBlock(bytes calldata rawGenesisShadowBlock, bytes calldata /*params*/) internal override returns(bool success) {
        (bytes32 _genesisHash, uint256 _genesisNumber) = abi.decode(rawGenesisShadowBlock, (bytes32, uint256));
        latestHash = _genesisHash;
        lastSlot = _genesisNumber;
        return true;
    }

    // [Mock] 简化 RLP 解析，直接返回成功，避免引入庞大的 RLP 库导致测试困难
    // 真实部署时请还原你的原始逻辑
    function submitNewShadowBlock(bytes calldata rawNewShadowBlock) internal override returns(RelayerLabel, bytes32) {
        // 假设 rawNewShadowBlock 就是 parentHash
        bytes32 parentHash = abi.decode(rawNewShadowBlock, (bytes32));
        return (RelayerLabel.Valid, parentHash);
    }

    function getTopKeyFromShadowLedger() external view override returns(bytes32 key) { return latestHash; }
    
    function checkIfOldFork(bytes32 keyShadowBlock) override public view returns(bool res){ return false; }
    
    // [Mock] 直接返回 rawShadowBlock 的 keccak256
    function getKeyFromShadowBlock(bytes calldata rawShadowBlock) override public pure returns(bytes32 keyShadowBlock){
        return keccak256(rawShadowBlock);
    }
    
    // [Mock] 验证永远通过
    function verifyTxByShadowLedger (bytes calldata leafNode, bytes calldata proof, bytes32 rootKey, uint delay) override public view returns (bool success){
        return true; 
    }
}

// ======================= 2. Relay Contract =======================

// 你的 RelayContract 实现 (稍微简化了 import)
abstract contract RelayContract is SystemContract, StakeManagement, SourceConsensusRules {
    enum ContributionLabel{ Default, Submit_New_Commit, Open_True_Commit, Open_False_Commit, Open_Fork_True_Commit, Open_Fork_False_Commit, Delete_Time_Out_Commit, Called_By_User, Commit_Opened_True, Commit_Opened_False, Commit_Time_Out, Gas_Not_Enough, Submit_Wrong_Data, Wrongly_Open_Fork_Commit }
    struct CommitBlock{ address relayer; mapping(bytes32 => CommitMemory) commitFork; }
    struct CommitMemory{ address relayer; uint96 stake; bytes32 commit; uint256 time; }
    
    bytes32 public keyGenesisShadowBlock;
    mapping (bytes32 => CommitBlock) public commitTree; 
    uint256 public MaxOpenCommitDelay;
    uint256 public GasLowerBound;
    
    event SubmitNewCommit(bytes32 indexed keyShadowBlock, bytes32 keyParentShadowBlock, address indexed relayer, bytes32 commit);
    event OpenOldCommit(bytes32 indexed keyShadowBlock, bytes32 keyParentShadowBlock, address indexed relayer, bool result);
    event RecordRelayerContribution(bytes32 indexed keyShadowBlock, address indexed relayer, ContributionLabel indexed label,uint value);
    event UpdateShadowLedger(bytes32 indexed keyShadowBlock, bytes32 keyParentShadowBlock, bytes rawShadowBlock);

    constructor() StakeManagement(){ GasLowerBound = 10000; MaxOpenCommitDelay = 144; }

    function setGenesisShadowLedgerByManager(bytes calldata _rawGenesisShadowBlock, bytes calldata _params) external onlyManager{
        setGenesisShadowLedgerWithCommit(_rawGenesisShadowBlock, _params, msg.sender);
    }
    
    function setGenesisShadowLedgerWithCommit(bytes calldata _rawGenesisBlock, bytes calldata _params, address _relayer) internal {
        // [Hack] 适配 PNK_OLC 的 Hack 解码
        (bytes32 keyGenesis, ) = abi.decode(_rawGenesisBlock, (bytes32, uint256));
        bool res = setGenesisShadowBlock(_rawGenesisBlock, _params);
        if(res){
            bytes32 keyParentGenesis;
            emit UpdateShadowLedger(keyGenesis, keyParentGenesis, _rawGenesisBlock);
            keyGenesisShadowBlock = keyGenesis;
        } else { revert(); }
    }
    
    // 省略了 updateShadowLedgerByRelayer 等复杂的 Commit 逻辑，
    // 因为本次测试主要关注 Transport 层能否验证通过。
    // 如果要测试 Relay 激励，需完全实现这些函数。
}

contract PNK_Relay is RelayContract, PNK_OLC {}

// ======================= 3. Mock TxRule =======================

contract MockTxRule {
    function checkIfPayloadMatchTx(bytes calldata, bytes calldata, uint) external pure returns (bool) { return true; }
    function checkIfLeafNodeMatchTx(bytes calldata, bytes calldata) external pure returns (bool) { return true; }
    function getKeyFromRawTx(bytes calldata rawTx) external pure returns (bytes32) { return keccak256(rawTx); }
}

// ======================= 4. Transport Contract =======================

// 你提供的 Transport 合约
contract Transport is SystemContract, StakeManagement {
    address public relayContract;
    address public txRuleContract;
    uint256 public delay = 8;
    uint public taskNum = 0;
    
    enum TransportTaskLabel { Default, Created, Accepted, Rejected, Successed, Failed }
    struct TransportTask{
        address user;
        uint96 fee;
        uint taskType;
        address relayer;
        uint96 stake;
        bytes payload;
        uint256 time;
        TransportTaskLabel label;
    }
    
    mapping(bytes32 => TransportTask) public taskList;
    mapping(bytes32 => bool) public txIfCheck;

    event NewTransportTask(uint256 indexed _index, bytes32 indexed _key, bytes _payload, uint256 _type, address user, uint fee);
    event UpdateTaskState(bytes32 indexed _key, TransportTaskLabel oldState, TransportTaskLabel indexed newState, address indexed operator);
    event ConfirmSourceTx(bytes32 indexed keyTx, bytes32 indexed keyShadowBlock, uint confirmParam, bool _type);

    function updateSourceInfo(address _relay, address _txRule) external onlyManager{
        relayContract = _relay;
        txRuleContract = _txRule;
    }

    function createTask(bytes memory _payload, uint256 _taskType) external payable onlyWorking {
        bytes32 taskKey = keccak256(_payload);
        require(taskList[taskKey].label == TransportTaskLabel.Default, "Exists");
        taskList[taskKey] = TransportTask({
            user: msg.sender,
            fee: uint96(msg.value),
            taskType: _taskType,
            relayer: address(0),
            stake: uint96(0),
            payload: _payload,
            time: block.number,
            label: TransportTaskLabel.Created
        });
        emit NewTransportTask(taskNum, taskKey, _payload, _taskType, msg.sender, msg.value);
        taskNum += 1;
    }

    function acceptTask(bytes32 _taskKey) external onlyWorking onlyRelayer{
        TransportTask storage task = taskList[_taskKey];
        require(task.label == TransportTaskLabel.Created, "Not Created");
        lockStake(msg.sender, getRequireStake());
        task.relayer = msg.sender;
        task.label = TransportTaskLabel.Accepted;
        task.time = block.number;
        task.stake = uint96(getRequireStake());
        emit UpdateTaskState(_taskKey, TransportTaskLabel.Created, TransportTaskLabel.Accepted, msg.sender);
    }

    function finishTask(bytes32 _taskKey, bytes calldata rawTx, bytes calldata leafNode, bytes calldata proof, bytes32 keyShadowBlock) public returns (bool res){
        TransportTask memory task = taskList[_taskKey];
        require(task.label == TransportTaskLabel.Accepted && task.relayer == msg.sender, "Access denied");
        
        // 1. Check Rule
        (bool success, bytes memory data) = txRuleContract.call(abi.encodeWithSignature("checkIfPayloadMatchTx(bytes,bytes,uint256)", task.payload, rawTx, task.taskType));
        require(success && abi.decode(data, (bool)), "Rule Check Failed");

        (success, data) = txRuleContract.call(abi.encodeWithSignature("getKeyFromRawTx(bytes)", rawTx));
        bytes32 keyTx = abi.decode(data, (bytes32));
        require(!txIfCheck[keyTx], "Tx Used");

        // 2. Verify via Relay (PNK_OLC)
        (success, data) = relayContract.call(abi.encodeWithSignature("verifyTxByShadowLedger(bytes,bytes,bytes32,uint256)", leafNode, proof, keyShadowBlock, delay));
        require(success && abi.decode(data, (bool)), "Relay Verify Failed");

        // 3. Settle
        txIfCheck[keyTx] = true;
        emit ConfirmSourceTx(keyTx, keyShadowBlock, delay, false);
        emit UpdateTaskState(_taskKey, TransportTaskLabel.Accepted, TransportTaskLabel.Successed, msg.sender);
        
        unlockStake(task.relayer, uint256(task.fee + task.stake));
        delete taskList[_taskKey];
        return true;
    }
}
