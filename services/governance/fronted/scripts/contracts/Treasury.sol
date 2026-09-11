// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC20
 * @dev Interface for the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title Treasury
 * @dev Manages multiple asset types including native tokens (PUNK) and ERC20 tokens.
 * Supports asset admission/removal mechanism for treasury fund circulation.
 * Handles inflow from slashing mechanisms and outflow via governance voting.
 * Note: PUNK is the native token of this chain (similar to ETH on Ethereum).
 */
contract Treasury {
    // ============ Constants ============
    
    // Special address representing native token (PUNK)
    // PUNK is the native token of this blockchain, similar to ETH on Ethereum
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);
    
    // Governance Constants
    uint256 public constant VOTING_DELAY = 1 days; // Time between proposal and voting start
    uint256 public constant VOTING_PERIOD = 3 days; // Duration of voting
    uint256 public constant MIN_QUORUM_PERCENTAGE = 4; // 4% of total supply needed

    // ============ State Variables ============
    
    // The Governance token used for voting weight
    IERC20 public govToken;
    
    // Contract admin (for asset management)
    address public admin;
    
    // ============ Asset Management ============
    
    // Asset information structure
    struct AssetInfo {
        bool isAdmitted;      // Whether the asset is admitted for circulation
        string symbol;        // Asset symbol (e.g., "ETH", "PUNK")
        uint8 decimals;       // Asset decimals
        uint256 totalDeposited; // Total amount deposited
        uint256 totalWithdrawn; // Total amount withdrawn
    }
    
    // Mapping from token address to asset info (NATIVE_TOKEN for ETH)
    mapping(address => AssetInfo) public assets;
    
    // List of all admitted asset addresses
    address[] public admittedAssets;
    
    // ============ Proposal Structure ============
    
    struct Proposal {
        uint256 id;
        address proposer;
        address token;       // Token address (NATIVE_TOKEN for ETH)
        address target;      // Address to receive tokens
        uint256 amount;      // Amount of tokens to transfer
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool canceled;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    // Mapping from proposalId => voter => hasVoted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ============ Events ============
    
    // Asset management events
    event AssetAdmitted(address indexed token, string symbol, uint8 decimals);
    event AssetRemoved(address indexed token);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    
    // Fund flow events
    event Deposit(address indexed token, address indexed sender, uint256 amount, string reason);
    event NativeDeposit(address indexed sender, uint256 amount, string reason);
    event Withdraw(address indexed token, address indexed to, uint256 amount, string reason);
    
    // Governance events
    event ProposalCreated(uint256 indexed id, address indexed proposer, address token, address target, uint256 amount, string description);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCanceled(uint256 indexed id);

    // ============ Modifiers ============
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyAdmittedAsset(address token) {
        require(assets[token].isAdmitted, "Asset not admitted for circulation");
        _;
    }

    // ============ Constructor ============
    
    /**
     * @dev Constructor to set the Governance token address and initialize admin.
     * @param _govToken Address of the Governance token contract (Voting Power).
     */
    constructor(address _govToken) {
        require(_govToken != address(0), "Invalid Governance token address");
        govToken = IERC20(_govToken);
        admin = msg.sender;
        
        // Automatically admit native token (PUNK)
        // PUNK is the native token of this blockchain
        assets[NATIVE_TOKEN] = AssetInfo({
            isAdmitted: true,
            symbol: "PUNK",
            decimals: 18,
            totalDeposited: 0,
            totalWithdrawn: 0
        });
        admittedAssets.push(NATIVE_TOKEN);
        emit AssetAdmitted(NATIVE_TOKEN, "PUNK", 18);
    }
    
    // ============ Asset Management Functions ============
    
    /**
     * @dev Admits a new ERC20 token for treasury circulation.
     * @param token Address of the ERC20 token contract.
     * @param symbol Token symbol.
     * @param decimals Token decimals.
     */
    function admitAsset(address token, string calldata symbol, uint8 decimals) external onlyAdmin {
        require(token != address(0), "Invalid token address");
        require(token != NATIVE_TOKEN, "Use NATIVE_TOKEN constant for native token");
        require(!assets[token].isAdmitted, "Asset already admitted");
        
        assets[token] = AssetInfo({
            isAdmitted: true,
            symbol: symbol,
            decimals: decimals,
            totalDeposited: 0,
            totalWithdrawn: 0
        });
        admittedAssets.push(token);
        
        emit AssetAdmitted(token, symbol, decimals);
    }
    
    /**
     * @dev Removes an asset from treasury circulation.
     * Note: Existing funds remain in treasury but cannot be used in new proposals.
     * @param token Address of the token to remove.
     */
    function removeAsset(address token) external onlyAdmin {
        require(assets[token].isAdmitted, "Asset not admitted");
        require(token != NATIVE_TOKEN, "Cannot remove native token (PUNK)");
        
        assets[token].isAdmitted = false;
        
        // Remove from admittedAssets array
        for (uint256 i = 0; i < admittedAssets.length; i++) {
            if (admittedAssets[i] == token) {
                admittedAssets[i] = admittedAssets[admittedAssets.length - 1];
                admittedAssets.pop();
                break;
            }
        }
        
        emit AssetRemoved(token);
    }
    
    /**
     * @dev Transfers admin role to a new address.
     * @param newAdmin Address of the new admin.
     */
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid new admin address");
        address previousAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(previousAdmin, newAdmin);
    }
    
    /**
     * @dev Returns the list of all admitted assets.
     */
    function getAdmittedAssets() external view returns (address[] memory) {
        return admittedAssets;
    }
    
    /**
     * @dev Checks if an asset is admitted for circulation.
     * @param token Address of the token to check.
     */
    function isAssetAdmitted(address token) external view returns (bool) {
        return assets[token].isAdmitted;
    }
    
    /**
     * @dev Returns the balance of a specific asset in the treasury.
     * @param token Address of the token (NATIVE_TOKEN for PUNK).
     */
    function getAssetBalance(address token) public view returns (uint256) {
        if (token == NATIVE_TOKEN) {
            // PUNK is native token, use contract balance
            return address(this).balance;
        } else {
            return IERC20(token).balanceOf(address(this));
        }
    }
    
    /**
     * @dev Returns balances of all admitted assets.
     */
    function getAllAssetBalances() external view returns (address[] memory tokens, uint256[] memory balances) {
        tokens = admittedAssets;
        balances = new uint256[](admittedAssets.length);
        for (uint256 i = 0; i < admittedAssets.length; i++) {
            balances[i] = getAssetBalance(admittedAssets[i]);
        }
    }

    // ============ Deposit Functions ============

    /**
     * @dev Allows the contract to receive native tokens (PUNK).
     */
    receive() external payable {
        require(assets[NATIVE_TOKEN].isAdmitted, "Native token (PUNK) not admitted");
        assets[NATIVE_TOKEN].totalDeposited += msg.value;
        emit NativeDeposit(msg.sender, msg.value, "Direct PUNK transfer");
    }
    
    /**
     * @dev Deposits native tokens (PUNK) into the treasury.
     * @param reason Short description for the deposit.
     */
    function depositPunk(string calldata reason) external payable onlyAdmittedAsset(NATIVE_TOKEN) {
        require(msg.value > 0, "Amount must be greater than 0");
        assets[NATIVE_TOKEN].totalDeposited += msg.value;
        emit NativeDeposit(msg.sender, msg.value, reason);
    }

    /**
     * @dev Allows the contract to receive ERC20 tokens.
     * Can be called by the slashing mechanism to deposit penalized funds.
     * @param token Address of the ERC20 token.
     * @param amount The amount of tokens to deposit.
     * @param reason Short description or metadata for the deposit.
     */
    function deposit(address token, uint256 amount, string calldata reason) external onlyAdmittedAsset(token) {
        require(token != NATIVE_TOKEN, "Use depositPunk for PUNK native token");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from sender to this contract
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        assets[token].totalDeposited += amount;
        emit Deposit(token, msg.sender, amount, reason);
    }
    
    // ============ Proposal Functions ============

    /**
     * @dev Creates a proposal to transfer tokens from treasury.
     * @param token The token address (NATIVE_TOKEN for PUNK native token).
     * @param target The recipient address.
     * @param amount The amount of tokens to transfer.
     * @param description Description of the proposal.
     */
    function propose(address token, address target, uint256 amount, string calldata description) external onlyAdmittedAsset(token) returns (uint256) {
        require(target != address(0), "Invalid target address");
        require(amount > 0, "Amount must be greater than 0");
        require(govToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to propose");

        proposalCount++;
        uint256 proposalId = proposalCount;

        uint256 startTime = block.timestamp + VOTING_DELAY;
        uint256 endTime = startTime + VOTING_PERIOD;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            token: token,
            target: target,
            amount: amount,
            description: description,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            canceled: false
        });

        emit ProposalCreated(proposalId, msg.sender, token, target, amount, description);
        return proposalId;
    }

    // ============ Voting Functions ============
    
    /**
     * @dev Casts a vote on a proposal.
     * @param proposalId The ID of the proposal.
     * @param support True for 'For', False for 'Against'.
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.startTime, "Voting has not started");
        require(block.timestamp <= proposal.endTime, "Voting has ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal canceled");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = govToken.balanceOf(msg.sender);
        require(weight > 0, "No voting weight");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.forVotes += weight;
        } else {
            proposal.againstVotes += weight;
        }

        emit VoteCast(msg.sender, proposalId, support, weight);
    }
    
    // ============ Execution Functions ============

    /**
     * @dev Executes a successful proposal.
     * @param proposalId The ID of the proposal.
     */
    function execute(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Canceled");
        
        // Check if the asset is still admitted
        require(assets[proposal.token].isAdmitted, "Asset no longer admitted");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 totalSupply = govToken.totalSupply();
        
        // Check Quorum
        require(totalVotes >= (totalSupply * MIN_QUORUM_PERCENTAGE) / 100, "Quorum not reached");
        
        // Check Majority
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");

        // Check Treasury Balance
        uint256 balance = getAssetBalance(proposal.token);
        require(balance >= proposal.amount, "Insufficient Treasury balance");

        proposal.executed = true;
        
        // Update withdrawal stats
        assets[proposal.token].totalWithdrawn += proposal.amount;

        // Transfer Funds
        if (proposal.token == NATIVE_TOKEN) {
            // Transfer native token (ETH)
            (bool success, ) = proposal.target.call{value: proposal.amount}("");
            require(success, "ETH transfer failed");
        } else {
            // Transfer ERC20 token
            require(IERC20(proposal.token).transfer(proposal.target, proposal.amount), "Token transfer failed");
        }

        emit ProposalExecuted(proposalId);
    }

    // ============ Cancel Functions ============
    
    /**
     * @dev Cancels a proposal (only proposer).
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(msg.sender == proposal.proposer, "Only proposer can cancel");
        require(!proposal.executed, "Already executed");
        require(block.timestamp < proposal.endTime, "Voting ended");

        proposal.canceled = true;
        emit ProposalCanceled(proposalId);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Returns detailed information about a proposal.
     * @param proposalId The ID of the proposal.
     */
    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        address token,
        address target,
        uint256 amount,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        uint256 forVotes,
        uint256 againstVotes,
        bool executed,
        bool canceled
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.token,
            p.target,
            p.amount,
            p.description,
            p.startTime,
            p.endTime,
            p.forVotes,
            p.againstVotes,
            p.executed,
            p.canceled
        );
    }
    
    /**
     * @dev Returns asset statistics.
     * @param token The token address.
     */
    function getAssetStats(address token) external view returns (
        bool isAdmitted,
        string memory symbol,
        uint8 decimals,
        uint256 balance,
        uint256 totalDeposited,
        uint256 totalWithdrawn
    ) {
        AssetInfo storage info = assets[token];
        return (
            info.isAdmitted,
            info.symbol,
            info.decimals,
            getAssetBalance(token),
            info.totalDeposited,
            info.totalWithdrawn
        );
    }
}
