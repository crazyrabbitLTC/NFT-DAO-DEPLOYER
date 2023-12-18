import { expect } from "chai";
import { ethers } from "hardhat";
import {
  loadFixture,
  time, mine
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";
import type { DAOGovernor } from "../types/DAOGovernor";
import type { DAOToken } from "../../types";
import type { TimelockController } from "@openzeppelin/contracts/governance/TimelockController";


describe("DAOGovernor Contract", function () {

  async function deployGovernanceFixture() {
    let admin: SignerWithAddress, voter1: SignerWithAddress, voter2: SignerWithAddress;
    [admin, voter1, voter2] = await ethers.getSigners();

    // Deploy the DAOToken contract
    const DAOTokenFactory = await ethers.getContractFactory("DAOToken");
    const daoToken: DAOToken = await DAOTokenFactory.deploy(
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
    const timelock = await TimelockControllerFactory.deploy(minDelay, proposers, executors, admin.address);

    // Deploy the DAOGovernor contract
    const DAOGovernorFactory = await ethers.getContractFactory("DAOGovernor");
    const daoGovernor = await DAOGovernorFactory.deploy(
      await daoToken.getAddress(),
      await timelock.getAddress(),
      "DAOGovernor",
      2,   // Voting period in blocks
      2,   // Voting delay in blocks
      1, // Proposal threshold
      1    // Quorum percentage (1%)
    );

    // grant the governor propose and execute roles
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
    const DEFAULT_ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();


    // Timelock controlled by governor
    await timelock.grantRole(PROPOSER_ROLE, await daoGovernor.getAddress());
    await timelock.grantRole(EXECUTOR_ROLE, await daoGovernor.getAddress());
    await timelock.grantRole(DEFAULT_ADMIN_ROLE, await daoGovernor.getAddress());

    const MINTER_ROLE = await daoToken.MINTER_ROLE();

    // Token controlled by Timelock
    await daoToken.grantRole(MINTER_ROLE, await timelock.getAddress());
    await daoToken.grantRole(DEFAULT_ADMIN_ROLE, await timelock.getAddress());

    return { daoGovernor, daoToken, timelock, admin, voter1, voter2 };
  }

  describe("Governance Functionality", function () {
    let proposalId: bigint;
    const targets: string[] = ["0x0000000000000000000000000000000000000000"]; // Array of target addresses for the proposal calls
    const values: string[] = ["0"]; // Array of ether values for the proposal calls
    const calldatas: string[] = ["0x"]; // Array of calldatas for the proposal calls
    const description = "Test Proposal"; // Description of the proposal

    it("should create a proposal with correct parameters", async function () {
      const { daoGovernor, admin } = await loadFixture(deployGovernanceFixture);

      proposalId = await daoGovernor.hashProposal(targets, values, calldatas, ethers.keccak256(ethers.toUtf8Bytes(description)));
      await expect(daoGovernor.connect(admin).propose(targets, values, calldatas, description)).to.be.not.reverted;

      expect(await daoGovernor.proposalCount()).to.equal(1);
      const proposal = await daoGovernor.proposalDetails(proposalId);
      expect(proposal[0]).to.deep.equal(targets);
      expect(proposal[1]).to.deep.equal(values);
      expect(proposal[2]).to.deep.equal(calldatas);
      expect(proposal[3]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(description)));
    });

    // Existing tests
  });

  describe("Full Proposal Cycle", function () {

    it("should complete a full proposal cycle to make DAOToken transferable", async function () {
      const { daoGovernor, timelock, daoToken, admin, voter1, voter2 } = await loadFixture(deployGovernanceFixture);
      const proposalDescription = "Test Proposal"; // Description of the proposal

      // Setup a proposal
      const toggleTransferabilityCalldata = daoToken.interface.encodeFunctionData("toggleTokenTransferability", []);
      const proposalId = await daoGovernor.hashProposal(
        [await daoToken.getAddress()],
        [0],
        [toggleTransferabilityCalldata],
        ethers.keccak256(ethers.toUtf8Bytes(proposalDescription))
      );
      await daoGovernor.connect(admin).propose(
        [await daoToken.getAddress()],
        [0],
        [toggleTransferabilityCalldata],
        proposalDescription
      );

      // Move past the voting delay
      // await time.increaseTo((await daoGovernor.votingDelay()) + (BigInt(1)));
      await mine((await daoGovernor.votingDelay()));


      // Vote on the proposal
      await daoGovernor.connect(voter1).castVote(proposalId, 1); // 1 for 'For'
      await daoGovernor.connect(voter2).castVote(proposalId, 1); // 1 for 'For'

      // Move past the voting period // might need to use blocks
      // await time.increaseTo((await daoGovernor.votingPeriod()) + (BigInt(1)));
      await mine((await daoGovernor.votingPeriod()) + (BigInt(1)));

      // check if proposal is ready to queue
      expect(await daoGovernor.connect(admin).proposalNeedsQueuing(proposalId)).to.be.true;


      // Queue and execute the proposal
      await expect(daoGovernor.connect(admin).queue([await daoToken.getAddress()], [0], [toggleTransferabilityCalldata], ethers.keccak256(ethers.toUtf8Bytes(proposalDescription))))
        .to.emit(daoGovernor, "ProposalQueued")


      // Simulate timelock delay
      // await mine((await timelock.getMinDelay()) + (BigInt(1)));
      await time.increase((await timelock.getMinDelay()) + (BigInt(1)));

      // Execute the proposal
      await expect(daoGovernor.connect(admin).execute([await daoToken.getAddress()], [0], [toggleTransferabilityCalldata], ethers.keccak256(ethers.toUtf8Bytes(proposalDescription))))
        .to.emit(daoGovernor, "ProposalExecuted")
        .withArgs(proposalId);

      // Verify the token transferability is toggled
      expect(await daoToken.isTokenTransferable()).to.be.true;

    });
  })
});
