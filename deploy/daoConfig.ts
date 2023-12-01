// scripts/daoConfig.ts

export const config = {
  tokenName: "MyNFT",
  tokenSymbol: "MNFT",
  baseURI: "https://my-nft-uri.com/",
  governorName: "MyDAOGovernor",
  votingPeriod: 5760,
  votingDelay: 576,
  proposalThreshold: 1,
  percentageQuorum: 4,
  minDelay: 3600,
  proposers: [], // Add proposer addresses
  executors: [], // Add executor addresses
  admin: "", // Add admin address if different from deployer
  tokenRecipients: [] // Add recipient addresses
};
