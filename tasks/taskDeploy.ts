import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:deployGreeter")
  .addParam("greeting", "Say hello, be nice")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const greeterFactory = await ethers.getContractFactory("Greeter");
    const greeter = await greeterFactory.connect(signers[0]).deploy(taskArguments.greeting);
    await greeter.waitForDeployment();
    console.log("Greeter deployed to: ", await greeter.getAddress());
  });

task("task:deployNFTToken")
  .addParam("name", "Token Name")
  .addParam("symbol", "Token Symbol")
  .addParam("baseURI", "Base URI")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("ERC721Token");
    const { baseURI, name, symbol } = taskArguments;
    const token = await tokenFactory.connect(signers[0]).deploy(baseURI, name, symbol);
    await token.waitForDeployment();
    console.log("NFToken deployed to: ", await token.getAddress());
  });

task("task:deployNFTGovernor")
  .addParam("tokenAddress", "Token Address")
  .addParam("timelockAddress", "Timelock Address")
  .addParam("governorName", "Governor Name")
  .addParam("votingPeriod", "Voting Period")
  .addParam("votingDelay", "Voting Delay")
  .addParam("proposalThreshold", "Proposal Threshold")
  .addParam("percentageQuorum", "Percentage Quorum")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const governorFactory = await ethers.getContractFactory("Governor");
    const { tokenAddress, timelockAddress, governorName, votingPeriod, votingDelay, proposalThreshold, percentageQuorum } = taskArguments;

    const governor = await governorFactory.connect(signers[0]).deploy(tokenAddress, timelockAddress, governorName, votingPeriod, votingDelay, proposalThreshold, percentageQuorum);
    await governor.waitForDeployment();
    console.log("NFToken deployed to: ", await governor.getAddress());
  });

task("task:deployTimelock")
  .addParam("minDelay", "Min Delay")
  .addParam("proposers", "Proposers")
  .addParam("executors", "Executors")
  .addParam("admin", "Admin")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const timelockFactory = await ethers.getContractFactory("Timelock");
    const { minDelay, proposers, executors, admin } = taskArguments;

    const timelock = await timelockFactory.connect(signers[0]).deploy(minDelay, proposers, executors, admin);
    await timelock.waitForDeployment();
    console.log("Timelock deployed to: ", await timelock.getAddress());
  });
