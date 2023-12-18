import { expect } from "chai";
import { ethers } from "hardhat";
import type { DAOToken } from "../../types"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DAOToken Contract", function () {
  let daoToken: DAOToken;
  let admin: SignerWithAddress, minter: SignerWithAddress, user: SignerWithAddress;
  const baseURI = "https://base.uri/";
  beforeEach(async function () {
    // Deploy the DAOToken contract
    const DAOTokenFactory = await ethers.getContractFactory("DAOToken");
    [admin, minter, user] = await ethers.getSigners();
    daoToken = await DAOTokenFactory.deploy(baseURI, "DAOToken", "DAO");

    // Grant MINTER_ROLE to minter
    await daoToken.grantRole(ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE")), minter.address);
  });

  describe("Access Control", function () {
    it("should allow only admin to set Base URI", async function () {
      await expect(daoToken.connect(minter).setBaseURI(baseURI)).to.be.reverted;
      await expect(daoToken.connect(admin).setBaseURI(baseURI)).to.not.be.reverted;
    });

    it("should allow only minter to mint new tokens", async function () {
      await expect(daoToken.connect(user).safeMint(user.address, "uri")).to.be.reverted;
      await expect(daoToken.connect(minter).safeMint(user.address, "uri")).to.not.be.reverted;
    });
  });

  describe("Minting", function () {
    it("should mint token with correct URI", async function () {
      await daoToken.connect(minter).safeMint(user.address, "tokenURI");
      expect(await daoToken.tokenURI(0)).to.equal(baseURI);
    });
  });

  describe("Base URI", function () {
    it("should update base URI correctly", async function () {
      await daoToken.connect(admin).setBaseURI(baseURI);
      expect(await daoToken.baseURI()).to.equal(baseURI);
    });

    it("should return correct token URI when individual URI endings are not enabled", async function () {
      await daoToken.connect(minter).safeMint(user.address, "");
      expect(await daoToken.individualURI()).to.be.equal(false);
      expect(await daoToken.tokenURI(0)).to.equal(baseURI);
    });

    it("should return correct token URI when individual URI endings are enabled", async function () {
      const tokenNumber = 0;
      const customURIEnding = "hello";
      await daoToken.connect(minter).safeMint(user.address, customURIEnding);
      await expect(daoToken.connect(admin).toggleIndividualURI()).to.emit(daoToken, "IsIndividualURIEnabled").withArgs(true);
      expect(await daoToken.tokenURI(tokenNumber)).to.equal(baseURI.concat(customURIEnding));
    });

    it("should return correct token URI when individual URI endings are enabled even for tokens minted previously", async function () {
      const tokenNumber = 0;
      const secondTokenNumber = 1;
      const customURIEnding = "hello";
      await daoToken.connect(minter).safeMint(user.address, customURIEnding);
      await daoToken.connect(minter).safeMint(user.address, "");

      await expect(daoToken.connect(admin).toggleIndividualURI()).to.emit(daoToken, "IsIndividualURIEnabled").withArgs(true);
      expect(await daoToken.tokenURI(tokenNumber)).to.equal(baseURI.concat(customURIEnding));
      expect(await daoToken.tokenURI(secondTokenNumber)).to.equal(baseURI.concat(secondTokenNumber.toString()));

    });

  });

  describe("Transferability", function () {
    beforeEach(async function () {
      await daoToken.connect(minter).safeMint(admin.address, baseURI);
    });
    it("should toggle token transferability correctly checking permissions", async function () {
      await expect(daoToken.connect(user).toggleTokenTransferability()).to.be.reverted;
      await expect(daoToken.connect(admin).toggleTokenTransferability()).to.not.be.reverted;
    })

    it("should toggle token transferability correctly ", async function () {
      await expect(daoToken.connect(admin).toggleTokenTransferability()).to.emit(daoToken, "IsTokenTransferable").withArgs(true);
      await expect(daoToken.connect(admin).toggleTokenTransferability()).to.emit(daoToken, "IsTokenTransferable").withArgs(false);
    })

    it("should transfer tokens when token transferability is enabled", async function () {
      await daoToken.toggleTokenTransferability();
      await daoToken.connect(admin).transferFrom(admin.address, user.address, 0);
      expect(await daoToken.ownerOf(0)).to.equal(user.address);
    });

    it("should not transfer tokens when token transferability is disabled", async function () {
      await expect(daoToken.connect(admin).transferFrom(admin.address, user.address, 0)).to.be.revertedWithCustomError(daoToken, "TokenIsNonTransferable");
    });

    // Additional tests for enumeration, balance, etc.
  });


  describe("ERC721 Compliance", function () {
    beforeEach(async function () {
      await daoToken.connect(minter).safeMint(admin.address, baseURI);
    });

    it("should transfer tokens correctly", async function () {
      await daoToken.toggleTokenTransferability();
      await daoToken.connect(admin).transferFrom(admin.address, user.address, 0);
      expect(await daoToken.ownerOf(0)).to.equal(user.address);
    });

    // Additional tests for enumeration, balance, etc.
  });

  // Additional tests for ERC721Votes and other functionalities.
});
