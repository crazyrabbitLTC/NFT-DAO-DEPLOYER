// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorStorage.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/// @title A Governor contract for decentralized governance.
/// @notice Implements voting governance with timelock control.
/// @dev Extends OpenZeppelin's Governor and various related contracts.
/// @custom:security-contact dennison@tally.xyz
contract MyGovernor is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorStorage,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    mapping(uint256 => address) public proposalProposer;

    error OnlyProposerCanCancel();
    error OnlyPendingProposalsCanBeCancelled();

    /// @notice Initializes the governance contract.
    /// @param _token The token used for voting.
    /// @param _timelock The timelock controller for executing proposals.
    /// @param name The name of the governance system.
    /// @param votingPeriod The period in which voting is allowed.
    /// @param votingDelay The delay before voting on a proposal begins.
    /// @param proposalThreshold The minimum number of votes required to submit a proposal.
    /// @param percentQuorum The percentage of votes required for quorum.
    constructor(
        IVotes _token,
        TimelockController _timelock,
        string memory name,
        uint256 votingPeriod,
        uint256 votingDelay,
        uint256 proposalThreshold,
        uint256 percentQuorum
    )
        Governor(name)
        GovernorSettings(votingDelay, votingPeriod, proposalThreshold)
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(percentQuorum)
        GovernorTimelockControl(_timelock)
    {}

    /// @notice Returns the voting delay.
    /// @dev Overrides Governor and GovernorSettings.
    /// @return The delay before voting on a proposal can start.
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    /// @notice Returns the voting period.
    /// @dev Overrides Governor and GovernorSettings.
    /// @return The period during which voting is open.
    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    /// @notice Returns the quorum required for a proposal at a given block.
    /// @dev Overrides Governor and GovernorVotesQuorumFraction.
    /// @param blockNumber The block number to check the quorum.
    /// @return The number of votes required to reach quorum.
    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    /// @notice Returns the current state of a proposal.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @param proposalId The ID of the proposal.
    /// @return The current state of the proposal.
    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    /// @notice Checks if a proposal needs to be queued in the timelock.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @param proposalId The ID of the proposal to check.
    /// @return True if the proposal needs to be queued.
    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    /// @notice Returns the threshold of votes required to submit a proposal.
    /// @dev Overrides Governor and GovernorSettings.
    /// @return The number of votes required to submit a proposal.
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    /// @notice Internal function to handle proposal creation logic.
    /// @dev Overrides Governor and GovernorStorage.
    /// @param targets The addresses of the contracts called by the proposal.
    /// @param values The ether values for each call.
    /// @param calldatas The calldata for each call.
    /// @param description The description of the proposal.
    /// @param proposer The address of the proposer.
    /// @return The proposal ID.
    function _propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        address proposer
    ) internal override(Governor, GovernorStorage) returns (uint256) {
        uint256 proposalId = hashProposal(targets, values, calldatas, keccak256(bytes(description)));
        proposalProposer[proposalId] = proposer;
        return super._propose(targets, values, calldatas, description, proposer);
    }

    /// @notice Internal function to queue operations in the timelock.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @param proposalId The ID of the proposal.
    /// @param targets The addresses of the contracts called by the proposal.
    /// @param values The ether values for each call.
    /// @param calldatas The calldata for each call.
    /// @param descriptionHash The hash of the proposal's description.
    /// @return The timestamp when the operations are queued.
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /// @notice Internal function to execute operations in the timelock.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @param proposalId The ID of the proposal.
    /// @param targets The addresses of the contracts called by the proposal.
    /// @param values The ether values for each call.
    /// @param calldatas The calldata for each call.
    /// @param descriptionHash The hash of the proposal's description.
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    /// @notice Internal function to cancel a proposal.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @param targets The addresses of the contracts called by the proposal.
    /// @param values The ether values for each call.
    /// @param calldatas The calldata for each call.
    /// @param descriptionHash The hash of the proposal's description.
    /// @return The proposal ID of the cancelled proposal.
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    /// @notice Allows a proposer to cancel their proposal.
    /// @dev Can only be called by the proposer and only for pending proposals.
    /// @param proposalId The ID of the proposal to cancel.
    function cancel(uint256 proposalId) public override(Governor, GovernorTimelockControl) {
        require(state(proposalId) == ProposalState.Pending, OnlyPendingProposalsCanBeCancelled());
        require(proposalProposer[proposalId] == msg.sender, OnlyProposerCanCancel());
        _cancel(
            proposalDetails(proposalId).targets,
            proposalDetails(proposalId).values,
            proposalDetails(proposalId).calldatas,
            proposalDetails(proposalId).descriptionHash
        );
    }

    /// @notice Returns the executor of the timelock.
    /// @dev Overrides Governor and GovernorTimelockControl.
    /// @return The address of the executor.
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
}
