// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev Interface for ERC20 governance token.
 */
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

/**
 * @title ParameterRegistry
 * @dev Manages parameter modification proposals with different approval thresholds based on parameter importance.
 * 
 * Parameter Levels:
 * - APPLICATION (应用级): Requires 2/3 (66.67%) approval
 * - SYSTEM (系统级): Requires 3/4 (75%) approval
 * - INFRASTRUCTURE (底层): Requires 4/5 (80%) approval
 * 
 * This contract works with the governance executor to apply approved parameter changes
 * to execution layer, client, and consensus layer components.
 */
contract ParameterRegistry {
    // ============ Enums ============
    
    /**
     * @dev Parameter importance levels
     */
    enum ParameterLevel {
        APPLICATION,      // 应用级参数 - 2/3 approval
        SYSTEM,          // 系统级参数 - 3/4 approval
        INFRASTRUCTURE   // 底层参数 - 4/5 approval
    }

    /**
     * @dev Proposal states
     */
    enum ProposalState {
        Pending,         // Waiting for voting to start
        Active,          // Voting in progress
        Succeeded,       // Passed voting threshold
        Defeated,        // Failed to pass
        Executed,        // Successfully executed
        Canceled         // Canceled by proposer
    }

    // ============ Structs ============

    /**
     * @dev Registered parameter information
     */
    struct ParameterInfo {
        string name;              // Human-readable parameter name
        ParameterLevel level;     // Importance level
        bytes32 category;         // Category identifier (e.g., "execution", "client", "consensus")
        bool isRegistered;        // Whether parameter is registered
        bytes currentValue;       // Current parameter value (encoded)
    }

    /**
     * @dev Parameter modification proposal
     */
    struct ParameterProposal {
        uint256 id;                    // Proposal ID
        address proposer;              // Who created the proposal
        bytes32 parameterId;           // Parameter being modified
        bytes newValue;                // Proposed new value
        string description;            // Proposal description
        uint256 startTime;             // Voting start time
        uint256 endTime;               // Voting end time
        uint256 forVotes;              // Votes in favor
        uint256 againstVotes;          // Votes against
        bool executed;                 // Whether executed
        bool canceled;                 // Whether canceled
        mapping(address => bool) hasVoted;  // Track who has voted
    }

    // ============ Constants ============

    // Voting timing
    uint256 public constant VOTING_DELAY = 60;      // Time before voting starts (seconds)
    uint256 public constant VOTING_PERIOD = 120;    // Voting duration (seconds)

    // Approval thresholds (in basis points, 10000 = 100%)
    uint256 public constant APPLICATION_THRESHOLD = 6667;      // 2/3 = 66.67%
    uint256 public constant SYSTEM_THRESHOLD = 7500;           // 3/4 = 75%
    uint256 public constant INFRASTRUCTURE_THRESHOLD = 8000;   // 4/5 = 80%
    uint256 public constant BASIS_POINTS = 10000;

    // ============ State Variables ============

    IERC20 public immutable govToken;          // Governance token for voting
    address public admin;                       // Contract admin
    address public executor;                    // Governance executor address

    uint256 public proposalCount;               // Total proposals created
    bytes32[] public registeredParameters;      // List of registered parameter IDs

    mapping(bytes32 => ParameterInfo) public parameters;           // Parameter ID => Info
    mapping(uint256 => ParameterProposal) internal proposals;      // Proposal ID => Proposal
    mapping(bytes32 => uint256[]) public parameterProposalHistory; // Parameter => Historical proposals

    // ============ Events ============

    event ParameterRegistered(
        bytes32 indexed parameterId,
        string name,
        ParameterLevel level,
        bytes32 category
    );

    event ParameterLevelUpdated(
        bytes32 indexed parameterId,
        ParameterLevel oldLevel,
        ParameterLevel newLevel
    );

    event ParameterProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        bytes32 indexed parameterId,
        bytes newValue,
        string description,
        uint256 startTime,
        uint256 endTime,
        uint256 requiredThreshold
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        bytes32 indexed parameterId,
        bytes oldValue,
        bytes newValue
    );

    event ProposalCanceled(uint256 indexed proposalId);

    event ExecutorUpdated(address indexed oldExecutor, address indexed newExecutor);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // ============ Modifiers ============

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyExecutor() {
        require(msg.sender == executor, "Only executor can call this function");
        _;
    }

    // ============ Constructor ============

    /**
     * @dev Initializes the parameter registry.
     * @param _govToken Address of the governance token.
     * @param _executor Address of the governance executor.
     */
    constructor(address _govToken, address _executor) {
        require(_govToken != address(0), "Invalid governance token address");
        require(_executor != address(0), "Invalid executor address");
        
        govToken = IERC20(_govToken);
        executor = _executor;
        admin = msg.sender;
    }

    // ============ Admin Functions ============

    /**
     * @dev Registers a new parameter that can be modified through governance.
     * @param parameterId Unique identifier for the parameter.
     * @param name Human-readable name.
     * @param level Importance level (APPLICATION, SYSTEM, INFRASTRUCTURE).
     * @param category Category identifier.
     * @param initialValue Initial encoded value.
     */
    function registerParameter(
        bytes32 parameterId,
        string calldata name,
        ParameterLevel level,
        bytes32 category,
        bytes calldata initialValue
    ) external onlyAdmin {
        require(parameterId != bytes32(0), "Invalid parameter ID");
        require(!parameters[parameterId].isRegistered, "Parameter already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        parameters[parameterId] = ParameterInfo({
            name: name,
            level: level,
            category: category,
            isRegistered: true,
            currentValue: initialValue
        });

        registeredParameters.push(parameterId);

        emit ParameterRegistered(parameterId, name, level, category);
    }

    /**
     * @dev Updates the importance level of a parameter.
     * @param parameterId The parameter to update.
     * @param newLevel The new importance level.
     */
    function updateParameterLevel(
        bytes32 parameterId,
        ParameterLevel newLevel
    ) external onlyAdmin {
        require(parameters[parameterId].isRegistered, "Parameter not registered");
        
        ParameterLevel oldLevel = parameters[parameterId].level;
        parameters[parameterId].level = newLevel;

        emit ParameterLevelUpdated(parameterId, oldLevel, newLevel);
    }

    /**
     * @dev Updates the executor address.
     * @param newExecutor The new executor address.
     */
    function setExecutor(address newExecutor) external onlyAdmin {
        require(newExecutor != address(0), "Invalid executor address");
        
        address oldExecutor = executor;
        executor = newExecutor;

        emit ExecutorUpdated(oldExecutor, newExecutor);
    }

    /**
     * @dev Transfers admin role to a new address.
     * @param newAdmin The new admin address.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        
        address oldAdmin = admin;
        admin = newAdmin;

        emit AdminTransferred(oldAdmin, newAdmin);
    }

    // ============ Proposal Functions ============

    /**
     * @dev Creates a proposal to modify a parameter.
     * @param parameterId The parameter to modify.
     * @param newValue The proposed new value (encoded).
     * @param description Description of the change.
     */
    function proposeParameterChange(
        bytes32 parameterId,
        bytes calldata newValue,
        string calldata description
    ) external returns (uint256) {
        require(parameters[parameterId].isRegistered, "Parameter not registered");
        require(govToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to propose");
        require(newValue.length > 0, "New value cannot be empty");

        proposalCount++;
        uint256 proposalId = proposalCount;

        ParameterProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.parameterId = parameterId;
        proposal.newValue = newValue;
        proposal.description = description;
        proposal.startTime = block.timestamp + VOTING_DELAY;
        proposal.endTime = block.timestamp + VOTING_DELAY + VOTING_PERIOD;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.executed = false;
        proposal.canceled = false;

        parameterProposalHistory[parameterId].push(proposalId);

        uint256 threshold = getThresholdForParameter(parameterId);

        emit ParameterProposalCreated(
            proposalId,
            msg.sender,
            parameterId,
            newValue,
            description,
            proposal.startTime,
            proposal.endTime,
            threshold
        );

        return proposalId;
    }

    /**
     * @dev Casts a vote on a proposal.
     * @param proposalId The proposal to vote on.
     * @param support True for in favor, false for against.
     */
    function vote(uint256 proposalId, bool support) external {
        ParameterProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.canceled, "Proposal is canceled");
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= proposal.startTime, "Voting not started");
        require(block.timestamp <= proposal.endTime, "Voting ended");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 weight = govToken.balanceOf(msg.sender);
        require(weight > 0, "No voting power");

        proposal.hasVoted[msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /**
     * @dev Executes a successful proposal.
     * @param proposalId The proposal to execute.
     */
    function execute(uint256 proposalId) external {
        ParameterProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");

        proposal.executed = true;

        bytes32 parameterId = proposal.parameterId;
        bytes memory oldValue = parameters[parameterId].currentValue;
        parameters[parameterId].currentValue = proposal.newValue;

        emit ProposalExecuted(proposalId, parameterId, oldValue, proposal.newValue);
    }

    /**
     * @dev Cancels a proposal. Only the proposer can cancel before voting ends.
     * @param proposalId The proposal to cancel.
     */
    function cancel(uint256 proposalId) external {
        ParameterProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");
        require(msg.sender == proposal.proposer, "Only proposer can cancel");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        require(block.timestamp <= proposal.endTime, "Voting already ended");

        proposal.canceled = true;

        emit ProposalCanceled(proposalId);
    }

    // ============ View Functions ============

    /**
     * @dev Returns the approval threshold for a given parameter level.
     * @param level The parameter level.
     * @return The threshold in basis points.
     */
    function getThresholdForLevel(ParameterLevel level) public pure returns (uint256) {
        if (level == ParameterLevel.APPLICATION) {
            return APPLICATION_THRESHOLD;  // 2/3 = 66.67%
        } else if (level == ParameterLevel.SYSTEM) {
            return SYSTEM_THRESHOLD;       // 3/4 = 75%
        } else {
            return INFRASTRUCTURE_THRESHOLD;  // 4/5 = 80%
        }
    }

    /**
     * @dev Returns the approval threshold for a specific parameter.
     * @param parameterId The parameter ID.
     * @return The threshold in basis points.
     */
    function getThresholdForParameter(bytes32 parameterId) public view returns (uint256) {
        require(parameters[parameterId].isRegistered, "Parameter not registered");
        return getThresholdForLevel(parameters[parameterId].level);
    }

    /**
     * @dev Returns the current state of a proposal.
     * @param proposalId The proposal ID.
     * @return The current proposal state.
     */
    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        ParameterProposal storage proposal = proposals[proposalId];
        
        require(proposal.id != 0, "Proposal does not exist");

        if (proposal.canceled) {
            return ProposalState.Canceled;
        }

        if (proposal.executed) {
            return ProposalState.Executed;
        }

        if (block.timestamp < proposal.startTime) {
            return ProposalState.Pending;
        }

        if (block.timestamp <= proposal.endTime) {
            return ProposalState.Active;
        }

        // Voting has ended, check if passed
        if (_isProposalSuccessful(proposalId)) {
            return ProposalState.Succeeded;
        }

        return ProposalState.Defeated;
    }

    /**
     * @dev Checks if a proposal has met its approval threshold.
     * @param proposalId The proposal ID.
     * @return True if the proposal has passed.
     */
    function _isProposalSuccessful(uint256 proposalId) internal view returns (bool) {
        ParameterProposal storage proposal = proposals[proposalId];
        
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        if (totalVotes == 0) {
            return false;
        }

        uint256 threshold = getThresholdForParameter(proposal.parameterId);
        
        // Check if forVotes >= threshold percentage of totalVotes
        // forVotes * BASIS_POINTS >= threshold * totalVotes
        return proposal.forVotes * BASIS_POINTS >= threshold * totalVotes;
    }

    /**
     * @dev Returns detailed proposal information.
     * @param proposalId The proposal ID.
     */
    /**
     * @dev Returns basic proposal information.
     * @param proposalId The proposal ID.
     */
    function getProposalBasic(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        bytes32 parameterId,
        string memory description,
        ProposalState state,
        uint256 requiredThreshold
    ) {
        ParameterProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.id,
            proposal.proposer,
            proposal.parameterId,
            proposal.description,
            getProposalState(proposalId),
            getThresholdForParameter(proposal.parameterId)
        );
    }

    /**
     * @dev Returns proposal timing and voting information.
     * @param proposalId The proposal ID.
     */
    function getProposalDetails(uint256 proposalId) external view returns (
        bytes memory newValue,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        ParameterProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.newValue,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    /**
     * @dev Returns full proposal information (combines basic and details).
     * @param proposalId The proposal ID.
     */
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        bytes32 parameterId,
        bytes memory newValue,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        ParameterProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.id,
            proposal.proposer,
            proposal.parameterId,
            proposal.newValue,
            proposal.description,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    /**
     * @dev Returns parameter information.
     * @param parameterId The parameter ID.
     */
    function getParameter(bytes32 parameterId) external view returns (
        string memory name,
        ParameterLevel level,
        bytes32 category,
        bool isRegistered,
        bytes memory currentValue,
        uint256 threshold
    ) {
        ParameterInfo storage param = parameters[parameterId];
        
        return (
            param.name,
            param.level,
            param.category,
            param.isRegistered,
            param.currentValue,
            param.isRegistered ? getThresholdForLevel(param.level) : 0
        );
    }

    /**
     * @dev Returns all registered parameter IDs.
     */
    function getAllParameters() external view returns (bytes32[] memory) {
        return registeredParameters;
    }

    /**
     * @dev Returns the number of registered parameters.
     */
    function getParameterCount() external view returns (uint256) {
        return registeredParameters.length;
    }

    /**
     * @dev Returns proposal history for a parameter.
     * @param parameterId The parameter ID.
     */
    function getParameterProposalHistory(bytes32 parameterId) external view returns (uint256[] memory) {
        return parameterProposalHistory[parameterId];
    }

    /**
     * @dev Checks if an address has voted on a proposal.
     * @param proposalId The proposal ID.
     * @param voter The voter address.
     */
    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    /**
     * @dev Returns the current voting results for a proposal.
     * @param proposalId The proposal ID.
     */
    function getVotingResults(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 totalVotes,
        uint256 forPercentage,
        uint256 requiredThreshold,
        bool isPassing
    ) {
        ParameterProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        uint256 total = proposal.forVotes + proposal.againstVotes;
        uint256 forPct = total > 0 ? (proposal.forVotes * BASIS_POINTS) / total : 0;
        uint256 threshold = getThresholdForParameter(proposal.parameterId);

        return (
            proposal.forVotes,
            proposal.againstVotes,
            total,
            forPct,
            threshold,
            proposal.forVotes * BASIS_POINTS >= threshold * total
        );
    }

    // ============ Helper Functions ============

    /**
     * @dev Generates a parameter ID from name and category.
     * @param name Parameter name.
     * @param category Parameter category.
     */
    function generateParameterId(
        string calldata name,
        bytes32 category
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(name, category));
    }

    /**
     * @dev Encodes a uint256 value for storage.
     * @param value The value to encode.
     */
    function encodeUint256(uint256 value) external pure returns (bytes memory) {
        return abi.encode(value);
    }

    /**
     * @dev Decodes a uint256 value from storage.
     * @param data The encoded data.
     */
    function decodeUint256(bytes calldata data) external pure returns (uint256) {
        return abi.decode(data, (uint256));
    }

    /**
     * @dev Encodes a string value for storage.
     * @param value The value to encode.
     */
    function encodeString(string calldata value) external pure returns (bytes memory) {
        return abi.encode(value);
    }

    /**
     * @dev Decodes a string value from storage.
     * @param data The encoded data.
     */
    function decodeString(bytes calldata data) external pure returns (string memory) {
        return abi.decode(data, (string));
    }

    /**
     * @dev Encodes an address value for storage.
     * @param value The value to encode.
     */
    function encodeAddress(address value) external pure returns (bytes memory) {
        return abi.encode(value);
    }

    /**
     * @dev Decodes an address value from storage.
     * @param data The encoded data.
     */
    function decodeAddress(bytes calldata data) external pure returns (address) {
        return abi.decode(data, (address));
    }

    /**
     * @dev Encodes a bool value for storage.
     * @param value The value to encode.
     */
    function encodeBool(bool value) external pure returns (bytes memory) {
        return abi.encode(value);
    }

    /**
     * @dev Decodes a bool value from storage.
     * @param data The encoded data.
     */
    function decodeBool(bytes calldata data) external pure returns (bool) {
        return abi.decode(data, (bool));
    }
}
