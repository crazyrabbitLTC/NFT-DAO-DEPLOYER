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
    const targets: string[] = ["0x0000000000000000000000000000000000000000"]; // Array of target addresses for the proposal calls
    const values: string[] = ["0"]; // Array of ether values for the proposal calls
    const calldatas: string[] = ["0x"]; // Array of calldatas for the proposal calls
    const description = "Test Proposal"; // Description of the proposal

    beforeEach(async function () {
        // Setup a proposal
        proposalId = await daoGovernor.hashProposal(targets, values, calldatas, ethers.keccak256(ethers.toUtf8Bytes(description)));
        await daoGovernor.connect(admin).propose(targets, values, calldatas, description);
    });

    it("should create a proposal with correct parameters", async function () {
        expect(await daoGovernor.proposalCount()).to.equal(1);
        const proposal = await daoGovernor.proposalDetails(proposalId);
        expect(proposal[0]).to.deep.equal(targets);
        expect(proposal[1]).to.deep.equal(values);
        expect(proposal[2]).to.deep.equal(calldatas);
        expect(proposal[3]).to.equal(ethers.keccak256(ethers.toUtf8Bytes(description)));
    });

    // Additional tests can be added as needed
});

    // Additional tests for specific contract functionalities
});
