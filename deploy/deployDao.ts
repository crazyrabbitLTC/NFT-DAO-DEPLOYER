// scripts/deployDAO.ts

import { ethers } from "hardhat";
import { config } from "./daoConfig";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DAOToken
  const DAOTokenFactory = await ethers.getContractFactory("DAOToken");
  const daoToken = await DAOTokenFactory.deploy(config.baseURI, config.tokenName, config.tokenSymbol);
  await daoToken.waitForDeployment();
  console.log("DAOToken deployed to:", await daoToken.getAddress());

  // Deploy TimelockController
  const TimelockControllerFactory = await ethers.getContractFactory("TimelockController");
  const timelock = await TimelockControllerFactory.deploy(
    config.minDelay,
    config.proposers.length > 0 ? config.proposers : [deployer.address],
    config.executors.length > 0 ? config.executors : [deployer.address],
    config.admin || deployer.address
  );
  await timelock.waitForDeployment();
  console.log("TimelockController deployed to:", await timelock.getAddress());

  // Deploy DAOGovernor
  const DAOGovernorFactory = await ethers.getContractFactory("DAOGovernor");
  const daoGovernor = await DAOGovernorFactory.deploy(
    await daoToken.getAddress(),
   await timelock.getAddress(),
    config.governorName,
    config.votingPeriod,
    config.votingDelay,
    config.proposalThreshold,
    config.percentageQuorum
  );
  await daoGovernor.waitForDeployment();
  console.log("DAOGovernor deployed to:", await daoGovernor.getAddress());

  // Mint tokens and set up roles
  for (const recipient of config.tokenRecipients) {
    await daoToken.safeMint(recipient, `tokenURI${config.tokenRecipients.indexOf(recipient)}`);
  }
  console.log("Tokens minted to recipients");

  const MINTER_ROLE = await daoToken.MINTER_ROLE();
  const DEFAULT_ADMIN_ROLE = await daoToken.DEFAULT_ADMIN_ROLE();
  await daoToken.grantRole(MINTER_ROLE, await daoGovernor.getAddress());
  await daoToken.grantRole(DEFAULT_ADMIN_ROLE, await daoGovernor.getAddress());
  await daoToken.renounceRole(MINTER_ROLE, await deployer.getAddress());
  await daoToken.renounceRole(DEFAULT_ADMIN_ROLE, await deployer.getAddress());

  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, await daoGovernor.getAddress());
  await timelock.grantRole(EXECUTOR_ROLE, await daoGovernor.getAddress());
  await timelock.grantRole(CANCELLER_ROLE, await daoGovernor.getAddress());
  await timelock.renounceRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log("DAO setup complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
