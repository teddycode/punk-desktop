// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC20 interface for governance voting power.
 */
interface IUpgradeGovERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @dev Minimal UUPS proxy/admin surface used by this governance contract.
 */
interface IUUPSUpgradeTarget {
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable;
}

/**
 * @title UpgradeGovernance
 * @dev Lightweight governance framework for UUPS-style contract upgrades.
 *
 * This contract intentionally mirrors ParameterRegistry's proposal lifecycle and
 * voting rules while keeping upgrade validation minimal for the first version.
 */
contract UpgradeGovernance {
    // ============ Enums ============

    enum ContractLevel {
        APPLICATION,
        SYSTEM,
        INFRASTRUCTURE
    }

    enum ProposalState {
        Pending,
        Active,
        Succeeded,
        Defeated,
        Executed,
        Canceled
    }

    // ============ Structs ============

    struct UpgradeableContractInfo {
        address proxy;
        string name;
        ContractLevel level;
        bytes32 category;
        bool isRegistered;
        address currentImplementation;
        address registeredBy;
    }

    struct UpgradeProposal {
        uint256 id;
        address proposer;
        address proxy;
        address oldImplementation;
        address newImplementation;
        bytes callData;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
        mapping(address => bool) hasVoted;
    }

    // ============ Constants ============

    uint256 public constant VOTING_DELAY = 60;
    uint256 public constant VOTING_PERIOD = 120;

    uint256 public constant APPLICATION_THRESHOLD = 6667;
    uint256 public constant SYSTEM_THRESHOLD = 7500;
    uint256 public constant INFRASTRUCTURE_THRESHOLD = 8000;
    uint256 public constant BASIS_POINTS = 10000;

    // ============ State Variables ============

    IUpgradeGovERC20 public immutable govToken;

    uint256 public proposalCount;
    address[] public registeredProxies;

    mapping(address => UpgradeableContractInfo) public upgradeableContracts;
    mapping(uint256 => UpgradeProposal) internal proposals;
    mapping(address => uint256[]) public proxyProposalHistory;

    // ============ Events ============

    event UpgradeableContractRegistered(
        address indexed proxy,
        address indexed registeredBy,
        string name,
        ContractLevel level,
        bytes32 category,
        address currentImplementation
    );

    event UpgradeProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address indexed proxy,
        address oldImplementation,
        address newImplementation,
        bytes callData,
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

    event UpgradeExecuted(
        uint256 indexed proposalId,
        address indexed proxy,
        address oldImplementation,
        address newImplementation,
        bytes callData
    );

    event ProposalCanceled(uint256 indexed proposalId);

    // ============ Constructor ============

    constructor(address _govToken) {
        require(_govToken != address(0), "Invalid governance token address");
        govToken = IUpgradeGovERC20(_govToken);
    }

    // ============ Registration Functions ============

    /**
     * @dev Registers a proxy as eligible for upgrade governance. Anyone may call this.
     */
    function registerUpgradeableContract(
        address proxy,
        string calldata name,
        ContractLevel level,
        bytes32 category,
        address currentImplementation
    ) external {
        require(proxy != address(0), "Invalid proxy address");
        require(!upgradeableContracts[proxy].isRegistered, "Proxy already registered");
        require(bytes(name).length > 0, "Name cannot be empty");

        upgradeableContracts[proxy] = UpgradeableContractInfo({
            proxy: proxy,
            name: name,
            level: level,
            category: category,
            isRegistered: true,
            currentImplementation: currentImplementation,
            registeredBy: msg.sender
        });

        registeredProxies.push(proxy);

        emit UpgradeableContractRegistered(
            proxy,
            msg.sender,
            name,
            level,
            category,
            currentImplementation
        );
    }

    // ============ Proposal Functions ============

    function proposeUpgrade(
        address proxy,
        address newImplementation,
        bytes calldata callData,
        string calldata description
    ) external returns (uint256) {
        UpgradeableContractInfo storage info = upgradeableContracts[proxy];

        require(info.isRegistered, "Proxy not registered");
        require(govToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to propose");
        require(newImplementation != address(0), "Invalid implementation address");
        require(newImplementation != info.currentImplementation, "Implementation unchanged");

        proposalCount++;
        uint256 proposalId = proposalCount;

        UpgradeProposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.proxy = proxy;
        proposal.oldImplementation = info.currentImplementation;
        proposal.newImplementation = newImplementation;
        proposal.callData = callData;
        proposal.description = description;
        proposal.startTime = block.timestamp + VOTING_DELAY;
        proposal.endTime = block.timestamp + VOTING_DELAY + VOTING_PERIOD;
        proposal.forVotes = 0;
        proposal.againstVotes = 0;
        proposal.executed = false;
        proposal.canceled = false;

        proxyProposalHistory[proxy].push(proposalId);

        uint256 threshold = getThresholdForProxy(proxy);

        emit UpgradeProposalCreated(
            proposalId,
            msg.sender,
            proxy,
            proposal.oldImplementation,
            newImplementation,
            callData,
            description,
            proposal.startTime,
            proposal.endTime,
            threshold
        );

        return proposalId;
    }

    function vote(uint256 proposalId, bool support) external {
        UpgradeProposal storage proposal = proposals[proposalId];

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
     * @dev Executes a successful upgrade proposal. Anyone may call this.
     */
    function executeUpgrade(uint256 proposalId) external {
        UpgradeProposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(block.timestamp > proposal.endTime, "Voting not ended");
        require(getProposalState(proposalId) == ProposalState.Succeeded, "Proposal not succeeded");

        proposal.executed = true;

        IUUPSUpgradeTarget(proposal.proxy).upgradeToAndCall(
            proposal.newImplementation,
            proposal.callData
        );

        upgradeableContracts[proposal.proxy].currentImplementation = proposal.newImplementation;

        emit UpgradeExecuted(
            proposalId,
            proposal.proxy,
            proposal.oldImplementation,
            proposal.newImplementation,
            proposal.callData
        );
    }

    function cancel(uint256 proposalId) external {
        UpgradeProposal storage proposal = proposals[proposalId];

        require(proposal.id != 0, "Proposal does not exist");
        require(msg.sender == proposal.proposer, "Only proposer can cancel");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");
        require(block.timestamp <= proposal.endTime, "Voting already ended");

        proposal.canceled = true;

        emit ProposalCanceled(proposalId);
    }

    // ============ View Functions ============

    function getThresholdForLevel(ContractLevel level) public pure returns (uint256) {
        if (level == ContractLevel.APPLICATION) {
            return APPLICATION_THRESHOLD;
        } else if (level == ContractLevel.SYSTEM) {
            return SYSTEM_THRESHOLD;
        } else {
            return INFRASTRUCTURE_THRESHOLD;
        }
    }

    function getThresholdForProxy(address proxy) public view returns (uint256) {
        require(upgradeableContracts[proxy].isRegistered, "Proxy not registered");
        return getThresholdForLevel(upgradeableContracts[proxy].level);
    }

    function getProposalState(uint256 proposalId) public view returns (ProposalState) {
        UpgradeProposal storage proposal = proposals[proposalId];

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

        if (_isProposalSuccessful(proposalId)) {
            return ProposalState.Succeeded;
        }

        return ProposalState.Defeated;
    }

    function getUpgradeableContract(address proxy) external view returns (
        address registeredProxy,
        string memory name,
        ContractLevel level,
        bytes32 category,
        bool isRegistered,
        address currentImplementation,
        address registeredBy,
        uint256 threshold
    ) {
        UpgradeableContractInfo storage info = upgradeableContracts[proxy];

        return (
            info.proxy,
            info.name,
            info.level,
            info.category,
            info.isRegistered,
            info.currentImplementation,
            info.registeredBy,
            info.isRegistered ? getThresholdForLevel(info.level) : 0
        );
    }

    function getAllRegisteredProxies() external view returns (address[] memory) {
        return registeredProxies;
    }

    function getRegisteredProxyCount() external view returns (uint256) {
        return registeredProxies.length;
    }

    function getProxyProposalHistory(address proxy) external view returns (uint256[] memory) {
        return proxyProposalHistory[proxy];
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    function getProposalBasic(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        address proxy,
        string memory description,
        ProposalState state,
        uint256 requiredThreshold
    ) {
        UpgradeProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.id,
            proposal.proposer,
            proposal.proxy,
            proposal.description,
            getProposalState(proposalId),
            getThresholdForProxy(proposal.proxy)
        );
    }

    function getProposalDetails(uint256 proposalId) external view returns (
        bytes memory callData,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        UpgradeProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.callData,
            proposal.startTime,
            proposal.endTime,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.executed,
            proposal.canceled
        );
    }

    function getProposalUpgrade(uint256 proposalId) external view returns (
        address oldImplementation,
        address newImplementation,
        bytes memory callData
    ) {
        UpgradeProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        return (
            proposal.oldImplementation,
            proposal.newImplementation,
            proposal.callData
        );
    }

    function getVotingResults(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 totalVotes,
        uint256 forPercentage,
        uint256 requiredThreshold,
        bool isPassing
    ) {
        UpgradeProposal storage proposal = proposals[proposalId];
        require(proposal.id != 0, "Proposal does not exist");

        uint256 total = proposal.forVotes + proposal.againstVotes;
        uint256 forPct = total > 0 ? (proposal.forVotes * BASIS_POINTS) / total : 0;
        uint256 threshold = getThresholdForProxy(proposal.proxy);

        return (
            proposal.forVotes,
            proposal.againstVotes,
            total,
            forPct,
            threshold,
            proposal.forVotes * BASIS_POINTS >= threshold * total
        );
    }

    function _isProposalSuccessful(uint256 proposalId) internal view returns (bool) {
        UpgradeProposal storage proposal = proposals[proposalId];

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        if (totalVotes == 0) {
            return false;
        }

        uint256 threshold = getThresholdForProxy(proposal.proxy);
        return proposal.forVotes * BASIS_POINTS >= threshold * totalVotes;
    }
}
