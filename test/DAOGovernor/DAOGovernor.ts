import { expect } from "chai";
import { ethers } from "hardhat";
import type { DAOGovernor } from "../types/DAOGovernor";
import type { DAOToken } from "../../types";
import type { TimelockController } from "@openzeppelin/contracts/governance/TimelockController";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DAOGovernor Contract", function () {
    let daoGovernor: DAOGovernor;
    let daoToken: DAOToken;
    let timelock: TimelockController;
    let admin: SignerWithAddress, voter1: SignerWithAddress, voter2: SignerWithAddress;

    beforeEach(async function () {
      [admin, voter1, voter2] = await ethers.getSigners();

      // Deploy the DAOToken contract
      const DAOTokenFactory = await ethers.getContractFactory("DAOToken");
      daoToken = await DAOTokenFactory.deploy(
          "https://base.uri/", // Base URI for token metadata
          "DAOToken",         // Name of the token
          "DAO"               // Symbol of the token
      );

      // Mint some tokens to voters
      await daoToken.connect(admin).safeMint(voter1.address, "tokenURI1");
      await daoToken.connect(admin).safeMint(voter2.address, "tokenURI2");
      await daoToken.connect(admin).safeMint(admin.address, "tokenURI0");


      // Delegate to themselves
      await daoToken.connect(voter1).delegate(voter1.address);
      await daoToken.connect(voter2).delegate(voter2.address);
      await daoToken.connect(admin).delegate(admin.address);

      // Deploy the TimelockController
      const TimelockControllerFactory = await ethers.getContractFactory("TimelockController");
      const minDelay = 3600; // 1 hour
      const proposers = [admin.address];
      const executors = [admin.address];
      timelock = await TimelockControllerFactory.deploy(minDelay, proposers, executors, admin.address);

      // Deploy the DAOGovernor contract
      const DAOGovernorFactory = await ethers.getContractFactory("DAOGovernor");
      daoGovernor = await DAOGovernorFactory.deploy(
          await daoToken.getAddress(),
          await timelock.getAddress(),
          "DAOGovernor",
          1,   // Voting period in blocks
          1,   // Voting delay in blocks
          1, // Proposal threshold
          1    // Quorum percentage (1%)
      );
  });

  describe("Governance Functionality", function () {
    let proposalId: string;
    const targets: string[] = []; // Array of target addresses for the proposal calls
    const values: string[] = []; // Array of ether values for the proposal calls
    const calldatas: string[] = []; // Array of calldatas for the proposal calls
    const description = "Test Proposal"; // Description of the proposal

    beforeEach(async function () {
        // Setup a proposal
        proposalId = await daoGovernor.hashProposal(targets, values, calldatas, ethers.keccak256(ethers.toUtf8Bytes(description)));
        await daoGovernor.connect(admin).propose(targets, values, calldatas, description);
    });

    it("should create a proposal with correct parameters", async function () {
        expect(await daoGovernor.proposalCount()).to.equal(1);
        const proposal = await daoGovernor.getProposalDetails(proposalId);
        expect(proposal.targets).to.deep.equal(targets);
        expect(proposal.values).to.deep.equal(values);
        expect(proposal.calldatas).to.deep.equal(calldatas);
        expect(proposal.description).to.equal(description);
    });

    it("should respect the voting period and delay", async function () {
        // Ensure that voting cannot start before the delay
        await expect(daoGovernor.castVote(proposalId, 1)).to.be.revertedWith("voting is closed");

        // Move forward in time to after the voting delay
        await ethers.provider.send("evm_increaseTime", [daoGovernor.votingDelay().toNumber() + 1]);
        await ethers.provider.send("evm_mine", []);

        // Now voting should be open
        await expect(daoGovernor.castVote(proposalId, 1)).to.not.be.reverted;

        // Move forward in time to after the voting period
        await ethers.provider.send("evm_increaseTime", [daoGovernor.votingPeriod().toNumber() + 1]);
        await ethers.provider.send("evm_mine", []);

        // Now voting should be closed
        await expect(daoGovernor.castVote(proposalId, 1)).to.be.revertedWith("voting is closed");
    });

    it("should require correct quorum and threshold", async function () {
        // Check if the proposal threshold is respected
        const threshold = await daoGovernor.proposalThreshold();
        await expect(daoGovernor.propose(targets, values, calldatas, description)).to.be.revertedWith("proposal threshold not met");

        // Vote and check for quorum
        await daoGovernor.castVote(proposalId, 1);
        const quorum = await daoGovernor.quorum(await ethers.provider.getBlockNumber());
        expect(await daoGovernor.hasQuorum(proposalId)).to.equal(quorum <= 1); // Assuming 1 vote has been cast
    });

    // Additional tests can be added as needed
});

    xdescribe("Voting Process", function () {
        beforeEach(async function () {
            // Setup for voting - create a proposal
        });

        it("should correctly tally votes and decide proposal outcome", async function () {
            // Simulate voting and check the outcome
        });
    });

    xdescribe("Timelock Control", function () {
        it("should queue and execute proposals correctly", async function () {
            // Test proposal execution through the timelock controller
        });

        it("should allow cancelling proposals", async function () {
            // Test proposal cancellation
        });
    });

    xdescribe("State and Parameters Verification", function () {
        it("should correctly report governance parameters", async function () {
            // Test for correct reporting of voting delay, period, threshold, etc.
        });
    });

    // Additional tests for specific contract functionalities
});
