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
  tokenRecipients: ["0x489e3E846bB550CB7b023108ce071bB39Fd23Cd8",
    "0x09dD35BbF83e64E90F998e54C9D0ecB9B0E614B5",
    "0xb5B069370Ef24BC67F114e185D185063CE3479f8",
    "0x7f953f11343408ebccaecd04eb0d1e6bacdef87f",
    "0xd00e5109a8b25cec2b6f5982646de18abeaf73b1",
    "0xc682131e3b82d2ba073f33f0889c36e52b4ba402",
    "0xe7358d1805f27BAe1031c37d54e29888c7C87622",
    "0x28Cd26d85b4ac655A489Aa3f259F81283BD1A804"] // Add recipient addresses
};
