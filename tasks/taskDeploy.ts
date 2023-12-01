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
  .addParam("baseuri", "Base URI")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("DAOToken");
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
    const governorFactory = await ethers.getContractFactory("DAOGovernor");
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

task("task:deployNFTDAO")
  .addParam("name", "Token Name")
  .addParam("symbol", "Token Symbol")
  .addParam("baseuri", "Base URI")
  .addParam("governorname", "Governor Name")
  .addParam("votingperiod", "Voting Period")
  .addParam("votingdelay", "Voting Delay")
  .addParam("proposalthreshold", "Proposal Threshold")
  .addParam("percentagequorum", "Percentage Quorum")
  .addParam("mindelay", "Min Delay")
  .addParam("proposers", "Proposers")
  .addParam("executors", "Executors")
  .addParam("admin", "Admin")
  .addParam("tokenrecipients", "Token Recipients")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("DAOToken");
    const governorFactory = await ethers.getContractFactory("DAOGovernor");
    const timelockFactory = await ethers.getContractFactory("TimelockController");

    const { name,
      symbol,
      baseURI,
      governorName,
      votingPeriod,
      votingDelay,
      proposalThreshold,
      percentageQuorum,
      minDelay,
      proposers,
      executors,
      admin,
      tokenRecipients } = taskArguments;

    const token = await tokenFactory.connect(signers[0]).deploy(baseURI, name, symbol);
    await token.waitForDeployment();

    const timelock = await timelockFactory.connect(signers[0]).deploy(minDelay, proposers, executors, admin ? admin : signers[0].address);
    await timelock.waitForDeployment();

    const governor = await governorFactory.connect(signers[0]).deploy(await token.getAddress(), await timelock.getAddress(), governorName, votingPeriod, votingDelay, proposalThreshold, percentageQuorum);
    await governor.waitForDeployment();

    // Token
    // mint tokens based on settings
    const mintPromises = [];
    for (let i = 0; i < tokenRecipients.length; i++) {
      const tokenURI = `tokenURI${i}`; // Generate a unique URI for each token
      const mintPromise = token.connect(signers[0]).safeMint(tokenRecipients[i], tokenURI);
      mintPromises.push(mintPromise);
    }
    await Promise.all(mintPromises);

    // renounce the minter role
    await token.connect(signers[0]).renounceRole(await token.MINTER_ROLE(), signers[0].address);
    // give minter role to daoGovernor
    await token.connect(signers[0]).grantRole(await token.MINTER_ROLE(), await governor.getAddress());
    // give default admin to governor
    await token.connect(signers[0]).grantRole(await token.DEFAULT_ADMIN_ROLE(), await governor.getAddress());
    // renounce the default admin roll
    await token.connect(signers[0]).renounceRole(await token.DEFAULT_ADMIN_ROLE(), signers[0].address);

    // Timelock
    // Set the governor as the admin
    await timelock.connect(signers[0]).grantRole(await timelock.DEFAULT_ADMIN_ROLE(), await governor.getAddress());
    // Set the governor as the proposer
    await timelock.connect(signers[0]).grantRole(await timelock.PROPOSER_ROLE(), await governor.getAddress());
    // Set the governor as the executor
    await timelock.connect(signers[0]).grantRole(await timelock.EXECUTOR_ROLE(), await governor.getAddress());
    // Set the governor as the Canceler
    await timelock.connect(signers[0]).grantRole(await timelock.CANCELLER_ROLE(), await governor.getAddress());
    // renounce the admin role
    await timelock.connect(signers[0]).renounceRole(await timelock.DEFAULT_ADMIN_ROLE(), signers[0].address);



  });


  // npx hardhat task:deployNFTDAO --name "MyNFT" --symbol "MNFT" --baseuri "https://my-nft-uri.com/" --governorname "MyDAOGovernor" --votingperiod 5760 --votingdelay 576 --proposalthreshold 1 --percentagequorum 1 --mindelay 3600 --proposers "" --executors "" --admin "" --tokenrecipients ""
