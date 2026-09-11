# Treasury System (Execution Layer)

This directory contains the Solidity implementation of the Treasury system for the Execution Layer.

## Architecture

The Treasury contract interacts with the Execution Layer (EVM) to manage PUNK tokens (ERC-20).

### Key Components

1.  **Asset (PUNK Token)**: The token being managed. It flows into the treasury from slashing mechanisms and flows out via governance.
2.  **Treasury Contract (`Treasury.sol`)**:
    *   **System-Level EVM Address**: Acts as the custodian of PUNK funds.
    *   **Inflow**: Accepts PUNK tokens via the `deposit` function. This is designed to be called by the Slashing/Penalty mechanism or manually after approval.
    *   **Outflow**: Funds can only leave the treasury through a `Proposal` -> `Vote` -> `Execute` process.

### Workflow

1.  **Inflow (Slashing/Deposit)**:
    *   The Slashing mechanism (or any user) calls `punkToken.approve(treasuryAddress, amount)`.
    *   Then calls `treasury.deposit(amount, "Slashing Validator 0x123")`.
    *   Funds are now held by the Treasury.

2.  **Outflow (Governance)**:
    *   **Propose**: Any governance token holder can create a proposal to transfer PUNK to a target address.
        *   `propose(targetAddress, amount, "Funding Dev Team")`
    *   **Vote**: Governance token holders vote 'For' or 'Against' during the voting period.
        *   `vote(proposalId, true)`
    *   **Execute**: If the voting period ends, Quorum is met (4%), and Majority is 'For', the proposal can be executed.
        *   `execute(proposalId)`
        *   The Treasury transfers PUNK to the `targetAddress`.

## Configuration

*   **Voting Delay**: 1 day
*   **Voting Period**: 3 days
*   **Quorum**: 4% of Governance Token Supply
